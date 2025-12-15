import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug: params.slug },
    });

    if (!tutorial) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.tutorial.update({
      where: { slug: params.slug },
      data: { views: { increment: 1 } },
    });

    // Parse JSON fields
    const parsedTutorial = {
      ...tutorial,
      affiliateLinks: JSON.parse(tutorial.affiliateLinks || '[]'),
      toolsUsed: JSON.parse(tutorial.toolsUsed || '[]'),
      tags: JSON.parse(tutorial.tags || '[]'),
    };

    return NextResponse.json(parsedTutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorial' },
      { status: 500 }
    );
  }
}
