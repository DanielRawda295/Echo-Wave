import { Test } from '@nestjs/testing';
import { INestApplication, ServiceUnavailableException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TracksController } from './tracks.controller';
import { TracksService } from './tracks.service';
import { MediaStorageService } from './media-storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('track upload and listing HTTP flow', () => {
  let app: INestApplication;
  let rows: any[];
  const media = {
    save: jest.fn(), cleanup: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    rows = [];
    media.save.mockReset().mockImplementation(async (_file, kind) => `/uploads/${kind}/test.mp3`);
    media.cleanup.mockClear();
    const repo = {
      create: (track: any) => track,
      save: async (track: any) => {
        const saved = { ...track, id: rows.length + 1, createdAt: new Date() };
        rows.push(saved);
        return saved;
      },
      find: async (options: any) => rows.filter(track => !options.where || track.uploader.id === options.where.uploader.id),
    };
    const module = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [
        { provide: TracksService, useValue: new TracksService(repo as any, {} as any, {} as any, media as any) },
        { provide: MediaStorageService, useValue: media },
      ],
    }).overrideGuard(JwtAuthGuard).useValue({
      canActivate: context => { context.switchToHttp().getRequest().user = { sub: 7 }; return true; },
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => { await app.close(); });

  it.each([false, true])('publishes multipart audio (cover: %s) into community and the owner list', async cover => {
    let upload = request(app.getHttpServer()).post('/tracks/upload')
      .field('title', 'Published song').field('artist', 'Artist').field('genre', 'Pop')
      .attach('audio', Buffer.from('ID3test-audio'), { filename: 'song.mp3', contentType: 'audio/mpeg' });
    if (cover) upload = upload.attach('cover', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), { filename: 'cover.png', contentType: 'image/png' });
    const saved = await upload.expect(201);
    expect(saved.body).toMatchObject({ id: 1, title: 'Published song', uploader: { id: 7 } });
    for (const path of ['/tracks', '/tracks/me/list']) {
      const listed = await request(app.getHttpServer()).get(path).expect(200).expect('Cache-Control', 'no-store');
      expect(listed.body.map(track => track.id)).toContain(saved.body.id);
    }
    rows.push({ id: 2, title: 'Someone else', uploader: { id: 8 } });
    const mine = await request(app.getHttpServer()).get('/tracks/me/list').expect(200);
    expect(mine.body.map(track => track.id)).toEqual([1]);
  });

  it('does not report success or save a track if storage fails', async () => {
    media.save.mockRejectedValue(new ServiceUnavailableException('Storage unavailable'));
    await request(app.getHttpServer()).post('/tracks/upload')
      .field('title', 'Failed song').field('artist', 'Artist')
      .attach('audio', Buffer.from('ID3test-audio'), { filename: 'song.mp3', contentType: 'audio/mpeg' })
      .expect(503);
    expect(rows).toEqual([]);
  });
});
