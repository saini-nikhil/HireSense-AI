import { Injectable } from '@nestjs/common';
import { findJobsForResume } from './jobscaraper';

@Injectable()
export class WebscraperService {
  constructor() {}
  async webscraper(
    resumeText: string,
    jobDescription: string,
    location: string,
  ) {
    try {
      return findJobsForResume(resumeText, jobDescription, location);
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }
}
