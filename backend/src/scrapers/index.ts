import { JobScraper } from './types';
import { LinkedInScraper } from './linkedin-scraper';
import { IndeedScraper } from './indeed-scraper';
import { WelcomeToTheJungleScraper } from './wttj-scraper';

const scrapers: JobScraper[] = [
  new LinkedInScraper(),
  new IndeedScraper(),
  new WelcomeToTheJungleScraper(),
];

export function getScraperForUrl(url: string): JobScraper {
  const scraper = scrapers.find(s => s.canHandle(url));
  if (!scraper) {
    throw new Error(`No scraper available for URL: ${url}`);
  }
  return scraper;
}

export * from './types';
export { jobToText } from './utils';