import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Track } from './track.entity';
import { User } from '../../users/entities/user.entity';

@Entity('track_comments')
export class TrackComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Track, { onDelete: 'CASCADE' })
  track: Track;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}

