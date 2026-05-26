// src/interceptors/timeout.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, timeout, catchError, throwError } from 'rxjs';

/**
 * TimeoutInterceptor
 * Intercepts requests and throws a RequestTimeoutException if the request
 * takes longer than the specified timeout (5000ms by default).
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // 5 seconds timeout
      catchError(() =>
        throwError(() => new RequestTimeoutException()),
      ),
    );
  }
}
