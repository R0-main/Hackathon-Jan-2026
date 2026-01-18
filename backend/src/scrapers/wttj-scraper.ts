import puppeteer from 'puppeteer-core';
import { lightpanda } from '@lightpanda/browser';
import { JobPosting, JobScraper } from './types';
import { extractSkills, extractRequirements, extractExperienceLevelFromText, extractEmploymentTypeFromText } from './utils';

export class WelcomeToTheJungleScraper implements JobScraper {
    canHandle(url: string): boolean {
        return url.includes('welcometothejungle.com');
    }

    async scrape(jobUrl: string): Promise<JobPosting> {
        // Essayer LightPanda d'abord
        try {
            console.log('🐼 [WTTJ] Trying with LightPanda...');
            return await this.scrapeWithLightPanda(jobUrl);
        } catch (error: any) {
            console.log('⚠️ [WTTJ] LightPanda failed:', error.message);
            console.log('🌐 [WTTJ] Falling back to Bright Data...');
            return await this.scrapeWithBrightData(jobUrl);
        }
    }

    private async scrapeWithLightPanda(jobUrl: string): Promise<JobPosting> {
        console.log(`🐼 [WTTJ] Scraping with LightPanda: ${jobUrl}`);
        
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
            
            console.log('🌐 Navigating to WTTJ with LightPanda...');
            
            await page.goto(jobUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });
            
            console.log('⏳ Waiting for React to render (2 seconds)...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('🔍 Extracting job data from DOM...');
            
            const jobData = await this.extractJobData(page);
            
            // Cleanup
            await page.close();
            await context.close();
            await browser.disconnect();
            
            proc.stdout.destroy();
            proc.stderr.destroy();
            proc.kill();
            
            // Vérifier si données valides
            if (!jobData.description || jobData.description.length < 100 || 
                jobData.title === 'Poste non spécifié') {
                console.warn('⚠️ Données insuffisantes, fallback vers Bright Data...');
                throw new Error('Insufficient data extracted');
            }
            
            console.log(`✅ [WTTJ] Scraped with LightPanda: ${jobData.title} at ${jobData.company}`);
            
            return {
                title: jobData.title,
                company: jobData.company,
                location: jobData.location,
                description: jobData.description,
                requirements: extractRequirements(jobData.description),
                skills: extractSkills(jobData.description),
                experienceLevel: extractExperienceLevelFromText(jobData.description),
                employmentType: extractEmploymentTypeFromText(jobData.description),
                url: jobUrl,
                platform: 'wttj',
            };
            
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

    private async scrapeWithBrightData(jobUrl: string): Promise<JobPosting> {
        const BRIGHT_DATA_USER = process.env.BRIGHT_DATA_USER;
        const BRIGHT_DATA_PASS = process.env.BRIGHT_DATA_PASS;
        
        if (!BRIGHT_DATA_USER || !BRIGHT_DATA_PASS) {
            throw new Error('Bright Data credentials not configured');
        }
        
        console.log(`🌐 [WTTJ] Scraping with Bright Data: ${jobUrl}`);
        
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
            
            console.log('🌐 Navigating to WTTJ with Bright Data...');
            
            await page.goto(jobUrl, {
                waitUntil: 'networkidle0',
                timeout: 60000,
            });
            
            console.log('⏳ Waiting for React to render (3 seconds)...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            try {
                await page.waitForSelector('h1', { timeout: 5000 });
            } catch (e) {
                console.warn('⚠️ h1 not found, continuing anyway...');
            }
            
            console.log('🔍 Extracting job data from DOM...');
            
            const jobData = await this.extractJobData(page);
            
            await page.close();
            await browser.disconnect();
            
            console.log(`✅ [WTTJ] Scraped with Bright Data: ${jobData.title} at ${jobData.company}`);
            
            return {
                title: jobData.title,
                company: jobData.company,
                location: jobData.location,
                description: jobData.description,
                requirements: extractRequirements(jobData.description),
                skills: extractSkills(jobData.description),
                experienceLevel: extractExperienceLevelFromText(jobData.description),
                employmentType: extractEmploymentTypeFromText(jobData.description),
                url: jobUrl,
                platform: 'wttj',
            };
            
        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            throw new Error(`WTTJ Bright Data scraping failed: ${error.message}`);
        }
    }

