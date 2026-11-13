import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@Entity()
@Index('UQ_user_google_subject', ['googleId'], { unique: true, where: '"googleId" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true, select: false })
  @IsOptional()
  @IsString()
  password?: string; // Make it optional

  @Column({ default: 0 })
  tokenVersion: number;

  @Column({ default: 'listener' })
  role: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  googleId?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
