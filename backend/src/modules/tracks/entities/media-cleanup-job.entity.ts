import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('media_cleanup_jobs')
@Unique('UQ_media_cleanup_jobs_url', ['url'])
export class MediaCleanupJob {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'PK_media_cleanup_jobs' })
  id: number;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;
}
