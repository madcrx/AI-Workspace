import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: { userId: session.user.id },
      include: {
        tools: {
          include: {
            tool: true,
          },
        },
      },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, layout, theme } = body;

    const workspace = await prisma.workspace.create({
      data: {
        userId: session.user.id,
        name: name || 'New Workspace',
        layout: layout || 'grid',
        theme: theme || 'light',
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
