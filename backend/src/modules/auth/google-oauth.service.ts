import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private oauthClient: OAuth2Client;

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

  async googleLogin(googleToken: string) {
    const payload = await this.verifyGoogleToken(googleToken);
    this.logger.log(`Google login attempt for email: ${payload.email}`);

    if (await this.usersService.isDeactivatedEmail(payload.email)) {
      throw new UnauthorizedException('This account has been deactivated.');
    }
    
    let user = await this.usersService.findByEmail(payload.email);
    
    if (!user) {
      // Create new user with Google OAuth - don't set password at all
      this.logger.log(`Creating new user for Google OAuth: ${payload.email}`);
      user = await this.usersService.create({
        email: payload.email,
        googleId: payload.sub,
        username: payload.name || payload.email.split('@')[0],
        avatar: payload.picture,
        // Do NOT include password field for Google OAuth users
      } as any); // Use type assertion to bypass TypeScript check
    } else if (!user.googleId) {
      // Link Google account to existing user
      this.logger.log(`Linking Google account to existing user: ${payload.email}`);
      user.googleId = payload.sub;
      user.avatar = payload.picture;
      // Do not pass the loaded password hash into the password-update path.
      await this.usersService.linkGoogleAccount(user.id, payload.sub, payload.picture);
    }

    // Generate JWT token
    const jwtToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
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
