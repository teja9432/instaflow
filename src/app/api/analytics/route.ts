import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  try {
    // 1. Get all logs for accounts owned by this User
    const logs = await prisma.activityLog.findMany({
      where: {
        instagramAccount: {
          userId: userId,
        },
      },
      include: {
        automation: {
          select: {
            postId: true,
            triggerKeyword: true,
          },
        },
        instagramAccount: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // 2. Compute KPI stats
    const totalProcessed = logs.length;
    const totalDmsSent = logs.filter(
      (log) => log.status === 'SENT_SUCCESS' || log.status === 'SENT_FALLBACK'
    ).length;
    
    const conversionRate = totalProcessed > 0 
      ? Math.round((totalDmsSent / totalProcessed) * 100) 
      : 0;

    // 3. Compile Chart data (last 7 days of activity)
    const dailyChartData = getDailyTimelineData(logs);

    return NextResponse.json({
      metrics: {
        totalProcessed,
        totalDmsSent,
        conversionRate,
      },
      chartData: dailyChartData,
      logs: logs.slice(0, 100), // Limit to 100 logs for payload efficiency
    });
  } catch (error) {
    console.error('Error fetching analytics details:', error);
    return NextResponse.json({ error: 'Failed to compile analytics.' }, { status: 500 });
  }
}

/**
 * Utility helper to group logs into standard daily totals for chart display
 */
function getDailyTimelineData(logs: any[]) {
  const last7Days: { [key: string]: { comments: number; dms: number } } = {};
  
  // Initialize last 7 days keys
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    last7Days[dateString] = { comments: 0, dms: 0 };
  }

  // Aggregate logs
  logs.forEach((log) => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    if (last7Days[logDate] !== undefined) {
      last7Days[logDate].comments += 1;
      if (log.status === 'SENT_SUCCESS' || log.status === 'SENT_FALLBACK') {
        last7Days[logDate].dms += 1;
      }
    }
  });

  // Convert to arrays
  const labels = Object.keys(last7Days).map((dateStr) => {
    const [_, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  });
  
  const commentsData = Object.values(last7Days).map((day) => day.comments);
  const dmsData = Object.values(last7Days).map((day) => day.dms);

  return {
    labels,
    datasets: [
      {
        label: 'Comments Processed',
        data: commentsData,
        borderColor: '#9c27b0', // MUI purple
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        tension: 0.4,
      },
      {
        label: 'DMs Dispatched',
        data: dmsData,
        borderColor: '#00e5ff', // MUI light cyan
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };
}
