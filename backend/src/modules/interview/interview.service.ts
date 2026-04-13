import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AiService } from './ai.service';
import { queryObjects } from 'v8';
// import e from 'express';

import {
  InterviewSession,
  InterviewSessionStatus,
} from 'src/database/interviewsession.entity';
import {
  InterviewMessage,
  InterviewMessageRole,
} from 'src/database/interview-message.entity';
import {
  AiResponse,
  FinalInterviewReport,
  InterviewHistoryItem,
} from './interview.types';
@Injectable()
export class InterviewService {
  private readonly MAX_QUESTIONS = 15;

  constructor(
    @InjectRepository(InterviewSession)
    private readonly sessionRepo: Repository<InterviewSession>,

    @InjectRepository(InterviewMessage)
    private readonly messageRepo: Repository<InterviewMessage>,

    private readonly aiService: AiService,
    private readonly dataSource: DataSource,
  ) {}

  async startInterview(
    userId: string,
    resumeText: string,
    jobDescription: string,
  ) {
    const firstQuestion = 'Tell me about yourself';

    const session = await this.sessionRepo.save(
      this.sessionRepo.create({
        userId,
        resume: resumeText,
        jobDescription,
        currentQuestion: firstQuestion,
        status: InterviewSessionStatus.ACTIVE,
        questionCount: 1,
      }),
    );

    await this.messageRepo.save(
      this.messageRepo.create({
        sessionId: session.id,
        role: InterviewMessageRole.QUESTION,
        content: firstQuestion,
        sequence: 1,
      }),
    );

    return {
      sessionId: session.id,
      question: firstQuestion,
    };
  }

  async processAnswer(userId: string, sessionId: string, answer: string) {
    const normalizedAnswer = answer?.trim();
    if (!normalizedAnswer) {
      throw new BadRequestException('Answer is required');
    }

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== InterviewSessionStatus.ACTIVE) {
      throw new BadRequestException('Interview already completed');
    }

    const allMessages = await this.messageRepo.find({
      where: { sessionId },
      order: { sequence: 'ASC' },
    });

    const nextSequence = allMessages.length + 1;

    await this.messageRepo.save(
      this.messageRepo.create({
        sessionId,
        role: InterviewMessageRole.ANSWER,
        content: normalizedAnswer,
        sequence: nextSequence,
      }),
    );

    const lowerAnswer = normalizedAnswer.toLowerCase();

    const shouldEndInterview =
      /\bend\b/.test(lowerAnswer) ||
      /\bstop interview\b/.test(lowerAnswer) ||
      /\bfinish\b/.test(lowerAnswer);

    const history = this.buildHistory(allMessages, normalizedAnswer);

    if (shouldEndInterview) {
      return this.completeInterview(session, history);
    }

    const aiResponse: AiResponse = await this.aiService.generateNextStep({
      resume: session.resume,
      jd: session.jobDescription,
      history,
      lastQuestion: session.currentQuestion ?? '',
      userAnswer: normalizedAnswer,
    });

    if (session.questionCount >= this.MAX_QUESTIONS) {
      const finalResult = await this.completeInterview(session, history);

      return {
        ...finalResult,
        message: 'Interview auto-ended after 15 questions',
      };
    }

    if (aiResponse.action === 'repeat') {
      return {
        question: session.currentQuestion,
      };
    }

    if (aiResponse.action === 'explain') {
      await this.messageRepo.save(
        this.messageRepo.create({
          sessionId,
          role: InterviewMessageRole.EXPLANATION,
          content: aiResponse.question,
          sequence: nextSequence + 1,
        }),
      );

      return {
        explanation: aiResponse.question,
        question: session.currentQuestion,
      };
    }

    if (aiResponse.action === 'end') {
      return this.completeInterview(session, history);
    }

    const nextQuestion = aiResponse.question ?? session.currentQuestion;

    if (!nextQuestion) {
      throw new InternalServerErrorException(
        'AI did not return the next interview question',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(InterviewMessage).save(
        manager.getRepository(InterviewMessage).create({
          sessionId,
          role: InterviewMessageRole.QUESTION,
          content: nextQuestion,
          sequence: nextSequence + 1,
        }),
      );

      session.currentQuestion = nextQuestion;
      session.questionCount += 1;
      await manager.getRepository(InterviewSession).save(session);
    });

    return {
      nextQuestion,
    };
  }

  private buildHistory(
    existingMessages: InterviewMessage[],
    latestAnswer: string,
  ) {
    const history: InterviewHistoryItem[] = [];

    let currentQuestion: string | null = null;

    for (const msg of existingMessages) {
      if (msg.role === InterviewMessageRole.QUESTION) {
        currentQuestion = msg.content;
      } else if (msg.role === InterviewMessageRole.ANSWER && currentQuestion) {
        history.push({
          question: currentQuestion,
          answer: msg.content,
        });
        currentQuestion = null;
      }
    }

    // pair latest answer with the last pending question
    const lastQuestionMessage = [...existingMessages]
      .reverse()
      .find((m) => m.role === InterviewMessageRole.QUESTION);

    const lastAnswerMessage = [...existingMessages]
      .reverse()
      .find((m) => m.role === InterviewMessageRole.ANSWER);

    if (
      lastQuestionMessage &&
      (!lastAnswerMessage ||
        lastAnswerMessage.sequence < lastQuestionMessage.sequence)
    ) {
      history.push({
        question: lastQuestionMessage.content,
        answer: latestAnswer,
      });
    }

    return history;
  }

  private async completeInterview(
    session: InterviewSession,
    history: InterviewHistoryItem[],
  ) {
    const finalReport: FinalInterviewReport =
      await this.aiService.generateFinalReport(
        history,
        session.resume,
        session.jobDescription,
      );

    session.status = InterviewSessionStatus.COMPLETED;
    session.finalReport = finalReport;
    session.currentQuestion = null;

    await this.sessionRepo.save(session);

    return {
      completed: true,
      report: finalReport,
    };
  }

  async getSessionById(userId: string, sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const messages = await this.messageRepo.find({
      where: { sessionId },
      order: { sequence: 'ASC' },
    });

    return {
      session,
      messages,
    };
  }
}
