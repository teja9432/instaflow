import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { getInstagramPosts } from '@/lib/meta';

export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json({ error: 'Instagram Account ID is required.' }, { status: 400 });
  }

  try {
    // Multi-tenant check: ensure account belongs to the user
    const account = await prisma.instagramAccount.findFirst({
      where: {
        id: accountId,
        userId: userId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Instagram account not found or access denied.' }, { status: 404 });
    }

    // Fetch posts from Meta Graph API (or mock fallbacks)
    const posts = await getInstagramPosts(account.instagramId, account.pageAccessToken);

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching Instagram posts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Instagram grid posts: ' + (error.message || '') },
      { status: 500 }
    );
  }
}
