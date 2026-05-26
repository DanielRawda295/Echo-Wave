import { IsString, MaxLength } from 'class-validator';

export class RenamePlaylistDto {
  @IsString()
  @MaxLength(80)
  name!: string;
}

