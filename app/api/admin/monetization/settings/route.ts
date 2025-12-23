import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET monetization settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.monetizationSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.monetizationSettings.create({
        data: {
          monthlyRevenueGoal: 0,
          minimumPayoutAmount: 50,
          sendWeeklyReports: true,
          sendMonthlyReports: true,
          alertOnLargeConversion: true,
          largeConversionThreshold: 100,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching monetization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT update monetization settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get the current settings or create new ones
    let currentSettings = await prisma.monetizationSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!currentSettings) {
      currentSettings = await prisma.monetizationSettings.create({
        data: {},
      });
    }

    // Update settings
    const updatedSettings = await prisma.monetizationSettings.update({
      where: { id: currentSettings.id },
      data: body,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating monetization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
