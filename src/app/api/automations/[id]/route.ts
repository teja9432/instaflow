import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * PATCH: Toggle active status or update details of a specific automation rule
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  const automationId = params.id;

  try {
    // 1. Tenant Check: Verify that the automation rule belongs to an Instagram account owned by the user
    const automation = await prisma.automation.findFirst({
      where: {
        id: automationId,
        instagramAccount: {
          userId: userId,
        },
      },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation rule not found or access denied.' }, { status: 404 });
    }

    // 2. Parse body fields
    const body = await req.json();
    const updateData: any = {};

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }
    if (body.triggerKeyword !== undefined) {
      updateData.triggerKeyword = body.triggerKeyword.trim();
    }
    if (body.pdfUrl !== undefined) {
      updateData.pdfUrl = body.pdfUrl.trim();
    }
    if (body.successMessage !== undefined) {
      updateData.successMessage = body.successMessage;
    }
    if (body.fallbackMessage !== undefined) {
      updateData.fallbackMessage = body.fallbackMessage;
    }

    // 3. Update automation rule in DB
    const updatedAutomation = await prisma.automation.update({
      where: { id: automationId },
      data: updateData,
    });

    return NextResponse.json({ automation: updatedAutomation });
  } catch (error) {
    console.error('Error updating automation rule:', error);
    return NextResponse.json({ error: 'Failed to update automation.' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a specific automation rule
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  const automationId = params.id;

  try {
    // 1. Tenant Check
    const automation = await prisma.automation.findFirst({
      where: {
        id: automationId,
        instagramAccount: {
          userId: userId,
        },
      },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation rule not found or access denied.' }, { status: 404 });
    }

    // 2. Delete automation rule
    await prisma.automation.delete({
      where: { id: automationId },
    });

    return NextResponse.json({ success: true, message: 'Automation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    return NextResponse.json({ error: 'Failed to delete automation.' }, { status: 500 });
  }
}
