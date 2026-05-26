// src/modules/users/dto/update-user.dto.ts

import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for updating user
 * - All fields are optional
 * - Validates email format
 * - Password must be at least 6 characters
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
