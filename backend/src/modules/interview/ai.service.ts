import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  AiResponse,
  FinalInterviewReport,
  InterviewHistoryItem,
} from './interview.types';

interface OpenRouterMessage {
  content?: unknown;
}

interface OpenRouterChoice {
  message?: OpenRouterMessage;
}

interface OpenRouterResponseBody {
  choices?: OpenRouterChoice[];
}

@Injectable()
export class AiService {
  private apiKey = process.env.OPENROUTER_API_KEY;

  // ================= NEXT QUESTION =================
  async generateNextStep(data: {
    resume: string;
    jd: string;
    history: InterviewHistoryItem[];
    lastQuestion: string;
    userAnswer: string;
  }): Promise<AiResponse> {
    const prompt = `
You are a professional interviewer.

Candidate Resume:
${data.resume}

Job Description:
${data.jd}

Last Question:
${data.lastQuestion}

User Answer:
${data.userAnswer}

Conversation History:
${JSON.stringify(data.history)}

=========================
STRICT INTERVIEW RULES:
=========================

1. PRIORITY ORDER:
   - FIRST: Ask from RESUME (projects, skills, experience)
   - SECOND: Match with JOB DESCRIPTION
   - THIRD: Only then ask generic questions

2. NEVER ask generic questions unless necessary.

3. ALWAYS:
   - Pick something specific from resume
   - Ask deep follow-up questions
   - Connect with real-world scenarios

4. If candidate mentions:
   - Project → ask architecture, challenges, decisions
   - Tech → ask implementation details
   - Experience → ask real-world usage

5. Behavior:
   - Ask ONLY ONE question
   - Be human, slightly challenging
   - If answer weak → go deeper
   - If good → move forward

6. Special:
   - "repeat" → repeat question
   - confused → explain + ask again
   - end → finish interview

=========================
OUTPUT (STRICT JSON ONLY)
=========================

{
  "action": "next | repeat | explain | end",
  "question": "...",
  "evaluation": {
    "technicalScore": number,
    "communicationScore": number,
    "feedback": "short feedback"
  }
}
`;

    try {
      const response = await axios.post<OpenRouterResponseBody>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
You are a senior technical interviewer.

CRITICAL RULES:
- Always use RESUME first
- Then align with JOB DESCRIPTION
- Never ignore resume content

STYLE:
- Human-like
- Ask deep technical follow-ups
- Focus on real projects
- Slightly strict but fair
`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices?.[0]?.message?.content;

      if (typeof content !== 'string') {
        throw new Error('OpenRouter response content is missing or invalid');
      }

      return this.safeJsonParse(content);
    } catch (error: unknown) {
      console.error('OpenRouter Error:', this.getErrorDetails(error));

      // fallback
      return {
        action: 'next',
        question:
          'Can you explain one of your recent projects and the technologies you used?',
        evaluation: {
          technicalScore: 5,
          communicationScore: 5,
          feedback: 'Fallback response',
        },
      };
    }
  }

  // ================= FINAL REPORT =================
  async generateFinalReport(
    history: InterviewHistoryItem[],
    resume: string,
    jd: string,
  ): Promise<FinalInterviewReport> {
    const prompt = `
You are an expert interviewer.

Resume:
${resume}

Job Description:
${jd}

Interview Conversation:
${JSON.stringify(history)}

=========================
EVALUATION RULES:
=========================

- Evaluate ALL answers together
- Consider both resume claims + actual answers
- Be realistic (not overly positive)

=========================
OUTPUT (STRICT JSON)
=========================

{
  "technicalScore": number,
  "communicationScore": number,
  "overallScore": number,
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}
`;

    try {
      const response = await axios.post<OpenRouterResponseBody>(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
You are a strict but fair technical interviewer.

Give honest feedback.
Avoid generic praise.
Be specific.
`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.6,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices?.[0]?.message?.content;

      if (typeof content !== 'string') {
        throw new Error('OpenRouter response content is missing or invalid');
      }

      return this.safeFinalReportParse(content);
    } catch (error: unknown) {
      console.error('OpenRouter Error:', this.getErrorDetails(error));

      return {
        technicalScore: 5,
        communicationScore: 5,
        overallScore: 5,
        strengths: ['Basic understanding of concepts'],
        weaknesses: ['Needs improvement in explaining concepts clearly'],
        suggestions: ['Practice mock interviews and project explanations'],
      };
    }
  }

