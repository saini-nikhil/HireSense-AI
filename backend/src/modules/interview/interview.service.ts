import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Interview } from './interview.entity';
import * as FormData from 'form-data';
import { UploadedFile } from '../../common/types/uploaded-file.type';
import { findJobsForResume } from './test'

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
  ) {}

  
  // console.log(this.AI_URL);

  // 🚀 START INTERVIEW
async startInterview(userId: string, file: UploadedFile, jobDescription: string) {
  const aiUrl = process.env.PYTHON_API_URL;

  const formData = new FormData();
  

  formData.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  formData.append('jobDescription', jobDescription);
// return await formData
  const res = await axios.post(`${aiUrl}/evaluate`, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });

  const result = res.data;
  const resumeContent = result.analysis?.summary || '';
  await findJobsForResume(resumeContent, jobDescription);
  // console.log("result",result);


    // ✅ create + save
  const interview = this.interviewRepo.create({
    userId,
    resumeText: result.analysis?.summary || '', // or store separately
    questions: result?.interview?.questions || [],
    answers: [],
  });


    const savedInterview = await this.interviewRepo.save(interview);
    console.log(savedInterview)

    return {
      interviewId: savedInterview.id, // ✅ fixed
      question: savedInterview.questions,
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

    const aiUrl = process.env.PYTHON_API_URL;

    // 🔥 Evaluate via Python
    const evalRes = await axios.post(`${aiUrl}/interview/evaluate`, {
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
