import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        userId_toolId: {
          userId: session.user.id,
          toolId: params.id,
        },
      },
      update: {
        rating,
      },
      create: {
        userId: session.user.id,
        toolId: params.id,
        rating,
      },
    });

    // Recalculate average rating
    const allReviews = await prisma.review.findMany({
      where: { toolId: params.id },
    });

    const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;

    await prisma.tool.update({
      where: { id: params.id },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error rating tool:', error);
    return NextResponse.json(
      { error: 'Failed to rate tool' },
      { status: 500 }
    );
  }
}
