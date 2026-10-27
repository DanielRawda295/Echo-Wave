import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { OtpService } from './otp.service';
import { GoogleOAuthService } from './google-oauth.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  /**
   * Validate password meets requirements
   */
  private validatePassword(
    password: string,
  ): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters long',
      };
    }
    if (password.length > 32) {
      return {
        isValid: false,
        error: 'Password must not exceed 32 characters',
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter (A-Z)',
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter (a-z)',
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number (0-9)',
      };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        error:
          'Password must contain at least one special character (!@#$%^&* etc.)',
      };
    }
    return { isValid: true };
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    if (await this.usersService.isDeactivatedEmail(dto.email)) {
      throw new BadRequestException('This account has been deactivated and cannot be re-registered.');
    }

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordValidation = this.validatePassword(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.error);
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const username = dto.username || dto.email.split('@')[0];

    await this.usersService.create({
      ...dto,
      password: hashed,
      username,
    });

    this.logger.log(`User registered successfully: ${dto.email}`);

    return {
      success: true,
      message: 'Account created successfully',
    };
  }

  /**
   * Login with email + password
   */
  async login(dto: LoginDto) {
    if (await this.usersService.isDeactivatedEmail(dto.email)) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Please use Google login for this account',
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      access_token: token,
    };
  }

  // Each visitor gets an isolated listener account with no password to expose.
  async guestLogin() {
    const user = await this.usersService.create({
      email: `guest-${randomUUID()}@guest.echowave.invalid`,
      username: 'Guest Listener',
      role: 'listener',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }, { expiresIn: '1d' }),
    };
  }

  /**
   * Google OAuth login
   */
  async googleLogin(dto: GoogleLoginDto) {
    return this.googleOAuthService.googleLogin(dto.token);
  }

  /**
   * Forgot password: generate OTP and send
   */
  async forgotPassword(dto: ForgotPasswordDto) {
  this.logger.log(`Forgot password request for: ${dto.email}`);

  try {
    const user = await this.usersService.findByEmail(dto.email);

    // Always return success response, even if user doesn’t exist
    if (!user) {
      this.logger.warn(`Email not found: ${dto.email}`);
      return {
        success: true,
        message:
          'If an account exists with this email, you will receive an OTP shortly.',
      };
    }

    // Try generating + sending OTP — but never throw to frontend
    try {
      const otp = await this.otpService.generateOtp(dto.email);
      await this.otpService.sendOtpEmail(dto.email, otp);
      this.logger.log(`OTP sent to: ${dto.email}`);
    } catch (err) {
      // Log but DO NOT throw
      this.logger.error('Failed to send OTP email:', err);
    }

    return {
      success: true,
      message:
        'If an account exists with this email, you will receive an OTP shortly.',
    };

  } catch (error) {
    // Catch ALL other unexpected issues
    this.logger.error('Forgot password critical error:', error);

    return {
      success: true,
      message:
        'If an account exists with this email, you will receive an OTP shortly.',
    };
  }
}

  /**
   * Reset password using OTP
   */
  async resetPassword(dto: ResetPasswordDto) {
  const validOtp = await this.otpService.validateOtp(dto.email, dto.otp);

  if (!validOtp) {
    throw new BadRequestException('Invalid or expired OTP');
  }

  const pwCheck = this.validatePassword(dto.newPassword);
  if (!pwCheck.isValid) {
    throw new BadRequestException(pwCheck.error);
  }

  const user = await this.usersService.findByEmail(dto.email);
  if (!user) {
    throw new BadRequestException('User not found');
  }

  // Prevent old password reuse
  if (user.password && await bcrypt.compare(dto.newPassword, user.password)) {
    throw new BadRequestException(
      'New password cannot be the same as your current password',
    );
  }

  // ❗ IMPORTANT: pass PLAIN password here, let UsersService.update() hash it
  await this.usersService.update(user.id, { password: dto.newPassword });

  return {
    success: true,
    message: 'Password reset successful',
  };
}


  /**
   * Debug helper if you ever need it (optional)
   */
  async debugPasswordCheck(email: string, password: string): Promise<{
    userExists: boolean;
    hasPassword: boolean;
    passwordMatch: boolean;
    hashLength?: number;
  }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return { userExists: false, hasPassword: false, passwordMatch: false };
    }

    if (!user.password) {
      return { userExists: true, hasPassword: false, passwordMatch: false };
    }

    const match = await bcrypt.compare(password, user.password);

    return {
      userExists: true,
      hasPassword: true,
      passwordMatch: match,
      hashLength: user.password.length,
    };
  }
}
