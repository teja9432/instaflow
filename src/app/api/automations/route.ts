import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * GET: Retrieve all automations belonging to the authenticated User's accounts
 */
export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  try {
    const automations = await prisma.automation.findMany({
      where: {
        instagramAccount: {
          userId: userId,
        },
      },
      include: {
        instagramAccount: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ automations });
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json({ error: 'Database query failed.' }, { status: 500 });
  }
}

/**
 * POST: Create a new automation rule
 */
export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  try {
    const {
      instagramAccountId,
      postId,
      postMediaUrl,
      postCaption,
      triggerKeyword,
      pdfUrl,
      successMessage,
      fallbackMessage,
    } = await req.json();

    // Validations
    if (!instagramAccountId || !postId || !triggerKeyword || !pdfUrl) {
      return NextResponse.json(
        { error: 'Instagram Account ID, Post ID, Trigger Keyword, and PDF URL are required.' },
        { status: 400 }
      );
    }

    // Tenant check: ensure the Instagram Account belongs to the logged-in User
    const account = await prisma.instagramAccount.findFirst({
      where: {
        id: instagramAccountId,
        userId: userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Selected Instagram Account not found or unauthorized.' },
        { status: 403 }
      );
    }

    // Check if an automation rule already exists for this post with the same keyword
    const existingRule = await prisma.automation.findFirst({
      where: {
        instagramAccountId,
        postId,
        triggerKeyword: {
          equals: triggerKeyword.trim(),
        },
      },
    });

    if (existingRule) {
      return NextResponse.json(
        { error: 'An automation trigger with this keyword already exists for this post.' },
        { status: 400 }
      );
    }

    // Save database record
    const automation = await prisma.automation.create({
      data: {
        instagramAccountId,
        postId,
        postMediaUrl,
        postCaption,
        triggerKeyword: triggerKeyword.trim(),
        pdfUrl: pdfUrl.trim(),
        successMessage: successMessage || 'Here is your downloadable resource: {link}',
        fallbackMessage: fallbackMessage || 'To unlock this download, please follow our account first and try again!',
        isActive: true,
      },
    });

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json({ error: 'Failed to create automation rule.' }, { status: 500 });
  }
}
