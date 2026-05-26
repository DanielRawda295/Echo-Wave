// src/guards/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard
 * Extends NestJS Passport AuthGuard for JWT strategy.
 * Protects routes by verifying the JWT in the request.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
