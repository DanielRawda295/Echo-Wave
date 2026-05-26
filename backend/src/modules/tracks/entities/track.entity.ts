import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column({ nullable: true })
  genre?: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ default: 0 })
  playCount: number;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  uploader: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
