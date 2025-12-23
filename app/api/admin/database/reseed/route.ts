import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Starting database reseed...');

    // Run the seed script
    const { stdout, stderr } = await execAsync('npm run db:seed', {
      timeout: 300000, // 5 minutes timeout
    });

    console.log('Seed stdout:', stdout);
    if (stderr) console.error('Seed stderr:', stderr);

    return NextResponse.json({
      success: true,
      message: 'Database reseeded successfully',
      output: stdout,
    });
  } catch (error: any) {
    console.error('Error reseeding database:', error);
    return NextResponse.json(
      {
        error: 'Failed to reseed database',
        message: error.message,
        output: error.stdout || error.stderr,
      },
      { status: 500 }
    );
  }
}
