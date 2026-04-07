import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private apiKey = process.env.OPENROUTER_API_KEY;

  async generateNextStep(data: {
    resume: string;
    jd: string;
    history: any[];
    lastQuestion: string;
    userAnswer: string;
  }) {
    const prompt = `
You are a professional interviewer.

Resume:
${data.resume}

Job Description:
${data.jd}

Last Question:
${data.lastQuestion}

User Answer:
${data.userAnswer}

Conversation History:
${JSON.stringify(data.history)}

Instructions:
- Ask ONLY ONE question at a time
- Be conversational and natural
- If user says "repeat" → repeat same question
- If user says "skip" → ask new question
- If user is confused → explain simply then ask again
- Evaluate answer (technical + communication)
- Adjust difficulty based on answers
- Focus on skills from resume
- Always return valid JSON only. Do not add extra text.

Return STRICT JSON:
{
  "action": "ask | repeat | explain | end",
  "question": "...",
  "evaluation": {
    "technicalScore": number,
    "communicationScore": number,
    "feedback": "..."
  }
}
`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini', // fast + cheap
          messages: [
            {
              role: 'system',
              content: `
You are a senior interviewer at a top tech company.

Behavior rules:
- Speak like a human, not like AI
- Ask only ONE question at a time
- Sometimes ask follow-up questions based on answers
- If answer is weak → ask deeper question
- If answer is good → acknowledge briefly and move on
- Occasionally interrupt if answer is too long
- Be polite but slightly challenging

Tone:
- Professional
- Slightly strict
- Encouraging but not overly friendly

Additional Rules:
- Use natural filler phrases like a real interviewer
- If user mentions a project or technology, ask a follow-up question before switching topic
- If user says "I don't know", give a hint and allow retry once

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

      // IMPORTANT: Parse JSON safely
      return this.safeJsonParse(content);
    } catch (error) {
      console.error('OpenRouter Error:', error.response?.data || error.message);

      return {
        action: 'ask',
        question: 'Can you explain your recent project?',
        evaluation: {
          technicalScore: 5,
          communicationScore: 5,
          feedback: 'Fallback response',
        },
      };
    }
  }

  // 🛡️ Safe JSON parser
  private safeJsonParse(text: string) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found');
    } catch {
      return {
        action: 'ask',
        question: text,
        evaluation: null,
      };
    }
  }

  async generateFinalReport(history: any[], resume: string, jd: string) {
    const prompt = `
You are an expert interviewer.

Resume:
${resume}

Job Description:
${jd}

Interview Conversation:
${JSON.stringify(history)}

Instructions:
- Evaluate ALL answers together
- Give:
  1. Technical Score (0-10)
  2. Communication Score (0-10)
  3. Overall Score (0-10)
  4. Strengths
  5. Weaknesses
  6. Suggestions to improve

Return STRICT JSON:
{
  "technicalScore": number,
  "communicationScore": number,
  "overallScore": number,
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}
`;

    // 👉 call OpenRouter here (same axios code)
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini', // fast + cheap
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interviewer.',
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

      // ⚠️ IMPORTANT: Parse JSON safely
      return this.safeJsonParse(content);
    } catch (error) {
      console.error('OpenRouter Error:', error.response?.data || error.message);
    }
  }
}
