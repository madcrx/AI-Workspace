import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptPassword } from '@/lib/crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toolId, username, password, notes } = await req.json();

    if (!toolId || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Encrypt the password
    const { encryptedPassword, iv } = encryptPassword(password);

    // Create or update credential
    const credential = await prisma.toolCredential.upsert({
      where: {
        userId_toolId: {
          userId: session.user.id,
          toolId,
        },
      },
      update: {
        username,
        encryptedPassword,
        encryptionIv: iv,
        notes: notes || null,
      },
      create: {
        userId: session.user.id,
        toolId,
        username,
        encryptedPassword,
        encryptionIv: iv,
        notes: notes || null,
      },
      include: {
        tool: {
          select: {
            name: true,
            loginUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: credential.id,
      toolId: credential.toolId,
      username: credential.username,
      notes: credential.notes,
      toolName: credential.tool.name,
    });
  } catch (error) {
    console.error('Error saving credentials:', error);
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await prisma.toolCredential.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tool: {
          select: {
            name: true,
            loginUrl: true,
            logoUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return credentials without the encrypted password
    return NextResponse.json(
      credentials.map((cred) => ({
        id: cred.id,
        toolId: cred.toolId,
        username: cred.username,
        notes: cred.notes,
        toolName: cred.tool.name,
        loginUrl: cred.tool.loginUrl,
        logoUrl: cred.tool.logoUrl,
        createdAt: cred.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}
