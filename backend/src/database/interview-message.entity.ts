// interview-message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { InterviewSession } from './interviewsession.entity';

export enum InterviewMessageRole {
  QUESTION = 'QUESTION',
  ANSWER = 'ANSWER',
  EXPLANATION = 'EXPLANATION',
}

@Entity('interview_messages')
export class InterviewMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => InterviewSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: InterviewSession;

  @Column({
    type: 'enum',
    enum: InterviewMessageRole,
  })
  role: InterviewMessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int' })
  sequence: number;

  @CreateDateColumn()
  createdAt: Date;
}
