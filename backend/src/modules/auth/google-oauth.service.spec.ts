import { GoogleOAuthService } from './google-oauth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
const verifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({ OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })) }));

describe('Google ID token verification', () => {
  const users = {} as UsersService;
  const jwt = {} as JwtService;
  beforeEach(() => verifyIdToken.mockReset());

  it('verifies tokens using only the configured client ID, without a client secret', async () => {
    const config = { get: (key: string) => key === 'GOOGLE_CLIENT_ID' ? 'public-client-id' : undefined } as ConfigService;
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'google-user', email: 'user@example.com', email_verified: true }) });
    const result = await new GoogleOAuthService(config, users, jwt).verifyGoogleToken('signed-id-token');
    expect(result.sub).toBe('google-user');
    expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 'signed-id-token', audience: 'public-client-id' });
  });

  it('rejects unverified emails before they can be linked to an existing account', async () => {
    const config = { get: () => 'public-client-id' } as unknown as ConfigService;
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'google-user', email: 'user@example.com', email_verified: false }) });
    await expect(new GoogleOAuthService(config, users, jwt).verifyGoogleToken('token')).rejects.toThrow('could not be verified');
  });

  it('reports missing configuration without exposing credentials', async () => {
    const config = { get: () => undefined } as unknown as ConfigService;
    await expect(new GoogleOAuthService(config, users, jwt).verifyGoogleToken('token')).rejects.toThrow('not configured');
    expect(verifyIdToken).not.toHaveBeenCalled();
  });
});
