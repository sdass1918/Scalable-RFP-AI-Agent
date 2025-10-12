// import fs from 'fs/promises';
// import path from 'path';
import axios from 'axios'
import * as cheerio from 'cheerio'

export const getRfpWebsiteContent = async (url: string) => {
    console.log(`[Tool] Scraping content from live URL: ${url}`);

    const response = await axios.get(url);
    const htmlContent = response.data as string;
    // const filePath = path.join(process.cwd(), 'data', 'sampleRfpWebsite.html');
    // const htmlContent = await fs.readFile(filePath, 'utf-8');

    const $ = cheerio.load(htmlContent);
    const textContent = $('body').text().replace(/\s\s+/g, ' ').trim();
    return textContent.substring(0, 4000);
};