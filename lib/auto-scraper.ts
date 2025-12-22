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
   * Scrape a custom URL provided by the user
   */
  async scrapeCustomUrl(url: string): Promise<ScraperResult> {
    this.startTime = Date.now();
    this.errors = [];

    const tools: ScrapedTool[] = [];

    try {
      console.log(`🔍 Scraping custom URL: ${url}`);

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Detect if site is likely JavaScript-heavy
      const bodyText = $('body').text().trim();
      const scriptTags = $('script').length;
      const hasReactRoot = $('#root, #__next, [data-reactroot]').length > 0;
      const hasVueApp = $('[data-v-]').length > 0 || $('#app').length > 0;

      if (bodyText.length < 500 && scriptTags > 10 && (hasReactRoot || hasVueApp)) {
        console.warn(`⚠️ Site appears to use heavy client-side JavaScript (React/Vue/Next.js)`);
        this.errors.push(
          'This site appears to load content dynamically with JavaScript. The scraper can only access static HTML content. ' +
          'Some or all tools may not be visible. Consider using tools from this site sparingly or manually.'
        );
      }

      // Try site-specific scraping strategies first
      const siteSpecificTools = await this.trySiteSpecificScraping(url, $);
      if (siteSpecificTools.length > 0) {
        console.log(`✨ Used site-specific scraping strategy, found ${siteSpecificTools.length} tools`);
        tools.push(...siteSpecificTools);

        // Remove duplicates
        const uniqueTools = tools.filter((tool, index, self) =>
          index === self.findIndex((t) => t.name.toLowerCase() === tool.name.toLowerCase())
        );

        return await this.processScrapedTools(uniqueTools, `Custom URL: ${url}`);
      }

      // PRIORITY STRATEGY: Look for numbered lists and directories first

      // Strategy 1: Look for ordered lists (ol > li)
      const orderedLists = $('ol li').slice(0, 50);
      if (orderedLists.length > 0) {
        console.log(`📋 Found ${orderedLists.length} items in ordered lists`);
        orderedLists.each((i, elem) => {
          try {
            const $elem = $(elem);
            const extracted = this.extractToolFromElement($elem, url);
            if (extracted) tools.push(extracted);
          } catch (error) {
            // Skip individual tool extraction errors
          }
        });
      }

      // Strategy 2: Look for numbered directory items (text starting with numbers like "1.", "2.", etc.)
      if (tools.length < 5) {
        const numberedItems = $('li, div, article').filter((i, elem) => {
          const text = $(elem).text().trim();
          // Match patterns like "1.", "2)", "1 -", "01.", etc.
          return /^\s*\d+[\.\)\-\s]/.test(text);
        }).slice(0, 50);

        if (numberedItems.length > 0) {
          console.log(`🔢 Found ${numberedItems.length} numbered items`);
          numberedItems.each((i, elem) => {
            try {
              const $elem = $(elem);
              const extracted = this.extractToolFromElement($elem, url);
              if (extracted) tools.push(extracted);
            } catch (error) {
              // Skip individual tool extraction errors
            }
          });
        }
      }

      // Strategy 3: Look for directory-style listings (list items within unordered lists)
      if (tools.length < 5) {
        const directoryLists = $('ul li').filter((i, elem) => {
          const $elem = $(elem);
          // Directory items usually have links and descriptions
          const hasLink = $elem.find('a[href]').length > 0;
          const hasText = $elem.text().trim().length > 20;
          return hasLink && hasText;
        }).slice(0, 50);

        if (directoryLists.length > 0) {
          console.log(`📁 Found ${directoryLists.length} directory-style items`);
          directoryLists.each((i, elem) => {
            try {
              const $elem = $(elem);
              const extracted = this.extractToolFromElement($elem, url);
              if (extracted) tools.push(extracted);
            } catch (error) {
              // Skip individual tool extraction errors
            }
          });
        }
      }

      // Strategy 4: Look for table rows (many directories use tables)
      if (tools.length < 5) {
        const tableRows = $('table tr').filter((i, elem) => {
          const $elem = $(elem);
          // Skip header rows
          if ($elem.find('th').length > 0) return false;
          // Must have at least 2 cells and a link
          return $elem.find('td').length >= 2 && $elem.find('a[href]').length > 0;
        }).slice(0, 50);

        if (tableRows.length > 0) {
          console.log(`📊 Found ${tableRows.length} table rows`);
          tableRows.each((i, elem) => {
            try {
              const $elem = $(elem);
              const extracted = this.extractToolFromTableRow($elem, url);
              if (extracted) tools.push(extracted);
            } catch (error) {
              // Skip individual tool extraction errors
            }
          });
        }
      }

      // Strategy 5: Only as last resort, look for generic tool cards
      if (tools.length < 3) {
        const toolElements = $('[class*="tool-card"], [class*="app-card"], [class*="product-item"]').slice(0, 20);

        if (toolElements.length > 0) {
          console.log(`🃏 Found ${toolElements.length} generic card items`);
          toolElements.each((i, elem) => {
            try {
              const $elem = $(elem);
              const extracted = this.extractToolFromElement($elem, url);
              if (extracted) tools.push(extracted);
            } catch (error) {
              // Skip individual tool extraction errors
            }
          });
        }
      }

      // Remove duplicates based on name
      const uniqueTools = tools.filter((tool, index, self) =>
        index === self.findIndex((t) => t.name.toLowerCase() === tool.name.toLowerCase())
      );

      console.log(`✅ Extracted ${uniqueTools.length} unique tools from ${url}`);

      if (uniqueTools.length === 0) {
        // Provide more helpful error messages
        if (bodyText.length < 500) {
          this.errors.push(
            'Page has minimal content. This site likely uses JavaScript to load content dynamically, ' +
            'which cannot be scraped with basic HTTP requests. Try a different URL or source.'
          );
        } else if ($('div, article, section').length < 10) {
          this.errors.push(
            'Page structure is very simple. This might not be a tool directory page, or it uses ' +
            'an unusual HTML structure that our scraper cannot parse.'
          );
        } else {
          this.errors.push(
            'No tools found in numbered lists or directory format. The page might not be a tool directory, ' +
            'or it uses a custom HTML structure. Try a different page URL (like a category page or full list page).'
          );
        }
      }

      return await this.processScrapedTools(uniqueTools, `Custom URL: ${url}`);
    } catch (error) {
      this.errors.push(`Custom URL scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return await this.processScrapedTools(tools, `Custom URL: ${url}`);
    }
  }

  /**
   * Extract tool information from a generic element (list item, div, etc.)
   */
  private extractToolFromElement($elem: cheerio.Cheerio<any>, baseUrl: string): ScrapedTool | null {
    // Extract name
    const name =
      $elem.find('h1, h2, h3, h4, [class*="title"], [class*="name"], strong, b').first().text().trim() ||
      $elem.find('a').first().text().trim();

    if (!name || name.length < 3 || name.length > 150) return null;

    // Extract description - try multiple selectors
    const description =
      $elem.find('p, [class*="description"], [class*="desc"], [class*="summary"], [class*="tagline"], span').first().text().trim() ||
      $elem.find('div').first().text().trim() ||
      $elem.clone().children('h1, h2, h3, h4, h5, h6, strong, b, a').remove().end().text().trim();

    // Be more lenient with description length for better coverage
    if (!description || description.length < 15) return null;

    // Extract URL
    let websiteUrl = $elem.find('a[href]').first().attr('href') || '';
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      try {
        const base = new URL(baseUrl);
        websiteUrl = new URL(websiteUrl, base.origin).href;
      } catch {
        websiteUrl = baseUrl;
      }
    }

    // Extract logo/image
    const logoUrl = $elem.find('img').first().attr('src') || undefined;

    return {
      name: name.substring(0, 100).replace(/^\d+[\.\)\-\s]+/, '').trim(), // Remove number prefix
      websiteUrl: websiteUrl || baseUrl,
      description: description.substring(0, 500),
      category: this.categorizeFromDescription(description),
      pricing: this.detectPricing($elem.text()),
      logoUrl,
    };
  }

  /**
   * Extract tool information from a table row
   */
  private extractToolFromTableRow($row: cheerio.Cheerio<any>, baseUrl: string): ScrapedTool | null {
    const cells = $row.find('td');
    if (cells.length < 2) return null;

    // First cell usually contains name/link
    const $firstCell = cells.eq(0);
    const name = $firstCell.find('a').text().trim() || $firstCell.text().trim();

    if (!name || name.length < 3) return null;

    // Second cell usually contains description
    const description = cells.eq(1).text().trim();

    if (!description || description.length < 20) return null;

    // Extract URL
    let websiteUrl = $firstCell.find('a[href]').first().attr('href') || $row.find('a[href]').first().attr('href') || '';
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      try {
        const base = new URL(baseUrl);
        websiteUrl = new URL(websiteUrl, base.origin).href;
      } catch {
        websiteUrl = baseUrl;
      }
    }

    return {
      name: name.substring(0, 100),
      websiteUrl: websiteUrl || baseUrl,
      description: description.substring(0, 500),
      category: this.categorizeFromDescription(description),
      pricing: this.detectPricing($row.text()),
    };
  }

  /**
   * Try site-specific scraping strategies for known AI tool directories
   */
  private async trySiteSpecificScraping(url: string, $: cheerio.CheerioAPI): Promise<ScrapedTool[]> {
    const tools: ScrapedTool[] = [];
    const hostname = new URL(url).hostname.toLowerCase();

    try {
      // TheresAnAIForThat.com - Look for tool cards
      if (hostname.includes('theresanaiforthat')) {
        console.log('🎯 Using TheresAnAIForThat.com specific strategy');
        const toolCards = $('[class*="tool"], [class*="item"], article, .grid > div').slice(0, 100);
        toolCards.each((i, elem) => {
          const $elem = $(elem);
          const name = $elem.find('h2, h3, h4, [class*="title"], [class*="name"]').first().text().trim();
          const description = $elem.find('p, [class*="description"]').first().text().trim();
          const link = $elem.find('a[href]').first().attr('href');

          if (name && name.length > 2 && description && description.length > 20) {
            tools.push({
              name: name.substring(0, 100),
              description: description.substring(0, 500),
              websiteUrl: link && link.startsWith('http') ? link : url,
              category: this.categorizeFromDescription(description),
              pricing: this.detectPricing($elem.text()),
              logoUrl: $elem.find('img').first().attr('src'),
            });
          }
        });
      }

      // FutureTools.io - Grid/card based layout
      if (hostname.includes('futuretools')) {
        console.log('🎯 Using FutureTools.io specific strategy');
        const toolCards = $('[class*="tool"], [class*="card"], .grid > div, [class*="item"]').slice(0, 100);
        toolCards.each((i, elem) => {
          const $elem = $(elem);
          const extracted = this.extractToolFromElement($elem, url);
          if (extracted) tools.push(extracted);
        });
      }

      // Futurepedia.io - Directory listing
      if (hostname.includes('futurepedia')) {
        console.log('🎯 Using Futurepedia.io specific strategy');
        const toolItems = $('[class*="tool"], [class*="directory"], article, [class*="list-item"]').slice(0, 100);
        toolItems.each((i, elem) => {
          const $elem = $(elem);
          const extracted = this.extractToolFromElement($elem, url);
          if (extracted) tools.push(extracted);
        });
      }

      // ProductHunt - Product listings
      if (hostname.includes('producthunt')) {
        console.log('🎯 Using ProductHunt.com specific strategy');
        const products = $('[class*="product"], [class*="item"], article').slice(0, 100);
        products.each((i, elem) => {
          const $elem = $(elem);
          const name = $elem.find('h2, h3, [class*="name"], [class*="title"]').first().text().trim();
          const description = $elem.find('p, [class*="tagline"], [class*="description"]').first().text().trim();

          if (name && description && description.length > 15) {
            tools.push({
              name: name.substring(0, 100),
              description: description.substring(0, 500),
              websiteUrl: url,
              category: this.categorizeFromDescription(description),
              pricing: 'FREEMIUM',
              logoUrl: $elem.find('img').first().attr('src'),
            });
          }
        });
      }

      // AIxploria.com - List/directory format
      if (hostname.includes('aixploria')) {
        console.log('🎯 Using AIxploria.com specific strategy');
        const aiTools = $('article, [class*="tool"], [class*="ai"], li > a').slice(0, 100);
        aiTools.each((i, elem) => {
          const $elem = $(elem);
          const extracted = this.extractToolFromElement($elem, url);
          if (extracted) tools.push(extracted);
        });
      }

      // ToolBit.ai & RankMyAI.com - Ranking/list format
      if (hostname.includes('toolbit') || hostname.includes('rankmyai')) {
        console.log('🎯 Using ranking site specific strategy');
        // Try table rows first (common in ranking sites)
        const tableRows = $('table tr').slice(1, 101); // Skip header
        if (tableRows.length > 5) {
          tableRows.each((i, elem) => {
            const $row = $(elem);
            const extracted = this.extractToolFromTableRow($row, url);
            if (extracted) tools.push(extracted);
          });
        }

        // Also try list items with rankings
        if (tools.length < 5) {
          const rankedItems = $('li, [class*="rank"], [class*="item"]').slice(0, 100);
          rankedItems.each((i, elem) => {
            const $elem = $(elem);
            const extracted = this.extractToolFromElement($elem, url);
            if (extracted) tools.push(extracted);
          });
        }
      }

      console.log(`✅ Site-specific strategy found ${tools.length} tools for ${hostname}`);
    } catch (error) {
      console.error(`Error in site-specific scraping for ${hostname}:`, error);
    }

    return tools;
  }

  /**
   * Detect pricing from text content
   */
  private detectPricing(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('free') && (lowerText.includes('premium') || lowerText.includes('paid'))) {
      return 'FREEMIUM';
    }
    if (lowerText.includes('subscription') || lowerText.includes('monthly') || lowerText.includes('yearly')) {
      return 'SUBSCRIPTION';
    }
    if (lowerText.includes('free') || lowerText.includes('open source')) {
      return 'FREE';
    }
    if (lowerText.includes('pay') || lowerText.includes('buy') || lowerText.includes('purchase')) {
      return 'PAID';
    }

    return 'FREEMIUM'; // Default
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
