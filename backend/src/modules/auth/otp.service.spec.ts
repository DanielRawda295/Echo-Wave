import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { OtpService } from './otp.service';
import { MailService } from './mail.service';

describe('password-reset codes', () => {
  const email = 'listener@example.com';
  const mail = { isAvailable: () => true } as MailService;

  it('enforces the resend limit before changing existing codes', async () => {
    const repo = { count: jest.fn().mockResolvedValue(3), update: jest.fn(), save: jest.fn() };
    const service = new OtpService(repo as unknown as Repository<Otp>, mail);
    await expect(service.generateOtp(email)).rejects.toThrow('Too many reset requests');
    expect(repo.update).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(repo.count.mock.calls[0][0].where.createdAt).toBeDefined();
  });

  it('does not generate a fallback code when persistence fails', async () => {
    const repo = {
      count: jest.fn().mockResolvedValue(0), update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockImplementation(value => value),
      save: jest.fn().mockRejectedValue(new Error('database unavailable')),
    };
    await expect(new OtpService(repo as unknown as Repository<Otp>, mail).generateOtp(email))
      .rejects.toThrow('database unavailable');
  });

  it('atomically consumes only an unused, unexpired code', async () => {
    const repo = { update: jest.fn().mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 }) };
    const service = new OtpService(repo as unknown as Repository<Otp>, mail);
    expect(await service.validateOtp(email, '123456')).toBe(true);
    expect(await service.validateOtp(email, '123456')).toBe(false);
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({
      email, code: '123456', isUsed: false, expiresAt: expect.anything(),
    }), { isUsed: true });
  });

  it('rejects malformed codes before querying the database', async () => {
    const repo = { update: jest.fn() };
    expect(await new OtpService(repo as unknown as Repository<Otp>, mail).validateOtp(email, '123')).toBe(false);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
