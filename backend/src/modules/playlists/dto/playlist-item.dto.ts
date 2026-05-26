import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class PlaylistItemDto {
  @IsString()
  @MaxLength(200)
  externalId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  artist?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(/^(https?:\/\/|\/uploads\/)/, {
    message: 'artwork must be a full http(s) url or a /uploads/... path',
  })
  artwork?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(/^(https?:\/\/|\/uploads\/)/, {
    message: 'previewUrl must be a full http(s) url or a /uploads/... path',
  })
  previewUrl?: string;

  @IsOptional()
  raw?: any;
}
