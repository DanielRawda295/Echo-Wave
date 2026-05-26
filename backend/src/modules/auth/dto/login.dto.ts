// src/modules/auth/dto/login.dto.ts

import { IsEmail, IsString } from 'class-validator';

/**
 * Data Transfer Object for user login
 * Validates that email is a valid email format and password is a string
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
