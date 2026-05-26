import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Track } from '../../tracks/entities/track.entity';

export type PlaylistItem = {
  externalId: string;
  title?: string;
  artist?: string;
  artwork?: string;
  previewUrl?: string;
  raw?: any;
  addedAt: string;
};

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  creator: User;

  @ManyToMany(() => Track)
  @JoinTable()
  tracks: Track[];

  // For external songs (iTunes/Shazam/etc.) where we don't have a Track entity in our DB.
  // Stored as JSONB for flexibility.
  @Column({ type: 'jsonb', default: () => "'[]'" })
  items: PlaylistItem[];
}
