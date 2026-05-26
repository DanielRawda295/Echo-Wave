// src/pipes/validation.pipe.ts

import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * ValidationPipe
 * Validates incoming request objects based on their DTO class using class-validator.
 * Throws BadRequestException if validation fails.
 */
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // Skip validation if no metatype or primitive type
    if (!metatype || !this.toValidate(metatype)) return value;

    // Convert plain object to class instance
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    // Collect validation errors and throw if any
    if (errors.length > 0) {
      throw new BadRequestException(
        errors
          .map(err => (err.constraints ? Object.values(err.constraints) : []))
          .flat(),
      );
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
