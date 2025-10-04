import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum tokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ default: null, nullable: true })
  type: tokenType;

  @Column({ default: false })
  revoked: boolean;

  @Column()
  expired_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
