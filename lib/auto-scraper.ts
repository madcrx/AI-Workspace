import * as cheerio from 'cheerio';
import { prisma } from './prisma';

interface ScrapedTool {
  name: string;
  websiteUrl: string;
  description: string;
  category: string;
  pricing: string;
  logoUrl?: string;
  features?: string[];
  tags?: string[];
}

interface ScraperResult {
  source: string;
  toolsFound: number;
  toolsAdded: number;
  toolsUpdated: number;
  toolsSkipped: number;
  errors: string[];
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  executionTime: number;
}

/**
 * Enhanced Auto-Scraper for AI Tools
 * Scrapes multiple sources to automatically discover and add new AI tools
 */
export class AutoScraper {
  private errors: string[] = [];
  private startTime: number = 0;

  /**
   * Main entry point - scrapes all sources
   */
  async scrapeAll(triggeredBy: 'CRON' | 'MANUAL' = 'MANUAL'): Promise<ScraperResult[]> {
    console.log('🤖 Starting Auto-Scraper...');
    const results: ScraperResult[] = [];

    // Scrape from multiple sources
    const scrapers = [
      { name: 'Product Hunt AI', scraper: () => this.scrapeProductHunt() },
      { name: 'GitHub Trending AI', scraper: () => this.scrapeGitHubTrending() },
      { name: 'Generic AI Directory', scraper: () => this.scrapeGenericDirectory() },
    ];

    for (const { name, scraper } of scrapers) {
      try {
        console.log(`📡 Scraping ${name}...`);
        const result = await scraper();
        results.push(result);

        // Log to database
        await prisma.scraperLog.create({
          data: {
            source: name,
            toolsFound: result.toolsFound,
            toolsAdded: result.toolsAdded,
            toolsUpdated: result.toolsUpdated,
            toolsSkipped: result.toolsSkipped,
            errors: JSON.stringify(result.errors),
            status: result.status,
            executionTime: result.executionTime,
            triggeredBy,
          },
        });
      } catch (error) {
        console.error(`❌ Error scraping ${name}:`, error);
        const errorResult: ScraperResult = {
          source: name,
          toolsFound: 0,
          toolsAdded: 0,
          toolsUpdated: 0,
          toolsSkipped: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          status: 'FAILED',
          executionTime: 0,
        };
        results.push(errorResult);

        await prisma.scraperLog.create({
          data: {
            source: name,
            toolsFound: 0,
            toolsAdded: 0,
            toolsUpdated: 0,
            toolsSkipped: 0,
            errors: JSON.stringify(errorResult.errors),
            status: 'FAILED',
            executionTime: 0,
            triggeredBy,
          },
        });
      }
    }

    console.log('✅ Auto-Scraper completed!');
    return results;
  }

