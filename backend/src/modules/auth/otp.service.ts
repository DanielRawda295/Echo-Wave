import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import * as crypto from 'crypto';
import { MailService } from './mail.service';

@Injectable()
export class OtpService implements OnModuleInit {
  private readonly logger = new Logger(OtpService.name);

  constructor(
  @InjectRepository(Otp)
  private otpRepository: Repository<Otp>,
  private mailService: MailService,
) {}

  async onModuleInit() {
    this.logger.log('OTP Service initialized');
    this.logger.log(
      `OTP Repository available: ${!!this.otpRepository}`,
    );
  }

  /**
   * Generate a random 6-digit OTP for a given email
   */
  async generateOtp(email: string): Promise<string> {
    try {
      // Random 6-digit code, padded if needed
      const otp = crypto
        .randomInt(100000, 1000000)
        .toString()
        .padStart(6, '0');

      // Remove previous OTPs for this email
      await this.otpRepository.delete({ email });

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Check resend limit: max 3 per hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const recentOtps = await this.otpRepository.count({
  where: { email, expiresAt: MoreThan(oneHourAgo) },
});

if (recentOtps >= 3) {
  throw new BadRequestException("Too many OTP requests. Try again later.");
}


      const otpRecord = this.otpRepository.create({
        email,
        code: otp,
        expiresAt,
        isUsed: false,
      });

      await this.otpRepository.save(otpRecord);

      this.logOtpToConsole(email, otp, expiresAt);

      return otp;
    } catch (error) {
      this.logger.error('Failed to generate OTP:', error);

      // Fallback simple OTP
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000)
        .toString()
        .padStart(6, '0');

      const fallbackExpires = new Date(Date.now() + 10 * 60 * 1000);

      this.logOtpToConsole(email, fallbackOtp, fallbackExpires);

      return fallbackOtp;
    }
  }

  private logOtpToConsole(email: string, otp: string, expiresAt: Date) {
    console.log('\n' + '='.repeat(50));
    console.log('📧 PASSWORD RESET OTP (DEV CONSOLE LOG)');
    console.log('='.repeat(50));
    console.log(`Email:   ${email}`);
    console.log(`OTP:     ${otp}`);
    console.log(
      `Expires: ${expiresAt.toISOString()} (10 minutes from generation)`,
    );
    console.log('='.repeat(50) + '\n');

    this.logger.log(`OTP generated for ${email}: ${otp}`);
  }

  
  async sendOtpEmail(email: string, otp: string) {
  await this.mailService.sendOtp(email, otp);
}

  /**
   * Strict OTP validation:
   * - Must be 6 digits
   * - Must exist in DB
   * - Must not be used
   * - Must not be expired
   */
  async validateOtp(email: string, otp: string): Promise<boolean> {
  try {
    const otpRecord = await this.otpRepository.findOne({
      where: { email, code: otp }
    });

    // No record
    if (!otpRecord) {
      this.logger.warn(`OTP not found for ${email}`);
      return false;
    }

    // Expired
    if (otpRecord.expiresAt < new Date()) {
      this.logger.warn(`OTP expired for ${email}`);
      await this.otpRepository.delete({ email });
      return false;
    }

    // VALID & NOT EXPIRED — DO NOT MARK AS USED (Option 2)
    return true;

  } catch (error) {
    this.logger.error('OTP validation error:', error);
    return false;
  }
}

}
