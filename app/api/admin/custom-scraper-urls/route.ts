import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const urls = await prisma.customScraperUrl.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(urls);
  } catch (error) {
    console.error('Error fetching custom URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom URLs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Invalid URLs format' }, { status: 400 });
    }

    // Validate URLs
    const validUrls = urls.filter((url: string) => {
      try {
        new URL(url);
        return url.trim().length > 0;
      } catch {
        return false;
      }
    });

    // Clear existing URLs and add new ones
    await prisma.customScraperUrl.deleteMany({});

    const created = await Promise.all(
      validUrls.map((url: string) =>
        prisma.customScraperUrl.create({
          data: { url: url.trim() },
        })
      )
    );

    return NextResponse.json({
      success: true,
      saved: created.length,
      urls: created,
    });
  } catch (error) {
    console.error('Error saving custom URLs:', error);
    return NextResponse.json(
      { error: 'Failed to save custom URLs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'URL ID required' }, { status: 400 });
    }

    await prisma.customScraperUrl.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom URL:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom URL' },
      { status: 500 }
    );
  }
}
