import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist, type PlaylistItem } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { Track } from '../tracks/entities/track.entity';
import { PlaylistItemDto } from './dto/playlist-item.dto';
import { ReorderPlaylistItemsDto } from './dto/reorder-playlist-items.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist) private playlistRepo: Repository<Playlist>,
    @InjectRepository(Track) private trackRepo: Repository<Track>,
  ) {}

  async create(dto: CreatePlaylistDto, creatorId: number) {
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
      name: dto.name,
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
    playlist.name = name;
    return this.playlistRepo.save(playlist);
  }

  async addItem(id: number, userId: number, item: PlaylistItemDto) {
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
