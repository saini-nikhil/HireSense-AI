export type AiAction = 'next' | 'repeat' | 'explain' | 'end';

export interface InterviewHistoryItem {
  question: string;
  answer: string;
}

export interface AiEvaluation {
  technicalScore: number;
  communicationScore: number;
  feedback: string;
}

export interface AiResponse {
  action: AiAction;
  question?: string;
  evaluation?: AiEvaluation | null;
}

export interface FinalInterviewReport {
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
