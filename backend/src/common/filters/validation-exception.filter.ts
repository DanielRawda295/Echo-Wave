// src/filters/validation-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Validation Exception Filter
 * Catches all BadRequestExceptions (typically from class-validator)
 * and returns a structured JSON response with validation errors.
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract validation messages if available
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? exceptionResponse['message']
        : exception.message;

    // Send structured JSON response
    response.status(status).json({
      statusCode: status,
      errors: message,
      timestamp: new Date().toISOString(),
    });
  }
}
