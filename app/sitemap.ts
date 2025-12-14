import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aiworkspace.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit-tool`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/request-feature`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  try {
    // Get all active tools
    const tools = await prisma.tool.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
      },
    });

    const toolPages = tools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/tools/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...toolPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
