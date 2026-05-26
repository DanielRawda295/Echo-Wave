import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RenamePlaylistDto } from './dto/rename-playlist.dto';
import { PlaylistItemDto } from './dto/playlist-item.dto';
import { ReorderPlaylistItemsDto } from './dto/reorder-playlist-items.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePlaylistDto, @Req() req) {
    return this.playlistsService.create(dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@Req() req) {
    return this.playlistsService.findMine(req.user.sub);
  }

  @Get()
  findAll() {
    return this.playlistsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.playlistsService.findById(Number(id)).then((pl) => {
      if (!pl) return null;
      // enforce ownership in service methods for mutating endpoints; for read, return null if not owner
      if ((pl.creator as any)?.id !== req.user.sub) return null;
      return pl;
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  rename(@Param('id') id: string, @Body() dto: RenamePlaylistDto, @Req() req) {
    return this.playlistsService.rename(Number(id), req.user.sub, dto.name);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.playlistsService.deletePlaylist(Number(id), req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/items/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderPlaylistItemsDto, @Req() req) {
    return this.playlistsService.reorderItems(Number(id), req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: PlaylistItemDto, @Req() req) {
    return this.playlistsService.addItem(Number(id), req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/items/:externalId')
  removeItem(@Param('id') id: string, @Param('externalId') externalId: string, @Req() req) {
    return this.playlistsService.removeItem(Number(id), req.user.sub, externalId);
  }
}
