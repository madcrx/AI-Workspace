import { prisma } from './prisma';

interface ImageFetchResult {
  success: boolean;
  toolId: string;
  toolName: string;
  logoUrl?: string;
  error?: string;
}

/**
 * Fetches the logo/favicon from a tool's website
 */
export async function fetchToolLogo(websiteUrl: string): Promise<string | null> {
  try {
    // Try to fetch favicon or logo from the website
    const url = new URL(websiteUrl);
    const baseUrl = `${url.protocol}//${url.hostname}`;

    // Common logo paths to try
    const logoPaths = [
      '/favicon.ico',
      '/favicon.png',
      '/logo.png',
      '/logo.svg',
      '/assets/logo.png',
      '/images/logo.png',
    ];

    // Try Google's favicon service first (most reliable)
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;

    try {
      const response = await fetch(googleFaviconUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        return googleFaviconUrl;
      }
    } catch (error) {
      // Continue to next method
    }

    // Try DuckDuckGo's favicon service
    const duckduckgoFaviconUrl = `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;

    try {
      const response = await fetch(duckduckgoFaviconUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        return duckduckgoFaviconUrl;
      }
    } catch (error) {
      // Continue to next method
    }

    // Try common logo paths on the website
    for (const path of logoPaths) {
      try {
        const logoUrl = `${baseUrl}${path}`;
        const response = await fetch(logoUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          return logoUrl;
        }
      } catch (error) {
        // Continue to next path
      }
    }

    // Fallback to Google favicon service without checking
    return googleFaviconUrl;
  } catch (error) {
    console.error('Error fetching logo:', error);
    return null;
  }
}

/**
 * Fetches and updates logos for all tools in the database
 */
export async function updateToolLogos(): Promise<ImageFetchResult[]> {
  const results: ImageFetchResult[] = [];

  try {
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
    });

    for (const tool of tools) {
      try {
        // Skip if tool already has a logo
        if (tool.logoUrl && tool.logoUrl !== '') {
          results.push({
            success: true,
            toolId: tool.id,
            toolName: tool.name,
            logoUrl: tool.logoUrl,
          });
          continue;
        }

        const logoUrl = await fetchToolLogo(tool.websiteUrl);

        if (logoUrl) {
          await prisma.tool.update({
            where: { id: tool.id },
            data: { logoUrl },
          });

          results.push({
            success: true,
            toolId: tool.id,
            toolName: tool.name,
            logoUrl,
          });
        } else {
          results.push({
            success: false,
            toolId: tool.id,
            toolName: tool.name,
            error: 'Could not fetch logo',
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        results.push({
          success: false,
          toolId: tool.id,
          toolName: tool.name,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error: any) {
    console.error('Fatal error in updateToolLogos:', error);
    return results;
  }
}

/**
 * Fetches logo for a single tool by ID
 */
export async function updateSingleToolLogo(toolId: string): Promise<ImageFetchResult> {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return {
        success: false,
        toolId,
        toolName: 'Unknown',
        error: 'Tool not found',
      };
    }

    const logoUrl = await fetchToolLogo(tool.websiteUrl);

    if (logoUrl) {
      await prisma.tool.update({
        where: { id: toolId },
        data: { logoUrl },
      });

      return {
        success: true,
        toolId: tool.id,
        toolName: tool.name,
        logoUrl,
      };
    } else {
      return {
        success: false,
        toolId: tool.id,
        toolName: tool.name,
        error: 'Could not fetch logo',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      toolId,
      toolName: 'Unknown',
      error: error.message,
    };
  }
}
