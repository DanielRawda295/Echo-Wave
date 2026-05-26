import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackLike } from './entities/track-like.entity';
import { TrackComment } from './entities/track-comment.entity';
import { CreateTrackCommentDto } from './dto/create-track-comment.dto';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track) private repo: Repository<Track>,
    @InjectRepository(TrackLike) private likeRepo: Repository<TrackLike>,
    @InjectRepository(TrackComment) private commentRepo: Repository<TrackComment>,
  ) {}

  private sanitize(track: any) {
    if (track?.uploader) {
      delete track.uploader.password;
    }
    return track;
  }

  private sanitizeComment(comment: any) {
    if (comment?.user) {
      delete comment.user.password;
    }
    return comment;
  }

  async upload(dto: CreateTrackDto, fileUrl: string, coverUrl: string | undefined, uploaderId: number) {
    const track = this.repo.create({ ...dto, fileUrl, coverUrl, uploader: { id: uploaderId } });
    return this.repo.save(track);
  }

  async stream(id: number) {
    const track = await this.repo.findOne({ where: { id } });
    if (track) {
      track.playCount += 1;
      await this.repo.save(track);
    }
    return this.sanitize(track as any);
  }

  async findAll() {
    const tracks = await this.repo.find({ relations: ['uploader'] });
    return tracks.map((t: any) => this.sanitize(t));
  }

  async findMine(uploaderId: number) {
    const tracks = await this.repo.find({
      where: { uploader: { id: uploaderId } as any },
      relations: ['uploader'],
      order: { createdAt: 'DESC' as any },
    });
    return tracks.map((t: any) => this.sanitize(t));
  }

  async search(term: string) {
    const q = (term || '').trim().toLowerCase();
    if (!q) return [];

    const tracks = await this.repo
      .createQueryBuilder('track')
      .leftJoinAndSelect('track.uploader', 'uploader')
      .where('LOWER(track.title) LIKE :q', { q: `%${q}%` })
      .orWhere('LOWER(track.artist) LIKE :q', { q: `%${q}%` })
      .orWhere('LOWER(track.genre) LIKE :q', { q: `%${q}%` })
      .orderBy('track.createdAt', 'DESC')
      .limit(50)
      .getMany();

    return tracks.map((t: any) => this.sanitize(t));
  }

  async findById(id: number) {
    const track = await this.repo.findOne({ where: { id }, relations: ['uploader'] });
    return this.sanitize(track as any);
  }

  async getLikeCount(trackId: number) {
    return this.likeRepo.count({ where: { track: { id: trackId } as any } });
  }

  async isLikedBy(trackId: number, userId: number) {
    const row = await this.likeRepo.findOne({
      where: { track: { id: trackId } as any, user: { id: userId } as any },
    });
    return !!row;
  }

  async toggleLike(trackId: number, userId: number) {
    const track = await this.repo.findOne({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const existing = await this.likeRepo.findOne({
      where: { track: { id: trackId } as any, user: { id: userId } as any },
    });

    if (existing) {
      await this.likeRepo.delete({ id: existing.id });
    } else {
      await this.likeRepo.save(
        this.likeRepo.create({ track: { id: trackId } as any, user: { id: userId } as any })
      );
    }

    const likeCount = await this.getLikeCount(trackId);
    const liked = await this.isLikedBy(trackId, userId);
    return { trackId, likeCount, liked };
  }

  async listComments(trackId: number) {
    const track = await this.repo.findOne({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const rows = await this.commentRepo.find({
      where: { track: { id: trackId } as any },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return rows.map((c: any) => this.sanitizeComment(c));
  }

  async addComment(trackId: number, userId: number, dto: CreateTrackCommentDto) {
    const track = await this.repo.findOne({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    const row = await this.commentRepo.save(
      this.commentRepo.create({
        track: { id: trackId } as any,
        user: { id: userId } as any,
        text: dto.text.trim(),
      })
    );

    const hydrated = await this.commentRepo.findOne({ where: { id: row.id }, relations: ['user'] });
    return this.sanitizeComment(hydrated as any);
  }

  async getLikeInfoBulk(trackIds: number[], userId: number) {
    const ids = Array.from(new Set(trackIds.filter((n) => Number.isFinite(n))));
    if (!ids.length) return [];

    const counts = await this.likeRepo
      .createQueryBuilder('tl')
      .select('tl.trackId', 'trackId')
      .addSelect('COUNT(*)', 'likeCount')
      .where('tl.trackId IN (:...ids)', { ids })
      .groupBy('tl.trackId')
      .getRawMany();

    const likedRows = await this.likeRepo
      .createQueryBuilder('tl')
      .select('tl.trackId', 'trackId')
      .where('tl.trackId IN (:...ids)', { ids })
      .andWhere('tl.userId = :userId', { userId })
      .getRawMany();

    const likedSet = new Set(likedRows.map((r: any) => Number(r.trackId)));
    const countMap = new Map<number, number>(counts.map((r: any) => [Number(r.trackId), Number(r.likeCount)]));

    return ids.map((trackId) => ({
      trackId,
      likeCount: countMap.get(trackId) || 0,
      liked: likedSet.has(trackId),
    }));
  }

  private async mustOwnTrack(id: number, uploaderId: number) {
    const track = await this.repo.findOne({ where: { id }, relations: ['uploader'] });
    if (!track) throw new NotFoundException('Track not found');
    if ((track.uploader as any)?.id !== uploaderId) {
      throw new ForbiddenException('You do not have access to this track');
    }
    return track;
  }

  async updateTrack(id: number, uploaderId: number, dto: UpdateTrackDto) {
    const track = await this.mustOwnTrack(id, uploaderId);
    Object.assign(track, dto);
    return this.sanitize(await this.repo.save(track) as any);
  }

  async deleteTrack(id: number, uploaderId: number) {
    await this.mustOwnTrack(id, uploaderId);
    await this.repo.delete({ id });
    return { success: true };
  }
}
