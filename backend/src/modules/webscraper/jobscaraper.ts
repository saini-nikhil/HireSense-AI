import * as dotenv from 'dotenv';
dotenv.config();

// ---------------------------------------------------------------------------
// Model fallback chain — tries each in order on failure / rate-limit
// ---------------------------------------------------------------------------
const MODELS = [
  'gpt-4o-mini',
  'google/gemma-3-12b-it:free',
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// Core AI caller with automatic model fallback
// ---------------------------------------------------------------------------
async function callAI(prompt: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Resume Job Finder',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
          }),
        },
      );

      const data = await response.json();

      // Rate-limit or upstream error — try next model
      if (!response.ok || data?.error) {
        console.warn(
          `Model ${model} failed:`,
          data?.error?.message ?? response.status,
        );
        lastError = new Error(
          data?.error?.message ?? `HTTP ${response.status}`,
        );
        await delay(500); // small pause before trying next model
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error(
          `No content from model ${model}: ${JSON.stringify(data)}`,
        );
        continue;
      }

      return content;
    } catch (err) {
      lastError = err as Error;
      console.warn(`Model ${model} threw:`, (err as Error).message);
      continue;
    }
  }

  throw new Error(
    `All AI models failed. Last error: ${lastError?.message ?? 'Unknown error'}`,
  );
}

// ---------------------------------------------------------------------------
// Safe JSON parse helper
// ---------------------------------------------------------------------------
function parseJSON<T>(text: string): T {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as T;
}

// ---------------------------------------------------------------------------
// Step 1: Extract keywords from resume
// ---------------------------------------------------------------------------
async function extractKeywordsFromResume(
  resumeText: string,
  location: string,
): Promise<{
  jobTitles: string[];
  location: string;
  skills: string[];
}> {
  const textInput =
    typeof resumeText === 'string' ? resumeText : JSON.stringify(resumeText);

  const text =
    await callAI(`Extract the top 3 job titles, primary location "${location}", and top 5 skills from this resume.
Return ONLY valid JSON, no explanation, no markdown:
{"jobTitles": ["title1", "title2"], "location": "city, country", "skills": ["skill1"]}

Resume: ${textInput.slice(0, 3000)}`);

  return parseJSON(text);
}

async function scrapeJobs({
  jobTitles,
  location,
}: {
  jobTitles: string[];
  location: string;
}): Promise<any[]> {
  const query = `${jobTitles[0]} jobs in ${location}`;

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
    query,
  )}&page=1&num_pages=1&country=us&date_posted=all`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY!,
      },
    });

    const data = await response.json();

    // return only job results
    return data.data || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Step 3: Rank & match jobs using AI
// ---------------------------------------------------------------------------
async function rankJobsWithAI(
  jobs: any[],
  resumeText: string,
  userJobDescription: string,
): Promise<any[]> {
  const jobsSummary = jobs.slice(0, 15).map((j, i) => ({
    id: i,
    title: j.title,
    company: j.company,
    description: (j.description || '').slice(0, 300),
  }));

  const textInput =
    typeof resumeText === 'string' ? resumeText : JSON.stringify(resumeText);

  const text =
    await callAI(`You are a job matching expert. Score each job 0-100 based on fit with the resume and target job description.
Return ONLY valid JSON, no explanation, no markdown:
{"rankedJobs": [{"id": 0, "score": 85, "reason": "short reason"}]}

Resume: ${textInput.slice(0, 1500)}
Target JD: ${userJobDescription || 'Not provided'}
Jobs: ${JSON.stringify(jobsSummary)}`);

  const { rankedJobs } = parseJSON<{
    rankedJobs: { id: number; score: number; reason: string }[];
  }>(text);

  return rankedJobs
    .sort((a, b) => b.score - a.score)
    .map((ranked) => ({
      ...jobs[ranked.id],
      matchScore: ranked.score,
      matchReason: ranked.reason,
    }));
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------
export async function findJobsForResume(
  resumeText: string,
  userJobDescription,
  location: string,
): Promise<any[]> {
  // console.log('[1/3] Extracting keywords from resume...');
  const keywords = await extractKeywordsFromResume(resumeText, location);
  console.log('Keywords:', keywords);

  // console.log('[2/3] Scraping jobs via JsSearch...');
  const jobs = await scrapeJobs(keywords);
  console.log(`Found ${jobs.length} jobs`);

  // Pause between AI calls to avoid upstream rate-limit
  await delay(2000);

  // console.log('[3/3] Ranking jobs with AI...', jobs, jobs.length);
  const rankedJobs = await rankJobsWithAI(jobs, resumeText, userJobDescription);
  // console.log('Ranked jobs:', rankedJobs);

  return rankedJobs;
}
