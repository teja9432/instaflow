import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'your_custom_secure_verify_token';

/**
 * GET: Verification challenge handler for Meta Webhooks setup
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verification successful.');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('Webhook verification failed: token mismatch or invalid mode.');
  return new Response('Verification token mismatch', { status: 403 });
}

/**
 * POST: Process incoming Instagram Webhook events (e.g. comments or mentions)
 * Offloads actual processing asynchronously to Inngest queues.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify webhook payload type
    if (body.object !== 'instagram') {
      return NextResponse.json({ error: 'Unsupported object webhook type' }, { status: 400 });
    }

    const entries = body.entry || [];
    const eventsToPublish: any[] = [];

    // Parse and accumulate events
    for (const entry of entries) {
      const instagramAccountId = entry.id; // Instagram Business Account ID
      const changes = entry.changes || [];

      for (const change of changes) {
        // We only process comments in this flow
        if (change.field !== 'comments') continue;

        const value = change.value;
        if (!value) continue;

        const commentId = value.id;
        const commentText = value.text;
        const commenterUsername = value.from?.username;
        const commenterId = value.from?.id; // Page-scoped Instagram user ID
        const postId = value.media?.id; // Parent media (post) ID

        if (!commentId || !commentText || !commenterId || !postId) continue;

        eventsToPublish.push({
          name: 'instagram/comment.received',
          data: {
            instagramAccountId,
            commentId,
            commentText,
            commenterUsername,
            commenterId,
            postId,
          },
        });
      }
    }

    // Publish to Inngest queue asynchronously
    if (eventsToPublish.length > 0) {
      console.log(`Publishing ${eventsToPublish.length} comment event(s) to Inngest.`);
      await inngest.send(eventsToPublish);
    }

    // Return instant acknowledgement to Meta
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook event POST:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
