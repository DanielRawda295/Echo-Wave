import { IsString, MinLength } from 'class-validator';

export class DeactivateAccountDto {
  @IsString()
  @MinLength(1)
  password!: string;

  @IsString()
  @MinLength(1)
  confirmPassword!: string;
}

