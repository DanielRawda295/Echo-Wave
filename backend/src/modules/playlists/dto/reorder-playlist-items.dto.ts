import { IsArray, IsString, MaxLength } from 'class-validator';

export class ReorderPlaylistItemsDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  externalIds!: string[];
}

