// src/routes/job-route.ts
import { Router, Request, Response } from 'express';
import { getScraperForUrl } from '../scrapers';

const router = Router();

router.post('/scrape-job', async (req: Request, res: Response) => {
    try {
        const { jobUrl } = req.body;

        if (!jobUrl) {
            return res.status(400).json({ 
                success: false,
                error: 'Job URL is required' 
            });
        }

        console.log('🔍 Scraping job:', jobUrl);

        // Détection automatique de la plateforme
        const scraper = getScraperForUrl(jobUrl);
        const job = await scraper.scrape(jobUrl);

        return res.json({
            success: true,
            data: job,
            message: `Job scraped from ${job.platform}`
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to scrape job posting',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;