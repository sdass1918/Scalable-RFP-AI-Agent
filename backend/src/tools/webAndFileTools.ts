import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio'

export const getRfpWebsiteContent = async () => {
    const filePath = path.join(process.cwd(), 'data', 'sampleRfpWebsite.html');
    const htmlContent = await fs.readFile(filePath, 'utf-8');

    const $ = cheerio.load(htmlContent);
    const textContent = $('body').text().replace(/\s\s+/g, ' ').trim();
    return textContent;
};