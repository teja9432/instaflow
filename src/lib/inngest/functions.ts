import { inngest } from './client';
import { NonRetryableError } from 'inngest';
import { prisma } from '@/lib/prisma';
import { checkIfFollowing, sendInstagramDM, MetaApiError } from '@/lib/meta';

export const processInstagramComment = inngest.createFunction(
  {
    id: 'process-instagram-comment',
    idempotency: 'event.data.commentId',
    concurrency: {
      limit: 5,
    },
    retries: {
      attempts: 4,
      backoff: {
        initialDelay: '5s',
        maxDelay: '2h',
        exponential: 2,
      },
    },
  },
  { event: 'instagram/comment.received' },
  async ({ event, step }) => {
    const { instagramAccountId, commentId, commentText, commenterUsername, commenterId, postId } = event.data;

    // Step 1: Idempotency check inside Database (extra safeguard)
    const alreadyLogged = await step.run('idempotency-check', async () => {
      return await prisma.activityLog.findUnique({
        where: { commentId },
      });
    });

    if (alreadyLogged) {
      return { status: 'skipped', reason: 'Comment already processed' };
    }

    // Step 2: Fetch Creator Instagram Account credentials from Database
    const account = await step.run('fetch-instagram-account', async () => {
      const accountData = await prisma.instagramAccount.findUnique({
        where: { instagramId: instagramAccountId },
      });
      if (!accountData) {
        throw new Error(`Instagram Account ${instagramAccountId} not found in database.`);
      }
      return accountData;
    });

    // Step 3: Fetch active automation matching the postId
    const automation = await step.run('fetch-automation', async () => {
      return await prisma.automation.findFirst({
        where: {
          instagramAccountId: account.id,
          postId: postId,
          isActive: true,
        },
      });
    });

    if (!automation) {
      return { status: 'skipped', reason: `No active automation found for Post ID ${postId}` };
    }

    // Step 4: Verify trigger keyword match
    const keyword = automation.triggerKeyword.toLowerCase().trim();
    const textLower = commentText.toLowerCase();

    if (!textLower.includes(keyword)) {
      return { status: 'skipped', reason: 'Keyword mismatch' };
    }

    // Step 5: Follower checking is bypassed/deprecated to avoid violating Meta API limitations
    const isFollower = true;

    // Step 6: Construct direct message
    let messageToSend = automation.successMessage
      .replace(/{username}/g, commenterUsername)
      .replace(/{link}/g, automation.pdfUrl);

    if (!messageToSend.includes(automation.pdfUrl)) {
      messageToSend += `\n\nDownload Link: ${automation.pdfUrl}`;
    }

    // Step 7: Send DM via Meta API
    let dmSuccess = false;
    let errorDetails: string | null = null;
    let status = 'FAILED';

    const result = await step.run('send-instagram-dm', async () => {
      try {
        const success = await sendInstagramDM(
          commenterId,
          messageToSend,
          account.pageAccessToken
        );
        const resolvedStatus = success ? 'SENT_SUCCESS' : 'FAILED';
        const err = success ? null : 'Meta API rejected message payload.';
        return { success, status: resolvedStatus, errorDetails: err };
      } catch (dmErr: any) {
        console.error('Failed to send DM:', dmErr);
        
        // Handle Meta API specific errors
        if (dmErr.name === 'MetaApiError') {
          const isRateLimit = dmErr.status === 429 || [17, 32, 613].includes(dmErr.code);
          const isAuthError = [10, 102, 190].includes(dmErr.code);
          const isInvalidParam = dmErr.code === 100;
          
          if (isRateLimit) {
            throw new Error(`Meta Rate Limit Hit (code ${dmErr.code}): ${dmErr.message}`);
          }
          
          if (isAuthError || isInvalidParam) {
            throw new NonRetryableError(`Meta Permanent Error (code ${dmErr.code}): ${dmErr.message}`);
          }
        }
        
        throw dmErr; // Re-throw other transient/network errors
      }
    });

    dmSuccess = result.success;
    status = result.status;
    errorDetails = result.errorDetails;

    // Step 8: Log activity status into Database
    await step.run('log-activity', async () => {
      await prisma.activityLog.create({
        data: {
          instagramAccountId: account.id,
          automationId: automation.id,
          commentId,
          commentText,
          commenterUsername,
          commenterId,
          isFollower,
          status,
          errorDetails,
        },
      });
    });

    return { status: dmSuccess ? 'completed' : 'failed' };
  }
);
