import { prisma } from './prisma';

interface ScraperResult {
  success: boolean;
  updated: number;
  removed: number;
  errors: string[];
}

export async function scrapeToolUpdates(): Promise<ScraperResult> {
  const result: ScraperResult = {
    success: true,
    updated: 0,
    removed: 0,
    errors: [],
  };

  try {
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
    });

    for (const tool of tools) {
      try {
        // Check if website is still accessible
        const response = await fetch(tool.websiteUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          // Mark tool as inactive if website is down
          await prisma.tool.update({
            where: { id: tool.id },
            data: {
              isActive: false,
              lastScraped: new Date(),
              scrapedData: JSON.stringify({
                status: response.status,
                note: 'Website not accessible',
              }),
            },
          });
          result.removed++;
        } else {
          // Update last scraped timestamp
          await prisma.tool.update({
            where: { id: tool.id },
            data: {
              lastScraped: new Date(),
              scrapedData: JSON.stringify({
                status: response.status,
                lastCheck: new Date().toISOString(),
              }),
            },
          });
          result.updated++;
        }
      } catch (error: any) {
        result.errors.push(`${tool.name}: ${error.message}`);

        // Mark as potentially unavailable after timeout
        await prisma.tool.update({
          where: { id: tool.id },
          data: {
            lastScraped: new Date(),
            scrapedData: JSON.stringify({
              error: error.message,
              note: 'Failed to access website',
            }),
          },
        });
      }
    }

    return result;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Fatal error: ${error.message}`);
    return result;
  }
}

export async function scheduleAutomaticScraping() {
  // Run scraper every 24 hours
  const INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  setInterval(async () => {
    console.log('Starting scheduled tool scraping...');
    const result = await scrapeToolUpdates();
    console.log('Scraping completed:', result);
  }, INTERVAL);

  // Run immediately on startup
  console.log('Running initial tool scraping...');
  const result = await scrapeToolUpdates();
  console.log('Initial scraping completed:', result);
}
