// src/scrapers/types.ts
export interface JobPosting {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    skills: string[];
    experienceLevel: string;
    employmentType: string;
    salary?: string;
    url: string;
    platform: 'linkedin' | 'indeed' | 'wttj' | 'other';
}

export interface JobScraper {
    canHandle(url: string): boolean;
    scrape(url: string): Promise<JobPosting>;
}