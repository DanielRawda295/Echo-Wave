import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { GoogleOAuthService } from './google-oauth.service';

jest.mock('../users/users.service', () => ({ UsersService: class {} }));
jest.mock('./otp.service', () => ({ OtpService: class {} }));
jest.mock('./google-oauth.service', () => ({ GoogleOAuthService: class {} }));

describe('AuthService guest login', () => {
  const create = jest.fn();
  const sign = jest.fn();
  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    create.mockImplementation(async (data) => ({ id: 42, ...data }));
    sign.mockReturnValue('signed-guest-token');
    service = new AuthService(
      { create } as unknown as UsersService,
      { sign } as unknown as JwtService,
      {} as OtpService,
      {} as GoogleOAuthService,
    );
  });

  it('creates a listener and signs a token for the saved account', async () => {
    const result = await service.guestLogin();
    const account = create.mock.calls[0][0];
    expect(account).toEqual({
      email: expect.stringMatching(/^guest-[0-9a-f-]+@guest\.echowave\.invalid$/),
      username: 'Guest Listener',
      role: 'listener',
    });
    expect(sign).toHaveBeenCalledWith(
      { sub: 42, email: account.email, role: 'listener' },
      { expiresIn: '1d' },
    );
    expect(result.access_token).toBe('signed-guest-token');
    expect(result.user.id).toBe(42);
    expect(result.user).not.toHaveProperty('password');
  });

  it('uses a different account for each guest login', async () => {
    await Promise.all([service.guestLogin(), service.guestLogin()]);
    expect(create.mock.calls[0][0].email).not.toBe(create.mock.calls[1][0].email);
  });

  it('does not issue a token when account creation fails', async () => {
    create.mockRejectedValue(new Error('Database unavailable'));
    await expect(service.guestLogin()).rejects.toThrow('Database unavailable');
    expect(sign).not.toHaveBeenCalled();
  });
});
