import { IsString, Matches } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  token: string;

  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  challengeId: string;
}
