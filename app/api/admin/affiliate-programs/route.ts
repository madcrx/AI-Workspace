import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all affiliate programs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programs = await prisma.affiliateProgram.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            affiliateClicks: true,
          },
        },
      },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching affiliate programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST create a new affiliate program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      provider,
      affiliateNetwork,
      commissionType,
      commissionRate,
      cookieDuration,
      affiliateId,
      apiKey,
      trackingUrl,
      minimumPayout,
      paymentSchedule,
      notes,
    } = body;

    if (!name || !provider || !trackingUrl) {
      return NextResponse.json(
        { error: 'Name, provider, and tracking URL are required' },
        { status: 400 }
      );
    }

    const program = await prisma.affiliateProgram.create({
      data: {
        name,
        provider,
        affiliateNetwork,
        commissionType: commissionType || 'PER_SALE',
        commissionRate: parseFloat(commissionRate) || 0,
        cookieDuration: cookieDuration ? parseInt(cookieDuration) : null,
        affiliateId,
        apiKey,
        trackingUrl,
        minimumPayout: minimumPayout ? parseFloat(minimumPayout) : null,
        paymentSchedule,
        notes,
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliate program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}
