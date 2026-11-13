import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { validateSync } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist, type PlaylistItem } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { Track } from '../tracks/entities/track.entity';
import { PlaylistItemDto } from './dto/playlist-item.dto';
import { ReorderPlaylistItemsDto } from './dto/reorder-playlist-items.dto';

@Injectable()
export class PlaylistsService {
  private validate<T extends object>(type: new () => T, value: T): T {
    const dto = Object.assign(new type(), value);
    if (validateSync(dto).length) throw new BadRequestException('Invalid playlist details. Check the text length and media URLs.');
    return dto;
  }

  private playlistName(value: string): string {
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name || name.length > 80) throw new BadRequestException('Playlist name must contain 1 to 80 characters.');
    return name;
  }
  constructor(
    @InjectRepository(Playlist) private playlistRepo: Repository<Playlist>,
    @InjectRepository(Track) private trackRepo: Repository<Track>,
  ) {}

  async create(dto: CreatePlaylistDto, creatorId: number) {
    const name = this.playlistName(dto.name);
    if ((dto.items?.length || 0) > 500) throw new BadRequestException('A playlist can contain up to 500 songs.');
    for (const item of dto.items || []) this.validate(PlaylistItemDto, item);
    const items: PlaylistItem[] = (dto.items || []).map((it) => ({
      externalId: it.externalId,
      title: it.title,
      artist: it.artist,
      artwork: it.artwork,
      previewUrl: it.previewUrl,
      raw: it.raw,
      addedAt: new Date().toISOString(),
    }));

    const tracks: Track[] = [];
    const playlist = this.playlistRepo.create({
      name,
      creator: { id: creatorId },
      tracks,
      items,
    });
    return this.playlistRepo.save(playlist);
  }

  async findAll() {
    return this.playlistRepo.find({
      relations: ['creator', 'tracks'],
    });
  }

  async findMine(creatorId: number) {
    return this.playlistRepo.find({
      where: { creator: { id: creatorId } as any },
      relations: ['creator', 'tracks'],
      order: { id: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.playlistRepo.findOne({
      where: { id },
      relations: ['creator', 'tracks'],
    });
  }

  private async mustOwnPlaylist(id: number, userId: number) {
    const playlist = await this.findById(id);
    if (!playlist) throw new NotFoundException('Playlist not found');
    if ((playlist.creator as any)?.id !== userId) {
      throw new ForbiddenException('You do not have access to this playlist');
    }
    return playlist;
  }

  async rename(id: number, userId: number, name: string) {
    const playlist = await this.mustOwnPlaylist(id, userId);
    playlist.name = this.playlistName(name);
    return this.playlistRepo.save(playlist);
  }

  async addItem(id: number, userId: number, item: PlaylistItemDto) {
    this.validate(PlaylistItemDto, item);
    if (!item.externalId.trim()) throw new BadRequestException('A song ID is required.');
    const playlist = await this.mustOwnPlaylist(id, userId);
    const next: PlaylistItem = {
      externalId: item.externalId,
      title: item.title,
      artist: item.artist,
      artwork: item.artwork,
      previewUrl: item.previewUrl,
      raw: item.raw,
      addedAt: new Date().toISOString(),
    };

    const exists = (playlist.items || []).some((it) => it.externalId === next.externalId);
    if (!exists) {
      if ((playlist.items || []).length >= 500) throw new BadRequestException('A playlist can contain up to 500 songs.');
      playlist.items = [next, ...(playlist.items || [])];
      await this.playlistRepo.save(playlist);
    }

    return playlist;
  }

  async removeItem(id: number, userId: number, externalId: string) {
    const playlist = await this.mustOwnPlaylist(id, userId);
    playlist.items = (playlist.items || []).filter((it) => it.externalId !== externalId);
    return this.playlistRepo.save(playlist);
  }

  async deletePlaylist(id: number, userId: number) {
    await this.mustOwnPlaylist(id, userId);
    await this.playlistRepo.delete({ id });
    return { success: true };
  }

  async reorderItems(id: number, userId: number, dto: ReorderPlaylistItemsDto) {
    this.validate(ReorderPlaylistItemsDto, dto);
    if (dto.externalIds.length > 500 || new Set(dto.externalIds).size !== dto.externalIds.length) {
      throw new BadRequestException('The song order must contain unique IDs, with at most 500 songs.');
    }
    const playlist = await this.mustOwnPlaylist(id, userId);
    const existing = playlist.items || [];
    const set = new Set(dto.externalIds);

    const ordered = dto.externalIds
      .map((externalId) => existing.find((it) => it.externalId === externalId))
      .filter(Boolean) as PlaylistItem[];

    const remainder = existing.filter((it) => !set.has(it.externalId));
    playlist.items = [...ordered, ...remainder];
    return this.playlistRepo.save(playlist);
  }
}
