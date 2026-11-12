import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  isAvailable(): boolean {
    return Boolean(process.env.EMAIL_FROM && (process.env.BREVO_API_KEY ||
      (process.env.NODE_ENV !== 'production' && process.env.EMAIL_HOST &&
        process.env.EMAIL_USER && process.env.EMAIL_PASS)));
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new ServiceUnavailableException('Password-reset email is temporarily unavailable.');
    }
    if (!/^\d{6}$/.test(otp)) throw new Error('Invalid reset-code format');
    const subject = 'Your Echo Wave password reset code';
    const text = `Your Echo Wave password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
    try {
      if (process.env.BREVO_API_KEY) {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            sender: { email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME || 'EchoWave' },
            to: [{ email }],
            subject,
            textContent: text,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error('Email provider rejected request');
      } else {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT || 587),
          secure: process.env.EMAIL_PORT === '465',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          connectionTimeout: 15000,
        });
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to: email, subject, text });
      }
    } catch {
      // Provider errors may contain credentials or reset codes.
      this.logger.warn('Password-reset email delivery failed. Check the provider dashboard.');
      throw new ServiceUnavailableException('Password-reset email is temporarily unavailable.');
    }
  }
}
