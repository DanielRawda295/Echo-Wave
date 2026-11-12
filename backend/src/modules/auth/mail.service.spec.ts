import { MailService } from './mail.service';

describe('password-reset mail', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'production', BREVO_API_KEY: 'test-private-key', EMAIL_FROM: 'sender@example.com' };
  });
  afterEach(() => { process.env = { ...originalEnv }; global.fetch = originalFetch; });

  it('uses the HTTPS email API with the configured sender', async () => {
    const request = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = request;
    await new MailService().sendOtp('recipient@example.com', '123456');
    expect(request).toHaveBeenCalledWith('https://api.brevo.com/v3/smtp/email', expect.objectContaining({
      method: 'POST', headers: expect.objectContaining({ 'api-key': 'test-private-key' }),
    }));
    const payload = JSON.parse(request.mock.calls[0][1].body);
    expect(payload.sender.email).toBe('sender@example.com');
    expect(payload.to).toEqual([{ email: 'recipient@example.com' }]);
    expect(payload.textContent).toContain('123456');
    expect(payload.textContent).not.toContain('test-private-key');
  });

  it('does not expose provider errors or report failed sends as successful', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('test-private-key secret-code'));
    await expect(new MailService().sendOtp('recipient@example.com', '123456'))
      .rejects.toThrow('Password-reset email is temporarily unavailable.');
  });

  it('disables SMTP fallback in production', () => {
    delete process.env.BREVO_API_KEY;
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASS = 'password';
    expect(new MailService().isAvailable()).toBe(false);
  });
});
