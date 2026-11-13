import { ConflictException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private oauthClient: OAuth2Client;
  private readonly challenges = new Map<string, { nonce: string; expires: number }>();

  createChallenge() {
    if (!this.oauthClient) throw new ServiceUnavailableException('Google sign-in is not configured.');
    const now = Date.now();
    for (const [id, attempt] of this.challenges) {
      if (attempt.expires <= now) this.challenges.delete(id);
    }
    if (this.challenges.size >= 1000) throw new ServiceUnavailableException('Please try Google sign-in again shortly.');
    const challengeId = randomBytes(32).toString('hex');
    const nonce = randomBytes(32).toString('hex');
    this.challenges.set(challengeId, { nonce, expires: now + 5 * 60 * 1000 });
    return { challengeId, nonce, state: randomBytes(32).toString('hex'), expiresAt: now + 5 * 60 * 1000 };
  }

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.initializeOAuthClient();
  }

  private initializeOAuthClient() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    
    if (clientId) {
      this.oauthClient = new OAuth2Client(clientId);
      this.logger.log('Google OAuth client initialized');
    } else {
      this.logger.warn('Google OAuth credentials not configured');
    }
  }

  async verifyGoogleToken(token: string): Promise<any> {
    if (!this.oauthClient) {
      throw new ServiceUnavailableException('Google sign-in is not configured yet. Please use email or guest login.');
    }

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new UnauthorizedException('Google account email is not verified.');
      }
      return payload;
    } catch {
      this.logger.warn('Google ID token verification failed.');
      throw new UnauthorizedException('Google sign-in could not be verified. Please try again.');
    }
  }

  async googleLogin(googleToken: string, challengeId: string) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.expires <= Date.now()) {
      this.challenges.delete(challengeId);
      throw new UnauthorizedException('Google sign-in expired. Please start again.');
    }
    const payload = await this.verifyGoogleToken(googleToken);
    if (payload.nonce !== challenge.nonce || this.challenges.get(challengeId) !== challenge) {
      throw new UnauthorizedException('Google sign-in could not be matched to this login attempt.');
    }
    // Consume synchronously before database awaits so concurrent replays fail.
    this.challenges.delete(challengeId);

    if (await this.usersService.isDeactivatedEmail(payload.email) || await this.usersService.isDeactivatedGoogleId(payload.sub)) {
      throw new UnauthorizedException('This account has been deactivated.');
    }
    
    let user = await this.usersService.findByGoogleId(payload.sub);
    
    if (!user) {
      if (await this.usersService.findByEmail(payload.email)) {
        throw new ConflictException('An account already uses this email. Sign in with email and password; automatic Google linking is disabled for your protection.');
      }
      // Create new user with Google OAuth - don't set password at all
      user = await this.usersService.create({
        email: payload.email,
        googleId: payload.sub,
        username: payload.name || payload.email.split('@')[0],
        avatar: payload.picture,
        // Do NOT include password field for Google OAuth users
      } as any); // Use type assertion to bypass TypeScript check
    }

    // Generate JWT token
    const jwtToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      version: user.tokenVersion ?? 0,
    });

    this.logger.log(`Google login successful for user ID: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
      access_token: jwtToken,
    };
  }
}
