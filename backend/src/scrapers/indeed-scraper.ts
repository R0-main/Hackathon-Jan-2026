import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { JobPosting, JobScraper } from './types';
import { extractSkills, extractRequirements, extractExperienceLevelFromText, extractEmploymentTypeFromText } from './utils';
import { lightPandaManager } from './lightpanda-manager';

export class IndeedScraper implements JobScraper {
    canHandle(url: string): boolean {
        return url.includes('indeed.com') || url.includes('indeed.fr');
    }

    async scrape(jobUrl: string): Promise<JobPosting> {
        // Try LightPanda first
        try {
            console.log('🐼 [Indeed] Trying with LightPanda...');
            return await this.scrapeWithLightPanda(jobUrl);
        } catch (error: any) {
            console.log('⚠️ [Indeed] LightPanda failed:', error.message);
            console.log('🌐 [Indeed] Falling back to Bright Data...');
            return await this.scrapeWithBrightData(jobUrl);
        }
    }

    private async scrapeWithLightPanda(jobUrl: string): Promise<JobPosting> {
        console.log(`🐼 [Indeed] Scraping with LightPanda: ${jobUrl}`);

        let page;
        let context;

        try {
            const browser = await lightPandaManager.acquire('indeed');

            context = await browser.createBrowserContext();
            page = await context.newPage();

            console.log('🌐 Navigating to Indeed with LightPanda...');
            await page.goto(jobUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            const html = await page.content();

            // Cleanup
            await page.close().catch(() => {});
            await context.close().catch(() => {});
            await lightPandaManager.release();

            // Parse and verify - throws error if blocked
            return this.parseIndeedHTML(html, jobUrl);

        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (context) await context.close().catch(() => {});
            await lightPandaManager.release();
            throw error;
        }
    }

    private async scrapeWithBrightData(jobUrl: string): Promise<JobPosting> {
        const BRIGHT_DATA_USER = process.env.BRIGHT_DATA_USER;
        const BRIGHT_DATA_PASS = process.env.BRIGHT_DATA_PASS;

        if (!BRIGHT_DATA_USER || !BRIGHT_DATA_PASS) {
            throw new Error('Bright Data credentials not configured. LightPanda also failed.');
        }

        console.log(`🌐 [Indeed] Scraping with Bright Data: ${jobUrl}`);

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

            console.log('🌐 Navigating to Indeed with Bright Data...');

            await page.goto(jobUrl, {
                waitUntil: 'networkidle0',
                timeout: 60000,
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            const html = await page.content();
            await page.close();
            await browser.disconnect();

            // Parse without strict verification for Bright Data
            return this.parseIndeedHTMLSafe(html, jobUrl);

        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            throw new Error(`Indeed scraping failed: ${error.message}`);
        }
    }

    // Detects blocks (for LightPanda)
    private parseIndeedHTML(html: string, jobUrl: string): JobPosting {
        const $ = cheerio.load(html);

        // Extract description first to check for blocking
        const description =
            $('#jobDescriptionText').text().trim() ||
            $('.jobsearch-jobDescriptionText').text().trim() ||
            $('[id*="jobDescription"]').text().trim() ||
            '';

        // Block detection - throws error for fallback
        const pageTitle = $('title').text().toLowerCase();
        const isBlocked =
            !description ||
            description.length < 50 ||
            html.toLowerCase().includes('additional verification') ||
            html.toLowerCase().includes('verify you are human') ||
            pageTitle.includes('just a moment') ||
            pageTitle.includes('verification') ||
            pageTitle.includes('captcha');

        if (isBlocked) {
            console.warn('⚠️ Page blocked, falling back to Bright Data...');
            throw new Error('Page blocked by anti-bot protection');
        }

        return this.parseIndeedHTMLSafe(html, jobUrl);
    }

    // Parse without verification (for Bright Data)
    private parseIndeedHTMLSafe(html: string, jobUrl: string): JobPosting {
        const $ = cheerio.load(html);

        const title =
            $('h1.jobsearch-JobInfoHeader-title').first().text().trim() ||
            $('.jobsearch-JobInfoHeader-title span').first().text().trim() ||
            $('h1[class*="jobTitle"]').first().text().trim() ||
            $('h1').first().text().trim() ||
            'Poste non spécifié';

        const company =
            $('[data-testid="inlineHeader-companyName"]').first().text().trim() ||
            $('.jobsearch-InlineCompanyRating-companyHeader a').first().text().trim() ||
            $('.jobsearch-CompanyInfoContainer a').first().text().trim() ||
            $('[data-company-name]').attr('data-company-name') ||
            'Entreprise non spécifiée';

        const location =
            $('[data-testid="inlineHeader-companyLocation"]').first().text().trim() ||
            $('.jobsearch-JobInfoHeader-subtitle > div').last().text().trim() ||
            $('[class*="location"]').first().text().trim() ||
            'Localisation non spécifiée';

        const salary =
            $('#salaryInfoAndJobType span').first().text().trim() ||
            $('.jobsearch-JobMetadataHeader-item').filter((i, el) => $(el).text().includes('€')).text().trim() ||
            undefined;

        const description =
            $('#jobDescriptionText').text().trim() ||
            $('.jobsearch-jobDescriptionText').text().trim() ||
            $('[id*="jobDescription"]').text().trim() ||
            '';

        if (!description || description.length < 50) {
            console.warn('⚠️ Short or empty description');
        }

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
    }
}
