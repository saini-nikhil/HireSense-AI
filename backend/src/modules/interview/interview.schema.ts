import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Interview extends Document {
  @Prop()
  userId: string;

  @Prop()
  resumeText: string;

  @Prop([String])
  questions: string[];

  @Prop({ default: 0 })
  currentQuestionIndex: number;

  @Prop({
    type: [
      {
        question: String,
        answer: String,
        score: Number,
        feedback: String,
      },
    ],
    default: [],
  })
  answers: any[];

  @Prop({ default: 'IN_PROGRESS' })
  status: string;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);