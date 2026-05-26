import { IsOptional, IsString } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  title: string;

  @IsString()
  artist: string;

  @IsOptional()
  @IsString()
  genre?: string;
}
