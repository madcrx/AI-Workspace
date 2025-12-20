import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    const where: any = { isPublished: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    const tutorials = await prisma.tutorial.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        difficulty: true,
        youtubeVideoId: true,
        duration: true,
        views: true,
        likes: true,
        isFeatured: true,
        thumbnailUrl: true,
        tags: true,
        createdAt: true,
      },
    });

    // Parse JSON fields
    const parsedTutorials = tutorials.map((tutorial: any) => ({
      ...tutorial,
      tags: JSON.parse(tutorial.tags || '[]'),
    }));

    return NextResponse.json(parsedTutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}
