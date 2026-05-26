import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Track } from './track.entity';
import { User } from '../../users/entities/user.entity';

@Entity('track_likes')
@Unique(['track', 'user'])
export class TrackLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Track, { onDelete: 'CASCADE' })
  track: Track;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}

