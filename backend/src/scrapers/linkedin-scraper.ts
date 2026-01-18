import puppeteer from 'puppeteer-core';
import { lightpanda } from '@lightpanda/browser';
import * as cheerio from 'cheerio';
import { JobPosting, JobScraper } from './types';
import { extractSkills, extractRequirements, extractExperienceLevelFromText, extractEmploymentTypeFromText } from './utils';

export class LinkedInScraper implements JobScraper {
    canHandle(url: string): boolean {
        return url.includes('linkedin.com/jobs');
    }

    async scrape(jobUrl: string): Promise<JobPosting> {
        // Transform URL to public format if it contains currentJobId parameter
        let normalizedUrl = jobUrl;
        const currentJobIdMatch = jobUrl.match(/currentJobId=(\d+)/);
        if (currentJobIdMatch) {
            normalizedUrl = `https://www.linkedin.com/jobs/view/${currentJobIdMatch[1]}`;
            console.log(`🔄 [LinkedIn] Transformed URL: ${jobUrl} -> ${normalizedUrl}`);
        }

        // Essayer LightPanda d'abord
        try {
            console.log('🐼 [LinkedIn] Trying with LightPanda...');
            return await this.scrapeWithLightPanda(normalizedUrl, jobUrl);
        } catch (error: any) {
            console.log('⚠️ [LinkedIn] LightPanda failed:', error.message);
            console.log('🌐 [LinkedIn] Falling back to Bright Data...');
            return await this.scrapeWithBrightData(normalizedUrl, jobUrl);
        }
    }

    private async scrapeWithLightPanda(normalizedUrl: string, originalUrl: string): Promise<JobPosting> {
        console.log(`🐼 [LinkedIn] Scraping with LightPanda: ${normalizedUrl}`);
        
        let browser;
        let page;
        let proc;
        
        try {
            console.log('🏠 Using LightPanda Local');
            const lpdopts = {
                host: '127.0.0.1',
                port: 9222,
            };
            
            proc = await lightpanda.serve(lpdopts);
            
            const puppeteeropts = {
                browserWSEndpoint: 'ws://' + lpdopts.host + ':' + lpdopts.port,
            };
            browser = await puppeteer.connect(puppeteeropts);
            
            const context = await browser.createBrowserContext();
            page = await context.newPage();
            
            console.log('🌐 Navigating to LinkedIn with LightPanda...');
            await page.goto(normalizedUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const html = await page.content();
            
            // Cleanup
            await page.close();
            await context.close();
            await browser.disconnect();
            
            proc.stdout.destroy();
            proc.stderr.destroy();
            proc.kill();
            
            // Parse et vérifie - lance une erreur si page bloquée
            return this.parseLinkedInHTML(html, originalUrl);
            
        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            if (proc) {
                proc.stdout?.destroy();
                proc.stderr?.destroy();
                proc.kill();
            }
            throw error;
        }
    }

    private async scrapeWithBrightData(normalizedUrl: string, originalUrl: string): Promise<JobPosting> {
        const BRIGHT_DATA_USER = process.env.BRIGHT_DATA_USER;
        const BRIGHT_DATA_PASS = process.env.BRIGHT_DATA_PASS;

        if (!BRIGHT_DATA_USER || !BRIGHT_DATA_PASS) {
            throw new Error('Bright Data credentials not configured');
        }

        console.log(`🌐 [LinkedIn] Scraping with Bright Data: ${normalizedUrl}`);
        
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
            
            await page.close();
            await browser.disconnect();
            
            // Parse sans vérification stricte pour Bright Data
            return this.parseLinkedInHTMLSafe(html, originalUrl);
            
        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            throw new Error(`LinkedIn Bright Data scraping failed: ${error.message}`);
        }
    }

    // détecte les blocages (pour LightPanda)
    private parseLinkedInHTML(html: string, jobUrl: string): JobPosting {
        const $ = cheerio.load(html);
        
        // Extraire description d'abord pour vérifier le blocage
        const description = 
            $('.description__text').text().trim() ||
            $('.jobs-description__content').text().trim() ||
            $('.show-more-less-html__markup').text().trim() ||
            '';
        
        // Vérifier page d'erreur
        const pageText = $('body').text().toLowerCase();
        const pageTitle = $('title').text().toLowerCase();
        
        const isBlocked = 
            pageText.includes('page not found') ||
            pageText.includes('لم يتم') ||
            pageText.includes('verify you are human') ||
            pageText.includes('security check') ||
            pageTitle.includes('authwall') ||
            pageTitle.includes('sign in') ||
            !description || 
            description.length < 50;
        
        if (isBlocked) {
            console.warn('⚠️ Page bloquée ou inaccessible, fallback vers Bright Data...');
            throw new Error('Page blocked or requires authentication');
        }
        
        return this.parseLinkedInHTMLSafe(html, jobUrl);
    }

    // parse sans vérification (pour Bright Data)
    private parseLinkedInHTMLSafe(html: string, jobUrl: string): JobPosting {
        const $ = cheerio.load(html);
        
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
        
        if (!description || description.length < 50) {
            console.warn('⚠️ Description courte ou vide');
        }
        
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
    }
}