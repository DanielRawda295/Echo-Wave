// src/pipes/trim-string.pipe.ts

import { PipeTransform, Injectable } from '@nestjs/common';

/**
 * TrimStringPipe
 * Trims leading and trailing whitespace from string inputs.
 * Non-string values are returned as-is.
 */
@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }
}
