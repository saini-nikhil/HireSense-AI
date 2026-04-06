import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Interview } from './interview.entity';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
  ) {}

  private AI_URL = process.env.PYTHON_API_URL;

  // 🚀 START INTERVIEW
  async startInterview(userId: string, resumeText: string) {
    const res = await axios.post(`${this.AI_URL}/interview/generate`, {
      resumeText,
    });

    const questions = res.data.questions;

    // ✅ create + save
    const interview = this.interviewRepo.create({
      userId,
      resumeText,
      questions,
      answers: [],
    });

    const savedInterview = await this.interviewRepo.save(interview);

    return {
      interviewId: savedInterview.id, // ✅ fixed
      question: questions[0],
    };
  }

  // 🔁 ANSWER FLOW
  async answerQuestion(interviewId: string, answer: string) {
    const interview = await this.interviewRepo.findOne({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const index = interview.currentQuestionIndex;
    const question = interview.questions[index];

    // 🔥 Evaluate via Python
    const evalRes = await axios.post(`${this.AI_URL}/interview/evaluate`, {
      question,
      answer,
    });

    const { score, feedback } = evalRes.data;

    // ✅ push into JSONB array
    interview.answers = [
      ...interview.answers,
      {
        question,
        answer,
        score,
        feedback,
      },
    ];

    interview.currentQuestionIndex += 1;

    // ✅ Check completion
    if (interview.currentQuestionIndex >= interview.questions.length) {
      interview.status = 'COMPLETED';
    }

    // ✅ save using repository
    await this.interviewRepo.save(interview);

    if (interview.status === 'COMPLETED') {
      return {
        isCompleted: true,
        finalAnswers: interview.answers,
      };
    }

    return {
      isCompleted: false,
      nextQuestion: interview.questions[interview.currentQuestionIndex],
      score,
      feedback,
    };
  }

  // 📥 GET INTERVIEW
  async getInterview(id: string) {
    const interview = await this.interviewRepo.findOne({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }
}
