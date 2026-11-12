import { ExecutionContext } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

describe('auth rate limiting', () => {
  const handler = function resetPassword() {};
  const context = (ip: string) => ({
    switchToHttp: () => ({ getRequest: () => ({ ip }) }),
    getHandler: () => handler,
  }) as unknown as ExecutionContext;

  afterEach(() => jest.restoreAllMocks());
  it('blocks repeated attempts, isolates visitors, and permits requests after expiry', () => {
    const clock = jest.spyOn(Date, 'now').mockReturnValue(100000);
    const guard = new AuthRateLimitGuard();
    for (let i = 0; i < 10; i++) expect(guard.canActivate(context('visitor-one'))).toBe(true);
    expect(() => guard.canActivate(context('visitor-one'))).toThrow('Too many attempts');
    expect(guard.canActivate(context('visitor-two'))).toBe(true);
    clock.mockReturnValue(160001);
    expect(guard.canActivate(context('visitor-one'))).toBe(true);
  });
});
