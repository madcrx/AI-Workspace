import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get featured tools
    const featuredTools = await prisma.tool.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        websiteUrl: true,
        logoUrl: true,
        pricing: true,
        rating: true,
      },
      orderBy: {
        rating: 'desc',
      },
      take: 15,
    });

    // If we have fewer than 15 featured tools, fill with top-rated tools
    if (featuredTools.length < 15) {
      const topRatedTools = await prisma.tool.findMany({
        where: {
          isActive: true,
          isFeatured: false,
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          websiteUrl: true,
          logoUrl: true,
          pricing: true,
          rating: true,
        },
        orderBy: {
          rating: 'desc',
        },
        take: 15 - featuredTools.length,
      });

      return NextResponse.json([...featuredTools, ...topRatedTools]);
    }

    return NextResponse.json(featuredTools);
  } catch (error) {
    console.error('Error fetching featured tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured tools' },
      { status: 500 }
    );
  }
}
