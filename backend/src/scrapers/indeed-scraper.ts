import puppeteer from 'puppeteer-core';
import { lightpanda } from '@lightpanda/browser';
import * as cheerio from 'cheerio';
import { JobPosting, JobScraper } from './types';
import { extractSkills, extractRequirements, extractExperienceLevelFromText, extractEmploymentTypeFromText } from './utils';

export class IndeedScraper implements JobScraper {
    canHandle(url: string): boolean {
        return url.includes('indeed.com') || url.includes('indeed.fr');
    }

    async scrape(jobUrl: string): Promise<JobPosting> {
        // Essayer LightPanda d'abord
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
        
        let browser;
        let page;
        let proc;
        
        try {
            // Option 1: Cloud (si tu as un token)
            if (process.env.LPD_TOKEN) {
                console.log('☁️ Using LightPanda Cloud');
                const puppeteeropts = {
                    browserWSEndpoint: 'wss://euwest.cloud.lightpanda.io/ws?token=' + process.env.LPD_TOKEN,
                };
                browser = await puppeteer.connect(puppeteeropts);
            } 
            // Option 2: Local
            else {
                console.log('🏠 Using LightPanda Local');
                const lpdopts = {
                    host: '127.0.0.1',
                    port: 9222,
                };
                
                // Démarre le serveur LightPanda local
                proc = await lightpanda.serve(lpdopts);
                
                const puppeteeropts = {
                    browserWSEndpoint: 'ws://' + lpdopts.host + ':' + lpdopts.port,
                };
                browser = await puppeteer.connect(puppeteeropts);
            }
            
            const context = await browser.createBrowserContext();
            page = await context.newPage();
            
            console.log('🌐 Navigating to Indeed with LightPanda...');
            await page.goto(jobUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });
            
            // Petit délai pour laisser le JS se charger
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const html = await page.content();
            
            // Cleanup
            await page.close();
            await context.close();
            await browser.disconnect();
            
            // Si local, arrête le processus
            if (proc) {
                proc.stdout.destroy();
                proc.stderr.destroy();
                proc.kill();
            }
            
            // PARSE ET VÉRIFIE - Lance une erreur si page bloquée
            return this.parseIndeedHTML(html, jobUrl);
            
        } catch (error: any) {
            // Cleanup en cas d'erreur
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            if (proc) {
                proc.stdout?.destroy();
                proc.stderr?.destroy();
                proc.kill();
            }
            throw error; // Propage l'erreur pour déclencher le fallback
        }
    }

    private async scrapeWithBrightData(jobUrl: string): Promise<JobPosting> {
        const BRIGHT_DATA_USER = process.env.BRIGHT_DATA_USER;
        const BRIGHT_DATA_PASS = process.env.BRIGHT_DATA_PASS;
        
        if (!BRIGHT_DATA_USER || !BRIGHT_DATA_PASS) {
            throw new Error('Bright Data credentials not configured');
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
            
            // Parse sans vérification stricte pour Bright Data (il contourne les blocages)
            return this.parseIndeedHTMLSafe(html, jobUrl);
            
        } catch (error: any) {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.disconnect().catch(() => {});
            throw new Error(`Indeed Bright Data scraping failed: ${error.message}`);
        }
    }

    //  Lance une erreur si page bloquée (pour LightPanda)
    private parseIndeedHTML(html: string, jobUrl: string): JobPosting {
        const $ = cheerio.load(html);
        
        // Extraire description D'ABORD pour vérifier le blocage
        const description = 
            $('#jobDescriptionText').text().trim() ||
            $('.jobsearch-jobDescriptionText').text().trim() ||
            $('[id*="jobDescription"]').text().trim() ||
            '';
        
        // DÉTECTION DE BLOCAGE - Lance une erreur pour fallback
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
            console.warn('⚠️ Page bloquée détectée, fallback vers Bright Data...');
            throw new Error('Page blocked by anti-bot protection');
        }
        
        // Si pas bloqué, continue le parsing normal
        return this.parseIndeedHTMLSafe(html, jobUrl);
    }

    // VERSION SAFE : Parse sans vérification (pour Bright Data)
    private parseIndeedHTMLSafe(html: string, jobUrl: string): JobPosting {
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
            console.warn('⚠️ Description courte ou vide');
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
