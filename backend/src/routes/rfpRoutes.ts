import { Router } from "express";
import { runRfpProcess } from '../agents/mainAgent';

const router = Router();

router.post('/process', async (req, res) => {
  try {
    const url: string = req.body.url;

    if (!url) {
      return res.status(400).json({ error: 'URL is required in the request body.' });
    }
    console.log(`RFP processing request received for URL: ${url}`);
    const result = await runRfpProcess(url);
    console.log('RFP processing finished.');
    res.json(result);
  } catch (error) {
    console.error('Error processing RFP:', error);
    res.status(500).json({ error: 'Failed to process RFP' });
  }
});

export { router as rfpRoutes };
