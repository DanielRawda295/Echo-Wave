import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { randomInt } from 'node:crypto';
import { Otp } from './entities/otp.entity';
import { MailService } from './mail.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    private readonly mailService: MailService,
  ) {}

  assertDeliveryAvailable(): void {
    if (!this.mailService.isAvailable()) {
      throw new ServiceUnavailableException('Password-reset email is temporarily unavailable.');
    }
  }

  async generateOtp(email: string): Promise<string> {
    // Keep recent records so resending cannot bypass the hourly limit.
    const recent = await this.otpRepository.count({
      where: { email, createdAt: MoreThan(new Date(Date.now() - 60 * 60 * 1000)) },
    });
    if (recent >= 3) throw new BadRequestException('Too many reset requests. Try again later.');
    const code = randomInt(100000, 1000000).toString();
    await this.otpRepository.update({ email, isUsed: false }, { isUsed: true });
    await this.otpRepository.save(this.otpRepository.create({
      email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), isUsed: false,
    }));
    return code;
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.mailService.sendOtp(email, otp);
  }

  async validateOtp(email: string, otp: string): Promise<boolean> {
    if (!/^\d{6}$/.test(otp)) return false;
    // Consume atomically: concurrent requests cannot reuse the same code.
    const result = await this.otpRepository.update({
      email, code: otp, isUsed: false, expiresAt: MoreThan(new Date()),
    }, { isUsed: true });
    return result.affected === 1;
  }
}
