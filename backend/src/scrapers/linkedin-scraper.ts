import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { JobPosting, JobScraper } from './types';
import { extractSkills, extractRequirements, extractExperienceLevelFromText, extractEmploymentTypeFromText } from './utils';

export class LinkedInScraper implements JobScraper {
    canHandle(url: string): boolean {
        return url.includes('linkedin.com/jobs');
    }

    async scrape(jobUrl: string): Promise<JobPosting> {
        const BRIGHT_DATA_USER = process.env.BRIGHT_DATA_USER;
        const BRIGHT_DATA_PASS = process.env.BRIGHT_DATA_PASS;

        if (!BRIGHT_DATA_USER || !BRIGHT_DATA_PASS) {
            throw new Error('Bright Data credentials not configured');
        }

        // Transform URL to public format if it contains currentJobId parameter
        let normalizedUrl = jobUrl;
        const currentJobIdMatch = jobUrl.match(/currentJobId=(\d+)/);
        if (currentJobIdMatch) {
            normalizedUrl = `https://www.linkedin.com/jobs/view/${currentJobIdMatch[1]}`;
            console.log(`🔄 [LinkedIn] Transformed URL: ${jobUrl} -> ${normalizedUrl}`);
        }

        console.log(`🔵 [LinkedIn] Scraping: ${normalizedUrl}`);
        
        let browser;
        let page;
        
        try {
            const brightDataWss = `wss://${BRIGHT_DATA_USER}:${BRIGHT_DATA_PASS}@brd.superproxy.io:9222`;
            
            browser = await puppeteer.connect({
                browserWSEndpoint: brightDataWss,
            });
            
            page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
            
            await page.goto(normalizedUrl, {
                waitUntil: 'networkidle0',
                timeout: 60000,
            });
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const html = await page.content();
            const $ = cheerio.load(html);
            
            // Vérifier page d'erreur
            const pageText = $('body').text().toLowerCase();
            if (pageText.includes('page not found') || pageText.includes('لم يتم')) {
                throw new Error('Job not found');
            }
            
            const title = 
                $('.top-card-layout__title').first().text().trim() ||
                $('h1.topcard__title').first().text().trim() ||
                $('.jobs-unified-top-card__job-title').first().text().trim() ||
                $('h1').first().text().trim() ||
                'Poste non spécifié';
            
            const company = 
                $('.topcard__org-name-link').first().text().trim() ||
                $('.jobs-unified-top-card__company-name a').first().text().trim() ||
                $('a[data-tracking-control-name*="company"]').first().text().trim() ||
                'Entreprise non spécifiée';
            
            const location = 
                $('.topcard__flavor--bullet').first().text().trim() ||
                $('.jobs-unified-top-card__bullet').first().text().trim() ||
                'Localisation non spécifiée';
            
            const description = 
                $('.description__text').text().trim() ||
                $('.jobs-description__content').text().trim() ||
                $('.show-more-less-html__markup').text().trim() ||
                '';
            
            await page.close();
            await browser.disconnect();
            
            console.log(`✅ [LinkedIn] Scraped: ${title}`);
            
            return {
                title,
                company,
                location,
                description,
                requirements: extractRequirements(description),
                skills: extractSkills(description),
                experienceLevel: extractExperienceLevelFromText(description),
                employmentType: extractEmploymentTypeFromText(description),
                url: jobUrl,
                platform: 'linkedin',
            };
            
        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            throw new Error(`LinkedIn scraping failed: ${error.message}`);
        }
    }
}