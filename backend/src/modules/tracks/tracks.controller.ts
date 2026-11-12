import { Controller, Post, Get, Param, Query, UploadedFiles, UseInterceptors, Body, UseGuards, Req, BadRequestException, Patch, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTrackCommentDto } from './dto/create-track-comment.dto';
import { MediaStorageService, type MediaFile } from './media-storage.service';

@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService, private media: MediaStorageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'audio') {
            const ok = file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3' || file.originalname.toLowerCase().endsWith('.mp3');
            return cb(ok ? null : new BadRequestException('Audio file must be an mp3'), ok);
          }
          if (file.fieldname === 'cover') {
            const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
            return cb(ok ? null : new BadRequestException('Cover must be JPEG, PNG, or WebP'), ok);
          }
          return cb(new BadRequestException('Unexpected file field'), false);
        },
        limits: {
          fileSize: 25 * 1024 * 1024, // 25MB
          files: 2,
          fields: 3,
        },
      }
    )
  )
  async upload(
    @UploadedFiles() files: { audio?: MediaFile[]; cover?: MediaFile[] },
    @Body() dto: CreateTrackDto,
    @Req() req
  ) {
    const audio = files?.audio?.[0];
    const cover = files?.cover?.[0];
    if (!audio) {
      throw new BadRequestException('Audio file is required (field name: audio)');
    }

    const saved: string[] = [];
    try {
      const fileUrl = await this.media.save(audio, 'audio', req.user.sub);
      saved.push(fileUrl);
      const coverUrl = cover ? await this.media.save(cover, 'images', req.user.sub) : undefined;
      if (coverUrl) saved.push(coverUrl);
      return await this.tracksService.upload(dto, fileUrl, coverUrl, req.user.sub);
    } catch (error) {
      await this.media.cleanup(saved);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/list')
  findMine(@Req() req) {
    return this.tracksService.findMine(req.user.sub);
  }

  @Get('search')
  search(@Query('term') term: string) {
    return this.tracksService.search(term);
  }

  @UseGuards(JwtAuthGuard)
  @Get('likes')
  likeInfoBulk(@Query('ids') ids: string, @Req() req) {
    const trackIds = String(ids || '')
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n));
    return this.tracksService.getLikeInfoBulk(trackIds, req.user.sub);
  }

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get(':id/stream')
  stream(@Param('id') id: number) {
    return this.tracksService.stream(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Req() req) {
    return this.tracksService.toggleLike(Number(id), req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/like')
  async getLikeInfo(@Param('id') id: string, @Req() req) {
    const trackId = Number(id);
    const [likeCount, liked] = await Promise.all([
      this.tracksService.getLikeCount(trackId),
      this.tracksService.isLikedBy(trackId, req.user.sub),
    ]);
    return { trackId, likeCount, liked };
  }

  @Get(':id/comments')
  listComments(@Param('id') id: string) {
    return this.tracksService.listComments(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() dto: CreateTrackCommentDto, @Req() req) {
    return this.tracksService.addComment(Number(id), req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrackDto, @Req() req) {
    return this.tracksService.updateTrack(Number(id), req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.tracksService.deleteTrack(Number(id), req.user.sub);
  }
}
