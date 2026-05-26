// src/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * Global HTTP Exception Filter
 * Catches all exceptions and formats a consistent JSON response.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // GraphQL (and other non-HTTP contexts) don't expose an Express `response` object
    // with `.status()`/`.json()`. Let the GraphQL adapter handle formatting.
    if (host.getType() !== 'http') {
      return exception as any;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Defensive guard: if the "response" isn't an Express response, don't crash.
    if (!response || typeof (response as any).status !== 'function') {
      return exception as any;
    }

    // Determine HTTP status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine response message
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Send structured JSON response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
