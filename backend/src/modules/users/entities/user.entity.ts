import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true }) // Add nullable: true
  @IsOptional()
  @IsString()
  password?: string; // Make it optional

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