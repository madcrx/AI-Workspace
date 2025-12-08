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

    const body = await req.json();
    const { toolId, position, gridX, gridY, width, height } = body;

    const existingTool = await prisma.workspaceTool.findFirst({
      where: {
        workspaceId: params.id,
        toolId,
      },
    });

    if (existingTool) {
      return NextResponse.json(
        { error: 'Tool already in workspace' },
        { status: 400 }
      );
    }

    const workspaceTool = await prisma.workspaceTool.create({
      data: {
        workspaceId: params.id,
        toolId,
        position: position || 0,
        gridX: gridX || 0,
        gridY: gridY || 0,
        width: width || 1,
        height: height || 1,
      },
      include: {
        tool: true,
      },
    });

    return NextResponse.json(workspaceTool);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add tool to workspace' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tools } = body;

    await Promise.all(
      tools.map((tool: any) =>
        prisma.workspaceTool.update({
          where: { id: tool.id },
          data: {
            position: tool.position,
            gridX: tool.gridX,
            gridY: tool.gridY,
            width: tool.width,
            height: tool.height,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update tools' },
      { status: 500 }
    );
  }
}
