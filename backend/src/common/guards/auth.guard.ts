// src/guards/auth.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * AuthGuard
 * Protects routes by checking if `request.user` exists.
 * Typically used after a JWT or session-based authentication middleware.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Return true if user is authenticated, false otherwise
    return !!request.user;
  }
}
