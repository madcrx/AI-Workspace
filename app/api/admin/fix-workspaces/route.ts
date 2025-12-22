import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all users with multiple workspaces
    const users = await prisma.user.findMany({
      include: {
        workspaces: {
          include: {
            tools: true,
          },
        },
      },
    });

    let fixed = 0;
    let deleted = 0;

    for (const user of users) {
      if (user.workspaces.length > 1) {
        // Sort workspaces: default first, then by tool count, then by creation date
        const sortedWorkspaces = user.workspaces.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          if (a.tools.length !== b.tools.length) {
            return b.tools.length - a.tools.length;
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        // Keep the first workspace (highest priority)
        const keepWorkspace = sortedWorkspaces[0];
        const deleteWorkspaces = sortedWorkspaces.slice(1);

        // Collect all tools from workspaces to be deleted
        const toolsToMigrate = deleteWorkspaces.flatMap((ws) => ws.tools);

        // Migrate tools to the kept workspace
        for (const tool of toolsToMigrate) {
          // Check if tool already exists in kept workspace
          const exists = await prisma.workspaceTool.findFirst({
            where: {
              workspaceId: keepWorkspace.id,
              toolId: tool.toolId,
            },
          });

          if (!exists) {
            // Add tool to kept workspace
            await prisma.workspaceTool.create({
              data: {
                workspaceId: keepWorkspace.id,
                toolId: tool.toolId,
                position: tool.position,
                gridX: tool.gridX,
                gridY: tool.gridY,
                width: tool.width,
                height: tool.height,
                customConfig: tool.customConfig,
              },
            });
          }
        }

        // Delete duplicate workspaces
        await prisma.workspace.deleteMany({
          where: {
            id: {
              in: deleteWorkspaces.map((ws) => ws.id),
            },
          },
        });

        // Ensure kept workspace is marked as default
        if (!keepWorkspace.isDefault) {
          await prisma.workspace.update({
            where: { id: keepWorkspace.id },
            data: { isDefault: true },
          });
        }

        fixed++;
        deleted += deleteWorkspaces.length;
      }
    }

    return NextResponse.json({
      success: true,
      usersFixed: fixed,
      workspacesDeleted: deleted,
      message: `Fixed ${fixed} users by removing ${deleted} duplicate workspaces`,
    });
  } catch (error) {
    console.error('Error fixing workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fix workspaces' },
      { status: 500 }
    );
  }
}
