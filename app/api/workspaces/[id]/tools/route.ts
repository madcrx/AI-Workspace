import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST add a tool to a workspace
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const body = await request.json();
    const { toolId } = body;

    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: session.user.id,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Verify tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Check if tool is already in workspace
    const existingWorkspaceTool = await prisma.workspaceTool.findFirst({
      where: {
        workspaceId,
        toolId,
      },
    });

    if (existingWorkspaceTool) {
      return NextResponse.json(
        { error: 'Tool already in workspace' },
        { status: 400 }
      );
    }

    // Get the highest position in the workspace
    const maxPosition = await prisma.workspaceTool.findFirst({
      where: { workspaceId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const newPosition = (maxPosition?.position ?? -1) + 1;

    // Add tool to workspace
    const workspaceTool = await prisma.workspaceTool.create({
      data: {
        workspaceId,
        toolId,
        position: newPosition,
      },
      include: {
        tool: true,
      },
    });

    return NextResponse.json(workspaceTool, { status: 201 });
  } catch (error) {
    console.error('Error adding tool to workspace:', error);
    return NextResponse.json(
      { error: 'Failed to add tool to workspace' },
      { status: 500 }
    );
  }
}

// DELETE remove a tool from a workspace
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = params.id;
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: session.user.id,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Delete the workspace tool
    await prisma.workspaceTool.deleteMany({
      where: {
        workspaceId,
        toolId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing tool from workspace:', error);
    return NextResponse.json(
      { error: 'Failed to remove tool from workspace' },
      { status: 500 }
    );
  }
}
