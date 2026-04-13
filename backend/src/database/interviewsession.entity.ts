// interview-session.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InterviewMessage } from './interview-message.entity';
import { User } from './user.entity';

export enum InterviewSessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  resume: string;

  @Column({ type: 'text' })
  jobDescription: string;

  @Column({ type: 'text', nullable: true })
  currentQuestion: string | null;

  @Column({
    type: 'enum',
    enum: InterviewSessionStatus,
    default: InterviewSessionStatus.ACTIVE,
  })
  status: InterviewSessionStatus;

  @Column({ type: 'int', default: 0 })
  questionCount: number;

  @Column({ type: 'jsonb', nullable: true })
  finalReport: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.interviewSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' }) // 👈 important
  user: User;

  @OneToMany(() => InterviewMessage, (message) => message.session, {
    cascade: false,
  })
  messages: InterviewMessage[];
}
