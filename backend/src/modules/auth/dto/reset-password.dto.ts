import { IsEmail, IsString, Length, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter (A-Z)' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter (a-z)' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number (0-9)' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character (!@#$%^&* etc.)',
  })
  newPassword: string;
}