  // ================= SAFE JSON PARSER =================
  private safeJsonParse(text: string): AiResponse {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed: unknown = JSON.parse(match[0]);
        const normalized = this.normalizeAiResponse(parsed);

        if (normalized) {
          return normalized;
        }
      }
      throw new Error('Invalid AI response JSON');
    } catch {
      console.warn('JSON parse failed, fallback:', text);

      return {
        action: 'next',
        question: text,
        evaluation: null,
      };
    }
  }

  private normalizeAiResponse(value: unknown): AiResponse | null {
    if (!this.isRecord(value)) {
      return null;
    }

    const rawAction = value.action;
    const question = value.question;
    const evaluation = value.evaluation;

    if (typeof rawAction !== 'string') {
      return null;
    }

    const action = rawAction === 'ask' ? 'next' : rawAction;

    if (
      action !== 'next' &&
      action !== 'repeat' &&
      action !== 'explain' &&
      action !== 'end'
    ) {
      return null;
    }

    if (question !== undefined && typeof question !== 'string') {
      return null;
    }

    if (
      evaluation !== undefined &&
      evaluation !== null &&
      !this.isAiEvaluation(evaluation)
    ) {
      return null;
    }

    return {
      action,
      question,
      evaluation,
    };
  }

  private safeFinalReportParse(text: string): FinalInterviewReport {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed: unknown = JSON.parse(match[0]);

        if (this.isFinalInterviewReport(parsed)) {
          return parsed;
        }
      }
      throw new Error('Invalid final report JSON');
    } catch {
      console.warn('Final report parse failed, fallback:', text);

      return {
        technicalScore: 5,
        communicationScore: 5,
        overallScore: 5,
        strengths: ['Basic understanding of concepts'],
        weaknesses: ['Needs improvement in explaining concepts clearly'],
        suggestions: ['Practice mock interviews and project explanations'],
      };
    }
  }

  private isAiResponse(value: unknown): value is AiResponse {
    if (!this.isRecord(value)) {
      return false;
    }

    const action = value.action;
    const question = value.question;

    return (
      (action === 'next' ||
        action === 'repeat' ||
        action === 'explain' ||
        action === 'end') &&
      (question === undefined || typeof question === 'string')
    );
  }

  private isAiEvaluation(value: unknown): value is AiResponse['evaluation'] {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.technicalScore === 'number' &&
      typeof value.communicationScore === 'number' &&
      typeof value.feedback === 'string'
    );
  }

  private isFinalInterviewReport(
    value: unknown,
  ): value is FinalInterviewReport {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.technicalScore === 'number' &&
      typeof value.communicationScore === 'number' &&
      typeof value.overallScore === 'number' &&
      this.isStringArray(value.strengths) &&
      this.isStringArray(value.weaknesses) &&
      this.isStringArray(value.suggestions)
    );
  }

  private isStringArray(value: unknown): value is string[] {
    return (
      Array.isArray(value) && value.every((item) => typeof item === 'string')
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getErrorDetails(error: unknown): unknown {
    if (axios.isAxiosError(error)) {
      return error.response?.data ?? error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return error;
  }

  detectIntent(answer: string): boolean {
    const text = answer.toLowerCase().trim();

    const patterns = [
      /\bend interview\b/,
      /\bstop interview\b/,
      /\bfinish interview\b/,
      /\bexit interview\b/,
      /\bi'?m done\b/,
      /\bi am done\b/,
      /\blet'?s end\b/,
      /\bwrap (this )?up\b/,
      /\bthat'?s all\b/,
      /\bno more questions\b/,
    ];

    return patterns.some((pattern) => pattern.test(text));
  }
}