    // Méthode partagée pour extraire les données
    private async extractJobData(page: any) {
        return await page.evaluate(() => {
            const clean = (text: string | null | undefined) => text?.trim() || '';
            
            // TITRE
            const titleSelectors = [
                'h1[class*="JobHeader"]',
                'h2[class*="job-title"]',
                'h1[class*="job-title"]',
                'h1[data-testid="job-title"]',
                'h2[data-testid="job-title"]',
                '[class*="JobHeader"] h1',
                '[class*="JobHeader"] h2',
                'h1',
                'h2',
            ];
            
            let title = 'Poste non spécifié';
            for (const selector of titleSelectors) {
                const el = document.querySelector(selector);
                if (el && clean(el.textContent).length > 3) {
                    title = clean(el.textContent);
                    break;
                }
            }
            
            // ENTREPRISE
            const companySelectors = [
                '[class*="OrganizationCard"] h3',
                '[class*="organization-name"]',
                '[class*="company-name"]',
                'a[href*="/companies/"] strong',
                'a[href*="/companies/"]',
            ];
            
            let company = 'Entreprise non spécifiée';
            for (const selector of companySelectors) {
                const el = document.querySelector(selector);
                if (el && clean(el.textContent).length > 2) {
                    company = clean(el.textContent);
                    break;
                }
            }
            
            // LOCALISATION
            let location = 'Localisation non spécifiée';
            
            const locationSelectors = [
                '[class*="location"]',
                '[class*="office"]',
                '[data-testid*="location"]',
            ];
            
            for (const selector of locationSelectors) {
                const elements = Array.from(document.querySelectorAll(selector));
                for (const el of elements) {
                    const text = clean((el as HTMLElement).textContent);
                    if (text.length > 3 && text.length < 50) {
                        const lower = text.toLowerCase();
                        if (!lower.includes('remote') && 
                            !lower.includes('télétravail') && 
                            !lower.includes('hybrid') &&
                            !lower.includes('job')) {
                            location = text;
                            break;
                        }
                    }
                }
                if (location !== 'Localisation non spécifiée') break;
            }
            
            // Chercher des villes françaises
            if (location === 'Localisation non spécifiée') {
                const cities = ['Lille', 'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 
                               'Nantes', 'Strasbourg', 'Nice', 'Rennes', 'Montpellier', 'Grenoble'];
                
                const bodyText = document.body.textContent || '';
                
                for (const city of cities) {
                    const regex = new RegExp(`${city}\\s*(?:\\([0-9]{2}\\)|,\\s*[A-Z][a-z]+)?`, 'i');
                    const match = bodyText.match(regex);
                    if (match) {
                        location = match[0].trim();
                        location = location.charAt(0).toUpperCase() + location.slice(1);
                        break;
                    }
                }
            }
            
            // DESCRIPTION
            const descSelectors = [
                '[class*="JobDescription"]',
                '[class*="job-description"]',
                '[data-testid="job-description"]',
                '[class*="description"]',
                'article',
                'main [class*="section"]',
            ];
            
            let description = '';
            for (const selector of descSelectors) {
                const el = document.querySelector(selector);
                const text = clean(el?.textContent);
                if (text.length > description.length && text.length > 50) {
                    description = text;
                }
            }
            
            if (description.length < 200) {
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    description = clean(mainContent.textContent);
                }
            }
            
            if (description.length < 100) {
                description = clean(document.body.textContent);
            }
            
            return { title, company, location, description };
        });
    }
}