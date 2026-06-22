import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';

const META_APP_ID = process.env.META_APP_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  // Validate request session
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  if (!META_APP_ID) {
    return NextResponse.json(
      { error: 'Meta OAuth App ID is not configured.' },
      { status: 500 }
    );
  }

  // Meta OAuth redirection setup
  // We request permissions for:
  // - instagram_basic: get posts, profile info
  // - instagram_manage_comments: read/write comments (needed for webhooks & replies)
  // - instagram_manage_messages: send DMs
  // - pages_read_engagement: fetch page profiles
  // - pages_show_list: show available pages
  const scopes = [
    'instagram_basic',
    'instagram_manage_comments',
    'instagram_manage_messages',
    'pages_read_engagement',
    'pages_show_list'
  ].join(',');

  const redirectUri = `${APP_URL}/api/instagram/callback`;
  const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scopes}&response_type=code&state=${userId}`;

  return NextResponse.json({ url: oauthUrl });
}
