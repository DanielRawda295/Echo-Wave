import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';

// A single-instance portfolio safeguard; counters reset when the service restarts.
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, { count: number; expires: number }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    for (const [key, value] of this.windows) {
      if (value.expires <= now) this.windows.delete(key);
    }
    const key = `${context.getHandler().name}:${request.ip}`;
    const current = this.windows.get(key);
    if ((current && current.count >= 10) || (!current && this.windows.size >= 10000)) {
      throw new HttpException('Too many attempts. Please wait a minute and try again.', 429);
    }
    this.windows.set(key, { count: (current?.count || 0) + 1, expires: current?.expires || now + 60000 });
    return true;
  }
}
