import { Controller, Post, Get, Param, Query, UploadedFiles, UseInterceptors, Body, UseGuards, Req, BadRequestException, Patch, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTrackCommentDto } from './dto/create-track-comment.dto';

function safeFilename(originalName: string) {
  const ext = extname(originalName || '').toLowerCase();
  const base = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${base}${ext}`;
}

@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const folder = file.fieldname === 'cover' ? 'uploads/images' : 'uploads/audio';
            cb(null, folder);
          },
          filename: (req, file, cb) => cb(null, safeFilename(file.originalname)),
        }),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'audio') {
            const ok = file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3' || file.originalname.toLowerCase().endsWith('.mp3');
            return cb(ok ? null : new BadRequestException('Audio file must be an mp3'), ok);
          }
          if (file.fieldname === 'cover') {
            const ok = file.mimetype.startsWith('image/');
            return cb(ok ? null : new BadRequestException('Cover must be an image'), ok);
          }
          return cb(new BadRequestException('Unexpected file field'), false);
        },
        limits: {
          fileSize: 25 * 1024 * 1024, // 25MB
        },
      }
    )
  )
  upload(
    @UploadedFiles() files: { audio?: any[]; cover?: any[] },
    @Body() dto: CreateTrackDto,
    @Req() req
  ) {
    const audio = files?.audio?.[0];
    const cover = files?.cover?.[0];
    if (!audio) {
      throw new BadRequestException('Audio file is required (field name: audio)');
    }

    const fileUrl = `/uploads/audio/${audio.filename}`;
    const coverUrl = cover ? `/uploads/images/${cover.filename}` : undefined;
    return this.tracksService.upload(dto, fileUrl, coverUrl, req.user.sub);
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
