import { BadRequestException, Injectable, Logger, Optional, ServiceUnavailableException, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MediaCleanupJob } from './entities/media-cleanup-job.entity';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { mediaStorageConfig } from './media-storage.config';

export type MediaFile = { buffer: Buffer; mimetype: string; originalname: string };
type MediaKind = 'audio' | 'images';

@Injectable()
export class MediaStorageService implements OnModuleInit, OnModuleDestroy {
  private readonly config = mediaStorageConfig(process.env);
  private readonly logger = new Logger(MediaStorageService.name);
  private timer?: ReturnType<typeof setInterval>;
  private draining = false;

  constructor(@Optional() private readonly source?: DataSource) {}

  onModuleInit() {
    if (!this.source) return;
    void this.drainQueue();
    this.timer = setInterval(() => { void this.drainQueue(); }, 60000);
    this.timer.unref();
  }

  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async drainQueue(): Promise<void> {
    if (!this.source?.isInitialized || this.draining) return;
    this.draining = true;
    try {
      const jobs = this.source.getRepository(MediaCleanupJob);
      for (const job of await jobs.find({ order: { id: 'ASC' }, take: 50 })) {
        try { await this.remove(job.url); await jobs.delete(job.id); }
        catch { this.logger.warn('Media cleanup is pending and will be retried.'); }
      }
    } catch { this.logger.warn('Media cleanup queue is temporarily unavailable.'); }
    finally { this.draining = false; }
  }

  private fileType(file: MediaFile, kind: MediaKind) {
    const data = file.buffer;
    if (!data?.length || data.length > 25 * 1024 * 1024) {
      throw new BadRequestException('Each file must contain data and be no larger than 25 MB.');
    }
    if (kind === 'audio') {
      const mp3 = data.subarray(0, 3).toString() === 'ID3' ||
        (data.length > 3 && data[0] === 0xff && (data[1] & 0xe0) === 0xe0);
      if (!mp3) throw new BadRequestException('Audio file must be an MP3.');
      return { extension: 'mp3', contentType: 'audio/mpeg' };
    }
    if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
      return { extension: 'jpg', contentType: 'image/jpeg' };
    }
    if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      return { extension: 'png', contentType: 'image/png' };
    }
    if (data.length >= 12 && data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') {
      return { extension: 'webp', contentType: 'image/webp' };
    }
    throw new BadRequestException('Cover must be a JPEG, PNG, or WebP image.');
  }

  async save(file: MediaFile, kind: MediaKind, userId: number): Promise<string> {
    const type = this.fileType(file, kind);
    const filename = `${randomUUID()}.${type.extension}`;
    if (!this.config) {
      const folder = join(process.cwd(), 'uploads', kind);
      await mkdir(folder, { recursive: true });
      await writeFile(join(folder, filename), file.buffer);
      return `/uploads/${kind}/${filename}`;
    }
    const objectPath = `${kind}/${userId}/${filename}`;
    let response: Response;
    try {
      response = await fetch(`${this.config.origin}/storage/v1/object/${this.config.bucket}/${objectPath}`, {
        method: 'POST',
        headers: { apikey: this.config.secret, 'Content-Type': type.contentType, 'x-upsert': 'false' },
        body: new Uint8Array(file.buffer),
        signal: AbortSignal.timeout(60000),
      });
    } catch {
      throw new ServiceUnavailableException('Media storage is temporarily unavailable. Please try again.');
    }
    if (!response.ok) {
      this.logger.warn(`Media upload rejected by storage (HTTP ${response.status}).`);
      throw new ServiceUnavailableException('Media upload failed. Please try again.');
    }
    return `${this.config.origin}/storage/v1/object/public/${this.config.bucket}/${objectPath}`;
  }

  async remove(url: string): Promise<void> {
    if (this.config) {
      const prefix = `${this.config.origin}/storage/v1/object/public/${this.config.bucket}/`;
      if (!url.startsWith(prefix)) return;
      const objectPath = url.slice(prefix.length);
      if (!/^(audio|images)\/\d+\/[a-f0-9-]+\.(mp3|jpg|png|webp)$/.test(objectPath)) return;
      const response = await fetch(`${this.config.origin}/storage/v1/object/${this.config.bucket}`, {
        method: 'DELETE',
        headers: { apikey: this.config.secret, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: [objectPath] }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('Storage cleanup failed.');
    } else {
      const match = url.match(/^\/uploads\/(audio|images)\/([\w-]+\.(?:mp3|jpe?g|png|webp))$/);
      if (!match) return;
      await unlink(join(process.cwd(), 'uploads', match[1], match[2])).catch(error => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }

  async cleanup(urls: (string | undefined)[]): Promise<void> {
    const results = await Promise.allSettled(urls.filter((url): url is string => !!url).map(url => this.remove(url)));
    if (results.some(result => result.status === 'rejected')) this.logger.warn('Some unused media files could not be cleaned up.');
  }
}
