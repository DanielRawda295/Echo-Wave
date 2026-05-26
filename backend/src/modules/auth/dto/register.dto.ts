import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter (A-Z)' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter (a-z)' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number (0-9)' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { 
    message: 'Password must contain at least one special character (!@#$%^&* etc.)' 
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;
}
