// src/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * RolesGuard
 * Protects routes by checking if the authenticated user has the required roles.
 * Uses the @Roles() decorator metadata to determine allowed roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve required roles from route handler metadata
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    // Extract user from request object
    const { user } = context.switchToHttp().getRequest();

    // Allow access if user's role matches any required role
    return requiredRoles.includes(user.role);
  }
}
