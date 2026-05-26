// src/pipes/parse-int.pipe.ts

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * ParseIntPipe
 * Transforms a string parameter into a number.
 * Throws BadRequestException if the value is not a numeric string.
 */
@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(
        'Validation failed (numeric string is expected)',
      );
    }
    return val;
  }
}
