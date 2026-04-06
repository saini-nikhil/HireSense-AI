// jobScraper.js
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

/**
 * Helper: Call OpenRouter with Qwen free model
 */
async function callQwen(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000", // your site URL
      "X-Title": "Resume Job Finder"
    },
    body: JSON.stringify({
      model: "qwen/qwen3-235b-a22b:free", // free Qwen model on OpenRouter
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Step 1: Extract keywords from resume
 */
async function extractKeywordsFromResume(resumeText) {
  const text = await callQwen(`Extract the top 3 job titles and primary location from this resume.
Return ONLY valid JSON, no explanation, no markdown:
{"jobTitles": ["title1", "title2"], "location": "city, country", "skills": ["skill1"]}

Resume: ${resumeText.slice(0, 3000)}`);

  // Strip markdown code fences if model adds them
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/**
 * Step 2: Scrape jobs via Apify
 */
async function scrapeJobs({ jobTitles, location }) {
  const run = await client.actor("bebity/linkedin-jobs-scraper").call({
    queries: jobTitles.map(title => `${title} ${location}`),
    location: location,
    maxResults: 20,
    datePosted: "month",
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items;
}

/**
 * Step 3: Rank & match jobs using Qwen
 */
async function rankJobsWithAI(jobs, resumeText, userJobDescription) {
  const jobsSummary = jobs.slice(0, 15).map((j, i) => ({
    id: i,
    title: j.title,
    company: j.company,
    description: (j.description || "").slice(0, 300)
  }));

  const text = await callQwen(`You are a job matching expert. Score each job 0-100 based on fit with the resume and target job description.
Return ONLY valid JSON, no explanation, no markdown:
{"rankedJobs": [{"id": 0, "score": 85, "reason": "short reason"}]}

Resume: ${resumeText.slice(0, 1500)}
Target JD: ${userJobDescription || "Not provided"}
Jobs: ${JSON.stringify(jobsSummary)}`);

  const clean = text.replace(/```json|```/g, "").trim();
  const { rankedJobs } = JSON.parse(clean);

  return rankedJobs
    .sort((a, b) => b.score - a.score)
    .map(ranked => ({
      ...jobs[ranked.id],
      matchScore: ranked.score,
      matchReason: ranked.reason
    }));
}

/**
 * Main pipeline
 */
export async function findJobsForResume(resumeText, userJobDescription = "") {
  const keywords = await extractKeywordsFromResume(resumeText);
  const jobs = await scrapeJobs(keywords);
  const rankedJobs = await rankJobsWithAI(jobs, resumeText, userJobDescription);
  return rankedJobs;
}