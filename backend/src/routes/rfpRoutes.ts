import { Router } from "express";
import { runRfpProcess } from '../agents/mainAgent';

const router = Router();

router.post('/process', async (req, res) => {
  try {
    console.log('RFP processing request received...');
    const result = await runRfpProcess();
    console.log('RFP processing finished.');
    res.json(result);
  } catch (error) {
    console.error('Error processing RFP:', error);
    res.status(500).json({ error: 'Failed to process RFP' });
  }
});

export { router as rfpRoutes };
