import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, `database-backup-${timestamp}.sql`);

    // Create backups directory if it doesn't exist
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (error) {
      console.error('Error creating backup directory:', error);
    }

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    // Parse DATABASE_URL to get connection details
    const url = new URL(databaseUrl);
    const dbName = url.pathname.slice(1);
    const host = url.hostname;
    const port = url.port || '5432';
    const user = url.username;
    const password = url.password;

    // Create pg_dump command
    const dumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${dbName} -f ${backupFile}`;

    try {
      await execAsync(dumpCommand, { timeout: 300000 });

      // Get file size
      const stats = await fs.stat(backupFile);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      return NextResponse.json({
        success: true,
        message: 'Database backup created successfully',
        filename: `database-backup-${timestamp}.sql`,
        size: `${fileSizeInMB} MB`,
        path: backupFile,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Failed to create database backup',
          message: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating database backup:', error);
    return NextResponse.json(
      { error: 'Failed to create database backup', message: error.message },
      { status: 500 }
    );
  }
}
