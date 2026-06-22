import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  try {
    const accounts = await prisma.instagramAccount.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            automations: true,
            logs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    return NextResponse.json({ error: 'Database query failed.' }, { status: 500 });
  }
}
