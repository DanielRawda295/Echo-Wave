import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlaylistItemDto } from './playlist-item.dto';

export class CreatePlaylistDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaylistItemDto)
  items?: PlaylistItemDto[];
}

