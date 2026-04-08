/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Interview } from './interview.entity';
import * as FormData from 'form-data';
import { UploadedFile } from '../../common/types/uploaded-file.type';
import { findJobsForResume } from './test';
import { AiService } from './ai.service';
import { queryObjects } from 'v8';
import e from 'express';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    private readonly aiService: AiService,
  ) {}
  private sessions = new Map();

  // console.log(this.AI_URL);

  // // 🚀 START INTERVIEW
  // async startInterview(
  //   userId: string,
  //   file: UploadedFile,
  //   jobDescription: string,
  // ) {
  //   const aiUrl = process.env.PYTHON_API_URL;

  //   const formData = new FormData();

  //   formData.append('file', file.buffer, {
  //     filename: file.originalname,
  //     contentType: file.mimetype,
  //   });

  //   formData.append('jobDescription', jobDescription);
  //   // return await formData
  //   const res = await axios.post<{
  //     analysis?: { summary?: string };
  //     interview?: { questions?: string[] };
  //   }>(`${aiUrl}/evaluate`, formData, {
  //     headers: {
  //       ...formData.getHeaders(),
  //     },
  //   });

  //   const result = res.data;
  //   const resumeContent = result.analysis?.summary || '';
  //   await findJobsForResume(resumeContent, jobDescription);
  //   // console.log("result",result);

  //   // ✅ create + save
  //   const interview = this.interviewRepo.create({
  //     userId,
  //     resumeText: result.analysis?.summary || '', // or store separately
  //     questions: result?.interview?.questions || [],
  //     answers: [],
  //   });

  //   const savedInterview = await this.interviewRepo.save(interview);
  //   console.log(savedInterview);

  //   return {
  //     interviewId: savedInterview.id, //
  //     question: savedInterview.questions,
  //   };
  // }

  // // 🔁 ANSWER FLOW
  // async answerQuestion(interviewId: string, answer: string) {
  //   const interview = await this.interviewRepo.findOne({
  //     where: { id: interviewId },
  //   });

  //   if (!interview) {
  //     throw new NotFoundException('Interview not found');
  //   }

  //   const index = interview.currentQuestionIndex;
  //   const question = interview.questions[index];

  //   const aiUrl = process.env.PYTHON_API_URL;

  //   // 🔥 Evaluate via Python
  //   const evalRes = await axios.post(`${aiUrl}/interview/evaluate`, {
  //     question,
  //     answer,
  //   });

  //   const { score, feedback } = evalRes.data;

  //   // ✅ push into JSONB array
  //   interview.answers = [
  //     ...interview.answers,
  //     {
  //       question,
  //       answer,
  //       score,
  //       feedback,
  //     },
  //   ];

  //   interview.currentQuestionIndex += 1;

  //   // ✅ Check completion
  //   if (interview.currentQuestionIndex >= interview.questions.length) {
  //     interview.status = 'COMPLETED';
  //   }

  //   // ✅ save using repository
  //   await this.interviewRepo.save(interview);

  //   if (interview.status === 'COMPLETED') {
  //     return {
  //       isCompleted: true,
  //       finalAnswers: interview.answers,
  //     };
  //   }

  //   return {
  //     isCompleted: false,
  //     nextQuestion: interview.questions[interview.currentQuestionIndex],
  //     score,
  //     feedback,
  //   };
  // }

  // // 📥 GET INTERVIEW
  // async getInterview(id: string) {
  //   const interview = await this.interviewRepo.findOne({
  //     where: { id },
  //   });

  //   if (!interview) {
  //     throw new NotFoundException('Interview not found');
  //   }

  //   return interview;
  // }
  async startInterview(resumeText, jobDescription) {
    const sessionId = 1234569858;

    const firstQuestion = 'Tell me about yourself';

    this.sessions.set(sessionId, {
      resume: resumeText,
      jd: jobDescription,
      currentQuestion: firstQuestion,
      history: [],
    });

    return {
      sessionId,
      question: firstQuestion,
    };
  }

  async processAnswer({ sessionId, answer }) {
    try {
      console.log('sessionId', sessionId);
      console.log('answer', answer);
      sessionId = 1234569858;
      const session = this.sessions.get(sessionId);

      if (!session) {
        throw new Error('Session not found');
      }

      const lowerAnswer = answer.toLowerCase();

      // 🛑 END INTERVIEW TRIGGER
      const shouldEndInterview =
        /\bend\b/.test(lowerAnswer) ||
        /\bstop interview\b/.test(lowerAnswer) ||
        /\bfinish\b/.test(lowerAnswer);
      console.log('shouldEndInterview', shouldEndInterview);
      if (shouldEndInterview) {
        const finalReport = await this.aiService.generateFinalReport(
          session.history,
          session.resume,
          session.jd,
        );

        this.sessions.delete(sessionId);

        return {
          completed: true,
          report: finalReport,
        };
      }
      //  Call AI for next step (NO evaluation here)
      const aiResponse = await this.aiService.generateNextStep({
        resume: session.resume,
        jd: session.jd,
        history: session.history,
        lastQuestion: session.currentQuestion,
        userAnswer: answer,
      });

      console.log('aiResponse', aiResponse);

      //  STORE ONLY (no evaluation yet)
      session.history.push({
        question: session.currentQuestion,
        answer,
      });
      if (session.history.length >= 15) {
        const finalReport = await this.aiService.generateFinalReport(
          session.history,
          session.resume,
          session.jd,
        );

        this.sessions.delete(sessionId); // cleanup memory

        return {
          completed: true,
          report: finalReport,
          message: 'Interview auto-ended after 15 questions',
        };
      }

      // Handle actions
      if (aiResponse.action === 'repeat') {
        return { question: session.currentQuestion };
      }

      if (aiResponse.action === 'explain') {
        return {
          explanation: aiResponse.question,
          question: session.currentQuestion,
        };
      }

      if (aiResponse.action === 'end') {
        const finalReport = await this.aiService.generateFinalReport(
          session.history,
          session.resume,
          session.jd,
        );

        this.sessions.delete(sessionId);

        return {
          completed: true,
          report: finalReport,
        };
      }

      // Next question
      session.currentQuestion = aiResponse.question;

      return {
        nextQuestion: aiResponse.question,
      };
    } catch (error) {
      console.log('error', error);
      return { error: error.message };
    }
  }
}
