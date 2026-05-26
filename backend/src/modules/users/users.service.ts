import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeactivatedAccount } from './entities/deactivated-account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private repo: Repository<User>,
    @InjectRepository(DeactivatedAccount)
    private deactivatedRepo: Repository<DeactivatedAccount>,
  ) {}

  create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async isDeactivatedEmail(email: string) {
    const row = await this.deactivatedRepo.findOne({ where: { email } });
    return !!row;
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findAll() {
    return this.repo.find();
  }

  private validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }
    if (password.length > 32) {
      return { isValid: false, error: 'Password must not exceed 32 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z)' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z)' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number (0-9)' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character (!@#$%^&* etc.)',
      };
    }
    return { isValid: true };
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async changePassword(id: number, currentPassword: string | undefined, newPassword: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const validation = this.validatePassword(newPassword);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    if (user.password) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        // Return 400 so the frontend can show an inline error without forcing a logout
        throw new BadRequestException('Current password is incorrect');
      }
      const reuse = await bcrypt.compare(newPassword, user.password);
      if (reuse) {
        throw new BadRequestException('New password cannot be the same as your current password');
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return this.repo.save(user);
  }

  async deactivateAccount(id: number, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.password) {
      throw new BadRequestException(
        'This account has no password (likely Google login). Please set a password first or contact support.'
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      // Return 400 to prevent the frontend auth interceptor from redirecting to login
      throw new BadRequestException('Password is incorrect');
    }

    await this.deactivatedRepo.save(
      this.deactivatedRepo.create({
        email: user.email,
        googleId: user.googleId,
      })
    );

    await this.repo.delete({ id });
    return { success: true };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return null;

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }
}
