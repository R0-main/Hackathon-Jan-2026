// backend/src/linkedin/job-scraper.ts

// Dynamic import pour éviter les problèmes ESM
let lightpandaModule: any = null;

async function getLightpanda() {
    if (!lightpandaModule) {
        lightpandaModule = await import('@lightpanda/browser');
    }
    return lightpandaModule.lightpanda;
}

export interface LinkedInJob {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    skills: string[];
    experienceLevel: string;
    employmentType: string;
}

/**
 * Scrape une offre d'emploi LinkedIn avec LightPanda
 */
export async function scrapeLinkedInJob(jobUrl: string): Promise<LinkedInJob> {
    console.log(`🔍 Scraping LinkedIn job posting: ${jobUrl}`);
    
    try {
        console.log('🐼 Starting LightPanda...');

        const lightpanda = await getLightpanda();

        // Démarrer le serveur LightPanda
        const proc = await lightpanda.serve({
            host: '127.0.0.1',
            port: 9222,
        });

        // Attendre que le serveur démarre
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('📄 Fetching job page...');

        // Fetch la page avec LightPanda (juste l'URL, pas d'options)
        const html = await lightpanda.fetch(jobUrl);
        
        console.log('✅ Page fetched, parsing HTML...');
        
        // Parser le HTML
        const htmlString = typeof html === 'string' ? html : html.toString();
        const job = parseJobFromHTML(htmlString);
        
        // Arrêter le serveur
        proc.stdout.destroy();
        proc.stderr.destroy();
        proc.kill();
        
        console.log('✅ Job posting scraped successfully!');
        console.log('📊 Found:', {
            title: job.title,
            company: job.company,
            skills: job.skills.length
        });
        
        return job;
        
    } catch (error) {
        console.error('❌ Error scraping with LightPanda:', error);
        throw error;
    }
}

/**
 * Parser le HTML pour extraire les données de l'offre
 */
function parseJobFromHTML(html: string): LinkedInJob {
    // Parser basique avec regex
    const titleMatch = html.match(/<h1[^>]*class="[^"]*top-card[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                       html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Job Title';
    
    const companyMatch = html.match(/<a[^>]*class="[^"]*org-name[^"]*"[^>]*>([^<]+)<\/a>/i);
    const company = companyMatch ? companyMatch[1].trim() : 'Company';
    
    // Extraire la description
    const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]{100,5000}?)<\/div>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').trim() : '';
    
    const requirements = extractRequirements(description || html);
    const skills = extractSkills(description || html);
    
    return {
        title,
        company,
        location: 'Remote / Hybrid',
        description,
        requirements,
        skills,
        experienceLevel: 'Mid-Senior level',
        employmentType: 'Full-time'
    };
}

function extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 20 && trimmed.length < 200) {
            if (trimmed.match(/^[•\-\d.]/)) {
                requirements.push(trimmed.replace(/^[•\-\d.]\s*/, ''));
            }
        }
    }
    
    return requirements.slice(0, 10);
}

function extractSkills(text: string): string[] {
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Vue', 'Angular',
        'Node.js', 'Express', 'Django', 'Flask', 'Spring',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'PostgreSQL', 'MongoDB', 'MySQL', 'Redis',
        'Git', 'CI/CD', 'Jenkins', 'Agile', 'Scrum'
    ];
    
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const skill of commonSkills) {
        if (lowerText.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    }
    
    return [...new Set(foundSkills)];
}

export function jobToText(job: LinkedInJob): string {
    return `
OFFRE D'EMPLOI: ${job.title}
ENTREPRISE: ${job.company}
LOCALISATION: ${job.location}
TYPE: ${job.employmentType}
NIVEAU: ${job.experienceLevel}

COMPÉTENCES REQUISES:
${job.skills.join(', ')}

REQUIREMENTS:
${job.requirements.map(r => `- ${r}`).join('\n')}

DESCRIPTION COMPLÈTE:
${job.description}
    `.trim();
}