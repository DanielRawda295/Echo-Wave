import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // Gmail uses TLS, not SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const html = `
      <h2>Your Echo Wave Password Reset Code</h2>
      <p>Your OTP is:</p>
      <h1 style="font-size: 32px; letter-spacing: 6px;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Echo Wave OTP Code",
      html,
    });

    this.logger.log(`OTP email sent to ${email}`);
  }
}
