import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  artist?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  genre?: string;
}

