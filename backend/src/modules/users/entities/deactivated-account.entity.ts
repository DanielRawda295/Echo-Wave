import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('deactivated_accounts')
export class DeactivatedAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId?: string;

  @CreateDateColumn()
  createdAt: Date;
}

