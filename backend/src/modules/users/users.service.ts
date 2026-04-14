import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { resumeTemplate } from './templates/resume.template';
@Injectable()
export class UsersService {
  async generatePdf(data: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true, // ✅ fixed
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();

    const html = resumeTemplate(data);

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdfUint8); // ✅ fixed
  }
}
