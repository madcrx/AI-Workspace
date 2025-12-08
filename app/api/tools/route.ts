import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pricing = searchParams.get('pricing');
    const featured = searchParams.get('featured');

    const where: any = {
      isActive: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (pricing && pricing !== 'all') {
      where.pricing = pricing.toUpperCase();
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const tools = await prisma.tool.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}
