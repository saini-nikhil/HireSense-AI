import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  resumeText: string;

  // array of strings
  @Column('text', { array: true, nullable: true })
  questions: string[];

  @Column({ default: 0 })
  currentQuestionIndex: number;

  // JSON array for answers
  @Column({ type: 'jsonb', default: () => "'[]'" })
  answers: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];

  @Column({ default: 'IN_PROGRESS' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
