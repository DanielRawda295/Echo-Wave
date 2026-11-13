import { GoogleOAuthService } from './google-oauth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

function googleSetup() {
  const user = {
    id: 7,
    email: 'updated@example.com',
    username: 'Test',
    role: 'listener',
    googleId: 'subject',
    tokenVersion: 2,
  };
  const users = {
    findByGoogleId: jest.fn().mockResolvedValue(user),
    findByEmail: jest.fn().mockResolvedValue(null),
    isDeactivatedEmail: jest.fn().mockResolvedValue(false),
    isDeactivatedGoogleId: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockResolvedValue(user),
  };
  const jwt = { sign: jest.fn().mockReturnValue('jwt') };
  const config = { get: () => 'public-client-id' } as unknown as ConfigService;
  const service = new GoogleOAuthService(
    config,
    users as unknown as UsersService,
    jwt as unknown as JwtService,
  );
  const challenge = service.createChallenge();
  const verify = jest
    .spyOn(service, 'verifyGoogleToken')
    .mockResolvedValue({
      sub: 'subject',
      email: 'original@example.com',
      nonce: challenge.nonce,
    });
  return { service, challenge, verify, users, jwt };
}

describe('Google challenge and identity regression tests', () => {
  afterEach(() => jest.restoreAllMocks());

  it('signs in an existing subject after its profile email changes', async () => {
    const { service, challenge, users, jwt } = googleSetup();
    const result = await service.googleLogin('token', challenge.challengeId);
    expect(result.user.id).toBe(7);
    expect(users.findByGoogleId).toHaveBeenCalledWith('subject');
    expect(users.create).not.toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ version: 2, sub: 7 }),
    );
  });

  it('rejects a missing challenge or mismatched Google nonce', async () => {
    const { service, challenge, verify, jwt } = googleSetup();
    await expect(service.googleLogin('token', 'missing')).rejects.toThrow(
      'expired',
    );
    verify.mockResolvedValue({
      sub: 'subject',
      email: 'test@example.com',
      nonce: 'wrong',
    });
    await expect(
      service.googleLogin('token', challenge.challengeId),
    ).rejects.toThrow('matched');
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('allows only one use, including concurrent attempts', async () => {
    const { service, challenge, jwt } = googleSetup();
    const results = await Promise.allSettled([
      service.googleLogin('token', challenge.challengeId),
      service.googleLogin('token', challenge.challengeId),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  it('expires login attempts after five minutes', async () => {
    const { service, challenge } = googleSetup();
    jest.spyOn(Date, 'now').mockReturnValue(challenge.expiresAt + 1);
    await expect(
      service.googleLogin('token', challenge.challengeId),
    ).rejects.toThrow('expired');
  });

  it('does not merge a password account merely because the email matches', async () => {
    const { service, challenge, users, jwt } = googleSetup();
    users.findByGoogleId.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue({ id: 99, password: 'existing-hash' });
    await expect(
      service.googleLogin('token', challenge.challengeId),
    ).rejects.toThrow('automatic Google linking is disabled');
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(users.create).not.toHaveBeenCalled();
  });
});

describe('JWT session version regression tests', () => {
  it('rejects old and unversioned sessions after recovery while accepting a fresh session', async () => {
    let version = 0;
    const users = {
      findById: async () => ({
        id: 1,
        tokenVersion: version,
        email: 'test@example.com',
        role: 'listener',
      }),
    };
    const config = {
      get: () => 'test-signing-secret',
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(config, users as unknown as UsersService);
    await expect(strategy.validate({ sub: 1, version: 0 })).resolves.toEqual(
      expect.objectContaining({ sub: 1 }),
    );
    version = 1;
    await expect(strategy.validate({ sub: 1, version: 0 })).rejects.toThrow();
    await expect(strategy.validate({ sub: 1 })).rejects.toThrow();
    await expect(strategy.validate({ sub: 1, version: 1 })).resolves.toEqual(
      expect.objectContaining({ sub: 1 }),
    );
  });
});
