
import { Router, Request, Response } from 'express';
import { scrapeLinkedInJob, jobToText } from './job-scraper';

const router = Router();

// Route pour scraper une offre d'emploi LinkedIn
router.post('/scrape-job', async (req: Request, res: Response) => {
    try {
        const { jobUrl } = req.body;
        
        if (!jobUrl) {
            return res.status(400).json({ 
                success: false,
                error: 'Job URL is required' 
            });
        }
        
        if (!jobUrl.includes('linkedin.com/jobs')) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid LinkedIn job URL' 
            });
        }
        
        console.log('🔍 Scraping LinkedIn job:', jobUrl);
        const job = await scrapeLinkedInJob(jobUrl);
        
        return res.json({
            success: true,
            data: job,
            message: 'Job posting scraped successfully'
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to scrape LinkedIn job posting',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;