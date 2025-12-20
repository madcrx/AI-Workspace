import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          widgets: '[]',
          theme: 'default',
          notes: '',
          todos: '[]',
        },
      });
    }

    return NextResponse.json({
      widgets: JSON.parse(preferences.widgets),
      theme: preferences.theme,
      notes: preferences.notes || '',
      todos: JSON.parse(preferences.todos),
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { widgets, theme, notes, todos } = body;

    const updateData: any = {};
    if (widgets !== undefined) {
      updateData.widgets = JSON.stringify(widgets);
    }
    if (theme !== undefined) {
      updateData.theme = theme;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (todos !== undefined) {
      updateData.todos = JSON.stringify(todos);
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        widgets: widgets ? JSON.stringify(widgets) : '[]',
        theme: theme || 'default',
        notes: notes || '',
        todos: todos ? JSON.stringify(todos) : '[]',
      },
    });

    return NextResponse.json({
      widgets: JSON.parse(preferences.widgets),
      theme: preferences.theme,
      notes: preferences.notes || '',
      todos: JSON.parse(preferences.todos),
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
