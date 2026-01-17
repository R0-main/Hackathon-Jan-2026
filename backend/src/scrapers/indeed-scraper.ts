import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { JobPosting, JobScraper } from './types';
import { extractSkills, extractRequirements, extractExperienceLevelFromText, extractEmploymentTypeFromText } from './utils';

export class IndeedScraper implements JobScraper {
    canHandle(url: string): boolean {
        return url.includes('indeed.com') || url.includes('indeed.fr');
    }

    async scrape(jobUrl: string): Promise<JobPosting> {
        const BRIGHT_DATA_USER = process.env.BRIGHT_DATA_USER;
        const BRIGHT_DATA_PASS = process.env.BRIGHT_DATA_PASS;
        
        if (!BRIGHT_DATA_USER || !BRIGHT_DATA_PASS) {
            throw new Error('Bright Data credentials not configured');
        }
        
        console.log(`🟢 [Indeed] Scraping: ${jobUrl}`);
        
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
            
            console.log('🌐 Navigating to Indeed...');
            
            await page.goto(jobUrl, {
                waitUntil: 'networkidle0',
                timeout: 60000,
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const html = await page.content();
            const $ = cheerio.load(html);
            
            // Extraire titre
            const title = 
                $('h1.jobsearch-JobInfoHeader-title').first().text().trim() ||
                $('.jobsearch-JobInfoHeader-title span').first().text().trim() ||
                $('h1[class*="jobTitle"]').first().text().trim() ||
                $('h1').first().text().trim() ||
                'Poste non spécifié';
            
            // Extraire entreprise
            const company = 
                $('[data-testid="inlineHeader-companyName"]').first().text().trim() ||
                $('.jobsearch-InlineCompanyRating-companyHeader a').first().text().trim() ||
                $('.jobsearch-CompanyInfoContainer a').first().text().trim() ||
                $('[data-company-name]').attr('data-company-name') ||
                'Entreprise non spécifiée';
            
            // Extraire localisation
            const location = 
                $('[data-testid="inlineHeader-companyLocation"]').first().text().trim() ||
                $('.jobsearch-JobInfoHeader-subtitle > div').last().text().trim() ||
                $('[class*="location"]').first().text().trim() ||
                'Localisation non spécifiée';
            
            // Extraire salaire
            const salary = 
                $('#salaryInfoAndJobType span').first().text().trim() ||
                $('.jobsearch-JobMetadataHeader-item').filter((i, el) => $(el).text().includes('€')).text().trim() ||
                undefined;
            
            // Extraire description
            const description = 
                $('#jobDescriptionText').text().trim() ||
                $('.jobsearch-jobDescriptionText').text().trim() ||
                $('[id*="jobDescription"]').text().trim() ||
                '';
            
            if (!description || description.length < 50) {
                console.warn('⚠️ Description courte, page peut-être bloquée');
            }
            
            await page.close();
            await browser.disconnect();
            
            console.log(`✅ [Indeed] Scraped: ${title} at ${company}`);
            
            return {
                title,
                company,
                location,
                description,
                requirements: extractRequirements(description),
                skills: extractSkills(description),
                experienceLevel: extractExperienceLevelFromText(description),
                employmentType: extractEmploymentTypeFromText(description),
                salary,
                url: jobUrl,
                platform: 'indeed',
            };
            
        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            throw new Error(`Indeed scraping failed: ${error.message}`);
        }
    }
}