import { MediaStorageService } from './media-storage.service';
import type { DataSource } from 'typeorm';

describe('Durable media cleanup', () => {
  it('retains failed jobs for retry and removes them after success', async () => {
    const jobs = {
      find: jest
        .fn()
        .mockResolvedValue([
          { id: 1, url: 'https://example.invalid/test.mp3' },
        ]),
      delete: jest.fn(),
    };
    const source = {
      isInitialized: true,
      getRepository: () => jobs,
    } as unknown as DataSource;
    const service = new MediaStorageService(source);
    const remove = jest
      .spyOn(service, 'remove')
      .mockRejectedValueOnce(new Error('Storage offline'))
      .mockResolvedValueOnce(undefined);
    await service.drainQueue();
    expect(jobs.delete).not.toHaveBeenCalled();
    await service.drainQueue();
    expect(remove).toHaveBeenCalledTimes(2);
    expect(jobs.delete).toHaveBeenCalledWith(1);
  });

  it('does not overlap queue drains on the same instance', async () => {
    let release!: () => void;
    const wait = new Promise<void>((resolve) => {
      release = resolve;
    });
    const jobs = {
      find: jest.fn().mockResolvedValue([{ id: 1, url: 'test' }]),
      delete: jest.fn(),
    };
    const service = new MediaStorageService({
      isInitialized: true,
      getRepository: () => jobs,
    } as unknown as DataSource);
    jest.spyOn(service, 'remove').mockImplementation(() => wait);
    const first = service.drainQueue();
    await service.drainQueue();
    expect(jobs.find).toHaveBeenCalledTimes(1);
    release();
    await first;
  });
});
