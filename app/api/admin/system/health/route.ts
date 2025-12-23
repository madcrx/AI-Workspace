import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Database health check
    let databaseHealthy = false;
    let databaseLatency = 0;
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - start;
      databaseHealthy = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // System information
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);

    const cpus = os.cpus();
    const loadAverage = os.loadavg();

    // Process information
    const processMemory = process.memoryUsage();
    const uptime = process.uptime();

    // Format uptime
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

    return NextResponse.json({
      healthy: databaseHealthy,
      timestamp: new Date().toISOString(),
      database: {
        healthy: databaseHealthy,
        latency: `${databaseLatency}ms`,
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpuCount: cpus.length,
        cpuModel: cpus[0]?.model || 'Unknown',
        loadAverage: loadAverage.map((avg) => avg.toFixed(2)),
        totalMemory: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMemory: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usedMemory: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
        memoryUsagePercent: `${memoryUsagePercent}%`,
      },
      process: {
        pid: process.pid,
        uptime: uptimeFormatted,
        heapUsed: `${(processMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(processMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(processMemory.rss / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    );
  }
}