  /**
   * Scrape AI tools from Product Hunt
   */
  private async scrapeProductHunt(): Promise<ScraperResult> {
    this.startTime = Date.now();
    this.errors = [];

    const tools: ScrapedTool[] = [];

    try {
      // Simulated Product Hunt scraping
      // In production, you'd use Product Hunt API or web scraping
      const simulatedTools: ScrapedTool[] = [
        {
          name: 'AI Code Assistant Pro',
          websiteUrl: 'https://example.com/ai-code-assistant',
          description: 'Advanced AI-powered code completion and debugging tool',
          category: 'Code Assistant',
          pricing: 'FREEMIUM',
          features: ['Code completion', 'Bug detection', 'Code refactoring'],
          tags: ['coding', 'ai', 'productivity'],
        },
        {
          name: 'ContentGen AI',
          websiteUrl: 'https://example.com/contentgen',
          description: 'Generate high-quality content for blogs, social media, and more',
          category: 'Content Generation',
          pricing: 'PAID',
          features: ['Blog writing', 'Social media posts', 'SEO optimization'],
          tags: ['content', 'writing', 'marketing'],
        },
      ];

      tools.push(...simulatedTools);
    } catch (error) {
      this.errors.push(`Product Hunt scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return await this.processScrapedTools(tools, 'Product Hunt AI');
  }

  /**
   * Scrape AI tools from GitHub Trending
   */
  private async scrapeGitHubTrending(): Promise<ScraperResult> {
    this.startTime = Date.now();
    this.errors = [];

    const tools: ScrapedTool[] = [];

    try {
      // Fetch GitHub Trending AI repositories
      const response = await fetch('https://api.github.com/search/repositories?q=ai+tools+machine+learning&sort=stars&order=desc&per_page=20', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Workspace-Scraper',
        },
      });

      if (response.ok) {
        const data = await response.json();

        for (const repo of data.items || []) {
          // Only include repos that look like AI tools (not libraries)
          if (repo.description && (
            repo.description.toLowerCase().includes('tool') ||
            repo.description.toLowerCase().includes('app') ||
            repo.description.toLowerCase().includes('platform')
          )) {
            tools.push({
              name: repo.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              websiteUrl: repo.homepage || repo.html_url,
              description: repo.description || 'AI tool from GitHub',
              category: this.categorizeFromDescription(repo.description || ''),
              pricing: 'FREE', // GitHub projects are typically free
              tags: repo.topics || [],
            });
          }
        }
      }
    } catch (error) {
      this.errors.push(`GitHub scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return await this.processScrapedTools(tools, 'GitHub Trending AI');
  }

  /**
   * Scrape from a generic AI tools directory
   */
  private async scrapeGenericDirectory(): Promise<ScraperResult> {
    this.startTime = Date.now();
    this.errors = [];

    const tools: ScrapedTool[] = [];

    try {
      // Simulated directory scraping
      // In production, you'd scrape actual directories like there.ai, futuretools.io, etc.
      const simulatedTools: ScrapedTool[] = [
        {
          name: 'ImageGen Studio',
          websiteUrl: 'https://example.com/imagegen',
          description: 'Professional AI image generation with advanced controls',
          category: 'Image Generation',
          pricing: 'SUBSCRIPTION',
          features: ['Text-to-image', 'Image-to-image', '4K resolution'],
          tags: ['image', 'art', 'design'],
        },
        {
          name: 'DataBot Analytics',
          websiteUrl: 'https://example.com/databot',
          description: 'AI-powered data analysis and visualization platform',
          category: 'Data Analysis',
          pricing: 'FREEMIUM',
          features: ['Auto analysis', 'Smart charts', 'Predictive insights'],
          tags: ['data', 'analytics', 'business'],
        },
      ];

      tools.push(...simulatedTools);
    } catch (error) {
      this.errors.push(`Directory scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return await this.processScrapedTools(tools, 'Generic AI Directory');
  }

  /**
   * Process scraped tools and add to database
   */
  private async processScrapedTools(tools: ScrapedTool[], source: string): Promise<ScraperResult> {
    let toolsAdded = 0;
    let toolsUpdated = 0;
    let toolsSkipped = 0;

    for (const tool of tools) {
      try {
        const slug = this.generateSlug(tool.name);

        // Check if tool already exists
        const existingTool = await prisma.tool.findUnique({
          where: { slug },
        });

        if (existingTool) {
          // Update existing tool
          await prisma.tool.update({
            where: { slug },
            data: {
              description: tool.description,
              category: tool.category,
              pricing: tool.pricing,
              features: JSON.stringify(tool.features || []),
              tags: JSON.stringify(tool.tags || []),
              logoUrl: tool.logoUrl,
              lastScraped: new Date(),
              scrapedData: JSON.stringify({ source, scrapedAt: new Date() }),
            },
          });
          toolsUpdated++;
          console.log(`✏️  Updated: ${tool.name}`);
        } else {
          // Add new tool (auto-activate for scraped tools)
          await prisma.tool.create({
            data: {
              name: tool.name,
              slug,
              description: tool.description,
              longDescription: tool.description,
              category: tool.category,
              websiteUrl: tool.websiteUrl,
              pricing: tool.pricing,
              features: JSON.stringify(tool.features || []),
              tags: JSON.stringify(tool.tags || []),
              logoUrl: tool.logoUrl,
              isActive: true, // Auto-activate scraped tools
              isFeatured: false,
              lastScraped: new Date(),
              scrapedData: JSON.stringify({ source, scrapedAt: new Date() }),
            },
          });
          toolsAdded++;
          console.log(`✨ Added: ${tool.name}`);
        }
      } catch (error) {
        toolsSkipped++;
        this.errors.push(`Failed to process ${tool.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const executionTime = Date.now() - this.startTime;
    const status = this.errors.length === 0 ? 'SUCCESS' : this.errors.length < tools.length ? 'PARTIAL' : 'FAILED';

    return {
      source,
      toolsFound: tools.length,
      toolsAdded,
      toolsUpdated,
      toolsSkipped,
      errors: this.errors,
      status,
      executionTime,
    };
  }

  /**
   * Generate URL-friendly slug from tool name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Categorize tool based on description keywords
   */
  private categorizeFromDescription(description: string): string {
    const desc = description.toLowerCase();

    if (desc.includes('image') || desc.includes('art') || desc.includes('design')) return 'Image Generation';
    if (desc.includes('code') || desc.includes('programming') || desc.includes('developer')) return 'Code Assistant';
    if (desc.includes('write') || desc.includes('content') || desc.includes('text')) return 'Content Generation';
    if (desc.includes('video') || desc.includes('media')) return 'Video';
    if (desc.includes('data') || desc.includes('analytics')) return 'Data Analysis';
    if (desc.includes('chat') || desc.includes('conversation')) return 'Chatbot';
    if (desc.includes('audio') || desc.includes('music') || desc.includes('voice')) return 'Audio';
    if (desc.includes('research') || desc.includes('science')) return 'Research';

    return 'AI Assistant';
  }
}
