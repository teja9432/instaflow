import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  // Validate caller session (only logged-in SaaS users can trigger simulation)
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  try {
    const { instagramAccountId, postId, commentText, commenterUsername } = await req.json();

    if (!postId || !commentText || !commenterUsername) {
      return NextResponse.json(
        { error: 'Post ID, Comment Text, and Commenter Username are required.' },
        { status: 400 }
      );
    }

    // 1. Resolve target Instagram Account
    let account;
    if (instagramAccountId) {
      account = await prisma.instagramAccount.findFirst({
        where: { id: instagramAccountId, userId },
      });
    } else {
      // Default to their first connected account
      account = await prisma.instagramAccount.findFirst({
        where: { userId },
      });
    }

    if (!account) {
      return NextResponse.json(
        { error: 'No connected Instagram account found. Connect an account first.' },
        { status: 404 }
      );
    }

    // 2. Generate random IDs for the mock payload
    const mockCommentId = 'mock_comment_' + Math.random().toString(36).substring(2, 9);
    const mockCommenterId = 'mock_user_' + Math.random().toString(36).substring(2, 9);

    // 3. Construct the official Meta webhook JSON payload structure
    const webhookPayload = {
      object: 'instagram',
      entry: [
        {
          id: account.instagramId, // Instagram Account ID
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'comments',
              value: {
                id: mockCommentId,
                text: commentText,
                from: {
                  id: mockCommenterId,
                  username: commenterUsername,
                },
                media: {
                  id: postId,
                },
              },
            },
          ],
        },
      ],
    };

    // 4. Invoke the live webhook logic directly by importing and running it, or sending an internal HTTP call
    // Sending an internal HTTP POST requests ensures the webhook runs end-to-end exactly as designed.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const webhookUrl = `${appUrl}/api/webhooks/instagram`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Simulated webhook failed to process.', details: errorText },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    // 5. Fetch the newly generated log for confirmation
    const newLog = await prisma.activityLog.findUnique({
      where: { commentId: mockCommentId },
      include: {
        automation: true,
      },
    });

    return NextResponse.json({
      success: true,
      webhookResult: responseData,
      simulatedPayload: webhookPayload,
      processedLog: newLog,
    });
  } catch (error: any) {
    console.error('Error during webhook simulation:', error);
    return NextResponse.json(
      { error: 'Simulation execution exception: ' + error.message },
      { status: 500 }
    );
  }
}
