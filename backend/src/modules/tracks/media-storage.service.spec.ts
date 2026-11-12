import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { MediaStorageService, type MediaFile } from './media-storage.service';
import { TracksController } from './tracks.controller';

describe('hosted media storage', () => {
  const originalEnv = { ...process.env };
  const audio: MediaFile = { buffer: Buffer.from('ID3test-audio'), mimetype: 'application/octet-stream', originalname: 'song.mp3' };
  let fetchMock: jest.SpyInstance;
  let storage: MediaStorageService;

  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'sb_secret_test-only';
    process.env.SUPABASE_STORAGE_BUCKET = 'echowave-media';
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    storage = new MediaStorageService();
  });

  afterEach(() => { process.env = { ...originalEnv }; jest.restoreAllMocks(); });

  it('stores audio under an account path and returns a public URL without credentials', async () => {
    const url = await storage.save(audio, 'audio', 7);
    expect(url).toMatch(/^https:\/\/example\.supabase\.co\/storage\/v1\/object\/public\/echowave-media\/audio\/7\/[a-f0-9-]+\.mp3$/);
    const [endpoint, request] = fetchMock.mock.calls[0];
    expect(endpoint).not.toContain('sb_secret');
    expect(request.headers.apikey).toBe('sb_secret_test-only');
    expect(request.headers).not.toHaveProperty('Authorization');
    expect(request.headers['Content-Type']).toBe('audio/mpeg');
    expect(request.headers['x-upsert']).toBe('false');
    expect(url).not.toContain('sb_secret');
  });

  it('rejects a disguised document and an unsupported SVG cover before sending data', async () => {
    const fake = { ...audio, buffer: Buffer.from('<html>not media</html>') };
    await expect(storage.save(fake, 'audio', 7)).rejects.toBeInstanceOf(BadRequestException);
    await expect(storage.save({ ...fake, originalname: 'cover.svg', mimetype: 'image/svg+xml' }, 'images', 7))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not leak provider responses into upload errors', async () => {
    fetchMock.mockResolvedValue(new Response('private provider diagnostic', { status: 403 }));
    await expect(storage.save(audio, 'audio', 7)).rejects.toThrow('Media upload failed. Please try again.');
  });

  it('does not delete media on an unrelated origin or a path outside the configured bucket', async () => {
    await storage.remove('https://other.supabase.co/storage/v1/object/public/echowave-media/audio/7/test.mp3');
    await storage.remove('https://example.supabase.co/storage/v1/object/public/other/audio/7/test.mp3');
    await storage.remove('https://example.supabase.co/storage/v1/object/public/echowave-media/../private');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deletes only the exact generated object path', async () => {
    await storage.remove('https://example.supabase.co/storage/v1/object/public/echowave-media/audio/7/12345678-1234-1234-1234-123456789abc.mp3');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ prefixes: ['audio/7/12345678-1234-1234-1234-123456789abc.mp3'] });
  });

  it('cleans uploaded media when saving the track record fails', async () => {
    const tracks = { upload: jest.fn().mockRejectedValue(new Error('Database unavailable')) };
    const media = { save: jest.fn().mockResolvedValue('https://example.supabase.co/audio.mp3'), cleanup: jest.fn().mockResolvedValue(undefined) };
    const controller = new TracksController(tracks as any, media as any);
    await expect(controller.upload({ audio: [audio] }, { title: 'Test', artist: 'Test' }, { user: { sub: 7 } }))
      .rejects.toThrow('Database unavailable');
    expect(media.cleanup).toHaveBeenCalledWith(['https://example.supabase.co/audio.mp3']);
  });

  it('cleans the audio if the cover upload fails, without saving a track record', async () => {
    const tracks = { upload: jest.fn() };
    const media = {
      save: jest.fn().mockResolvedValueOnce('https://example.supabase.co/audio.mp3')
        .mockRejectedValueOnce(new ServiceUnavailableException('Upload failed')),
      cleanup: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new TracksController(tracks as any, media as any);
    await expect(controller.upload({ audio: [audio], cover: [audio] }, { title: 'Test', artist: 'Test' }, { user: { sub: 7 } }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(tracks.upload).not.toHaveBeenCalled();
    expect(media.cleanup).toHaveBeenCalledWith(['https://example.supabase.co/audio.mp3']);
  });

  it('refuses to use local disk as a production fallback without storage credentials', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_URL;
    expect(() => new MediaStorageService()).toThrow('Set SUPABASE_URL');
  });
});
