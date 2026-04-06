import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

@Injectable()
export class InterviewService {
  constructor(
    @InjectModel('Interview') private interviewModel: Model<any>,
  ) {}

  private AI_URL = process.env.PYTHON_API_URL;

  // 🚀 START INTERVIEW
  async startInterview(userId: string, resumeText: string) {
    const res = await axios.post(`${this.AI_URL}/interview/generate`, {
      resumeText,
    });

    const questions = res.data.questions;

    const interview = await this.interviewModel.create({
      userId,
      resumeText,
      questions,
    });

    return {
      interviewId: interview._id,
      question: questions[0],
    };
  }

  // 🔁 ANSWER FLOW
  async answerQuestion(interviewId: string, answer: string) {
    const interview = await this.interviewModel.findById(interviewId);

    const index = interview.currentQuestionIndex;
    const question = interview.questions[index];

    // 🔥 Evaluate via Python
    const evalRes = await axios.post(
      `${this.AI_URL}/interview/evaluate`,
      {
        question,
        answer,
      },
    );

    const { score, feedback } = evalRes.data;

    // Save answer
    interview.answers.push({
      question,
      answer,
      score,
      feedback,
    });

    interview.currentQuestionIndex += 1;

    // Check end
    if (interview.currentQuestionIndex >= interview.questions.length) {
      interview.status = 'COMPLETED';
      await interview.save();

      return {
        isCompleted: true,
        finalAnswers: interview.answers,
      };
    }

    await interview.save();

    return {
      isCompleted: false,
      nextQuestion:
        interview.questions[interview.currentQuestionIndex],
      score,
      feedback,
    };
  }

  async getInterview(id: string) {
    return this.interviewModel.findById(id);
  }
}