import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private apiKey = process.env.OPENROUTER_API_KEY;

  // ================= NEXT QUESTION =================
  async generateNextStep(data: {
    resume: string;
    jd: string;
    history: any[];
    lastQuestion: string;
    userAnswer: string;
  }) {
    console.log('data', data);

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
  "action": "ask | repeat | explain | end",
  "question": "...",
  "evaluation": {
    "technicalScore": number,
    "communicationScore": number,
    "feedback": "short feedback"
  }
}
`;

    try {
      const response = await axios.post(
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

      const content = response.data.choices[0].message.content;

      return this.safeJsonParse(content);
    } catch (error) {
      console.error('OpenRouter Error:', error.response?.data || error.message);

      // fallback
      return {
        action: 'ask',
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
  async generateFinalReport(history: any[], resume: string, jd: string) {
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
      const response = await axios.post(
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

      const content = response.data.choices[0].message.content;

      return this.safeJsonParse(content);
    } catch (error) {
      console.error('OpenRouter Error:', error.response?.data || error.message);

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
  private safeJsonParse(text: string) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Invalid JSON');
    } catch (e) {
      console.warn('JSON parse failed, fallback:', text);

      return {
        action: 'ask',
        question: text,
        evaluation: null,
      };
    }
  }
}
