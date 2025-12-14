import { prisma } from './prisma';
import * as cheerio from 'cheerio';

interface ScrapedTool {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  websiteUrl: string;
  loginUrl?: string;
  logoUrl?: string;
  pricing: string;
  features?: string[];
  tags?: string[];
  source: string;
}

interface ScrapeResult {
  totalScraped: number;
  newTools: number;
  duplicates: number;
  errors: string[];
  addedTools: string[];
}

// Progress callback type
type ProgressCallback = (total: number, current: number, status: string) => void;

// Download and save image locally
async function downloadImage(imageUrl: string, toolSlug: string): Promise<string | null> {
  try {
    if (!imageUrl || imageUrl.startsWith('data:')) return null;

    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const ext = imageUrl.split('.').pop()?.split('?')[0] || 'png';
    const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

// Extract tools from Futurepedia
async function scrapeFuturepedia(onProgress?: ProgressCallback): Promise<ScrapedTool[]> {
  const tools: ScrapedTool[] = [];

  try {
    onProgress?.(100, 10, 'Fetching Futurepedia...');

    // Fetch the main page
    const response = await fetch('https://www.futurepedia.io/ai-tools', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Futurepedia: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    onProgress?.(100, 20, 'Parsing Futurepedia tools...');

    // Futurepedia uses a grid layout with tool cards
    // Look for common selectors for tool listings
    const toolCards = $('[class*="tool"], [class*="card"], article, [data-tool], a[href*="/tool/"]').slice(0, 50);

    let processedCount = 0;
    toolCards.each((index, element) => {
      try {
        const $card = $(element);

        // Extract name - look for headings or title elements
        let name = $card.find('h2, h3, h4, [class*="title"], [class*="name"]').first().text().trim();
        if (!name) {
          name = $card.find('a').first().text().trim();
        }

        // Skip if no name found
        if (!name || name.length < 2) return;

        // Extract description
        let description = $card.find('p, [class*="description"], [class*="excerpt"]').first().text().trim();
        if (!description) {
          description = $card.find('div').first().text().trim();
        }
        description = description.substring(0, 200);

        // Extract website URL
        let websiteUrl = $card.find('a[href^="http"]').first().attr('href') || '';
        if (!websiteUrl) {
          const href = $card.attr('href') || $card.find('a').first().attr('href') || '';
          if (href && href.startsWith('http')) {
            websiteUrl = href;
          } else if (href && href.startsWith('/')) {
            websiteUrl = `https://www.futurepedia.io${href}`;
          }
        }

        // Extract logo/image
        let logoUrl = $card.find('img').first().attr('src') || '';
        if (logoUrl && logoUrl.startsWith('/')) {
          logoUrl = `https://www.futurepedia.io${logoUrl}`;
        }

        // Extract category
        let category = $card.find('[class*="category"], [class*="tag"]').first().text().trim();
        if (!category) {
          category = 'Productivity';
        }

        // Extract pricing info
        let pricing = 'FREEMIUM';
        const pricingText = $card.text().toLowerCase();
        if (pricingText.includes('free') && !pricingText.includes('freemium')) {
          pricing = 'FREE';
        } else if (pricingText.includes('paid') || pricingText.includes('subscription')) {
          pricing = 'PAID';
        }

        // Only add if we have minimum required data
        if (name && description && websiteUrl) {
          tools.push({
            name,
            description,
            longDescription: description,
            category,
            websiteUrl,
            logoUrl: logoUrl || undefined,
            pricing,
            features: [],
            tags: [category, 'AI'],
            source: 'Futurepedia'
          });
          processedCount++;
        }
      } catch (error) {
        console.error('Error parsing tool card:', error);
      }
    });

    onProgress?.(100, 50, `Futurepedia: Found ${processedCount} tools`);
    console.log(`Futurepedia scraping found ${processedCount} tools`);

  } catch (error) {
    console.error('Error scraping Futurepedia:', error);
    onProgress?.(100, 50, `Futurepedia error: ${error}`);
  }

  return tools;
}

// Extract tools from Aixploria
async function scrapeAixploria(onProgress?: ProgressCallback): Promise<ScrapedTool[]> {
  const tools: ScrapedTool[] = [];

  try {
    onProgress?.(100, 60, 'Fetching Aixploria...');

    const response = await fetch('https://www.aixploria.com/en/ultimate-list-ai/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Aixploria: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    onProgress?.(100, 70, 'Parsing Aixploria tools...');

    // Aixploria uses list items or cards for AI tools
    const toolElements = $('[class*="tool"], li, article, [class*="item"]').slice(0, 50);

    let processedCount = 0;
    toolElements.each((index, element) => {
      try {
        const $el = $(element);

        // Extract name
        let name = $el.find('h2, h3, h4, strong, b, [class*="title"]').first().text().trim();
        if (!name) {
          name = $el.find('a').first().text().trim();
        }

        // Skip if no valid name
        if (!name || name.length < 2) return;

        // Extract description
        let description = $el.find('p, [class*="description"], span').first().text().trim();
        if (!description) {
          description = $el.text().replace(name, '').trim();
        }
        description = description.substring(0, 200);

        // Extract URL
        let websiteUrl = $el.find('a[href^="http"]').attr('href') || '';
        if (!websiteUrl) {
          const href = $el.find('a').first().attr('href') || '';
          if (href && href.startsWith('http')) {
            websiteUrl = href;
          }
        }

        // Extract image
        let logoUrl = $el.find('img').first().attr('src') || '';
        if (logoUrl && logoUrl.startsWith('/')) {
          logoUrl = `https://www.aixploria.com${logoUrl}`;
        }

        // Extract category
        let category = $el.find('[class*="category"], [class*="tag"]').first().text().trim();
        if (!category) {
          category = 'AI Tools';
        }

        // Pricing
        let pricing = 'FREEMIUM';
        const text = $el.text().toLowerCase();
        if (text.includes('free')) pricing = 'FREE';
        if (text.includes('premium') || text.includes('paid')) pricing = 'PAID';

        // Only add if we have minimum data
        if (name && description && websiteUrl) {
          tools.push({
            name,
            description,
            longDescription: description,
            category,
            websiteUrl,
            logoUrl: logoUrl || undefined,
            pricing,
            features: [],
            tags: [category, 'AI'],
            source: 'Aixploria'
          });
          processedCount++;
        }
      } catch (error) {
        console.error('Error parsing Aixploria tool:', error);
      }
    });

    onProgress?.(100, 90, `Aixploria: Found ${processedCount} tools`);
    console.log(`Aixploria scraping found ${processedCount} tools`);

  } catch (error) {
    console.error('Error scraping Aixploria:', error);
    onProgress?.(100, 90, `Aixploria error: ${error}`);
  }

  return tools;
}

// Main scraper function
export async function scrapeAITools(onProgress?: ProgressCallback): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    totalScraped: 0,
    newTools: 0,
    duplicates: 0,
    errors: [],
    addedTools: [],
  };

  try {
    onProgress?.(100, 0, 'Starting AI tool scraping...');

    // Scrape from both sources
    const [futurepediaTools, aixploriaTools] = await Promise.all([
      scrapeFuturepedia(onProgress),
      scrapeAixploria(onProgress),
    ]);

    const allTools = [...futurepediaTools, ...aixploriaTools];
    result.totalScraped = allTools.length;

    onProgress?.(allTools.length, 0, 'Processing scraped tools...');

    // Process each tool
    for (let i = 0; i < allTools.length; i++) {
      const tool = allTools[i];
      onProgress?.(allTools.length, i + 1, `Processing: ${tool.name}`);

      try {
        // Create slug
        const slug = tool.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check for duplicates
        const existing = await prisma.tool.findFirst({
          where: {
            OR: [
              { slug },
              { websiteUrl: tool.websiteUrl },
              { name: tool.name },
            ],
          },
        });

        if (existing) {
          result.duplicates++;
          continue;
        }

        // Download logo if available
        let logoDataUrl = null;
        if (tool.logoUrl) {
          logoDataUrl = await downloadImage(tool.logoUrl, slug);
        }

        // Create new tool
        await prisma.tool.create({
          data: {
            name: tool.name,
            slug,
            description: tool.description,
            longDescription: tool.longDescription,
            category: tool.category,
            websiteUrl: tool.websiteUrl,
            loginUrl: tool.loginUrl,
            logoUrl: logoDataUrl || tool.logoUrl,
            pricing: tool.pricing,
            features: tool.features ? JSON.stringify(tool.features) : null,
            tags: tool.tags ? JSON.stringify(tool.tags) : null,
            isActive: true,
            isFeatured: false,
            scrapedData: JSON.stringify({
              source: tool.source,
              scrapedAt: new Date().toISOString(),
            }),
          },
        });

        result.newTools++;
        result.addedTools.push(tool.name);
      } catch (error: any) {
        result.errors.push(`${tool.name}: ${error.message}`);
      }
    }

    onProgress?.(100, 100, 'Scraping completed');
    return result;
  } catch (error: any) {
    result.errors.push(`Fatal error: ${error.message}`);
    return result;
  }
}

// Schedule daily scraping at 1:00 AM
export function scheduleAIToolScraping() {
  const scheduleNextRun = () => {
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(1, 0, 0, 0);

    // If 1:00 AM has passed today, schedule for tomorrow
    if (now >= scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilRun = scheduledTime.getTime() - now.getTime();

    setTimeout(async () => {
      console.log('Starting scheduled AI tool scraping at 1:00 AM...');
      const result = await scrapeAITools();
      console.log('Scheduled scraping completed:', result);

      // Schedule next run
      scheduleNextRun();
    }, timeUntilRun);

    console.log(`Next AI tool scraping scheduled for: ${scheduledTime.toLocaleString()}`);
  };

  scheduleNextRun();
}
