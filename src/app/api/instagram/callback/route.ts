import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exchangeAccessToken } from '@/lib/meta';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state'); // The userId we sent as state
  const error = searchParams.get('error');

  if (error || !code || !userId) {
    console.error('Meta OAuth callback error or missing arguments:', { error, code, userId });
    return NextResponse.redirect(`${APP_URL}/dashboard/accounts?error=oauth_failed`);
  }

  try {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.redirect(`${APP_URL}/login?error=invalid_user`);
    }

    // 2. Exchange access token for long-lived page token and Instagram Business Account info
    const redirectUri = `${APP_URL}/api/instagram/callback`;
    const profile = await exchangeAccessToken(code, redirectUri);

    // 3. Save or update InstagramAccount record in the database
    await prisma.instagramAccount.upsert({
      where: { instagramId: profile.instagramId },
      update: {
        username: profile.username,
        profilePicture: profile.profilePicture,
        accessToken: profile.pageAccessToken, // Storing page token as the operational token
        pageId: profile.pageId,
        pageAccessToken: profile.pageAccessToken,
        userId: userId, // Re-bind if owned by someone else or moving
      },
      create: {
        userId: userId,
        instagramId: profile.instagramId,
        username: profile.username,
        profilePicture: profile.profilePicture,
        accessToken: profile.pageAccessToken,
        pageId: profile.pageId,
        pageAccessToken: profile.pageAccessToken,
      },
    });

    // Redirect user to accounts dashboard with success status
    return NextResponse.redirect(`${APP_URL}/dashboard/accounts?success=true`);
  } catch (err: any) {
    console.error('Error handling Instagram callback exchange:', err);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/accounts?error=${encodeURIComponent(err.message || 'unknown')}`
    );
  }
}
