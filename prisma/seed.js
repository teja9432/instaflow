const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database via pure JS script...');

  // 1. Clear existing database entries
  await prisma.activityLog.deleteMany({});
  await prisma.automation.deleteMany({});
  await prisma.instagramAccount.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create the standard demo User
  const demoPassword = await bcrypt.hash('demopass123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@instaflow.com',
      password: demoPassword,
      name: 'Demo Creator',
    },
  });
  console.log(`- Created Demo User: ${user.email}`);

  // 3. Connect a mock Instagram Profile
  const account = await prisma.instagramAccount.create({
    data: {
      userId: user.id,
      instagramId: '17841400000000001',
      username: 'demo_creator',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      accessToken: 'mock_user_page_token_abc123xyz',
      pageId: '102938475610293',
      pageAccessToken: 'mock_user_page_token_abc123xyz',
    },
  });
  console.log(`- Connected Instagram Profile: @${account.username}`);

  // 4. Create standard active campaigns/automations
  const automation1 = await prisma.automation.create({
    data: {
      instagramAccountId: account.id,
      postId: 'ig_post_111',
      postMediaUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=300&auto=format&fit=crop',
      postCaption: '🚀 Our brand new SaaS Automation playbook is finally out! Comment "PDF" to get the direct download link instantly sent to your DM. Check out these growth hacks!',
      triggerKeyword: 'PDF',
      pdfUrl: 'https://instaflow.saas/assets/saas-automation-playbook.pdf',
      successMessage: 'Hi {username}! 🚀 Thank you for following! Here is your direct download link: {link}',
      fallbackMessage: 'Hi {username}! 🔒 This resource is locked for followers only. Please follow @demo_creator first and try again!',
      isActive: true,
    },
  });

  const automation2 = await prisma.automation.create({
    data: {
      instagramAccountId: account.id,
      postId: 'ig_post_222',
      postMediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop',
      postCaption: 'We just hit 10k followers! 🎉 To thank our amazing community, we created a comprehensive guide on Meta Graph API configurations. Comment "GUIDE" to get the link.',
      triggerKeyword: 'GUIDE',
      pdfUrl: 'https://instaflow.saas/assets/meta-api-configuration-guide.pdf',
      successMessage: 'Hi {username}! 🎉 Thanks for following us. Here is your configuration guide link: {link}',
      fallbackMessage: 'Hi {username}! 🚨 To access this guide, please follow us first!',
      isActive: true,
    },
  });

  console.log(`- Initialized Automation rules for Post 1 (PDF) and Post 2 (GUIDE)`);

  // 5. Populate historical activity logs
  const logsToCreate = [];
  const days = 7;
  const commenters = [
    { username: 'mark_developer', follows: true },
    { username: 'john_unfollow_test', follows: false },
    { username: 'alice_designer', follows: true },
    { username: 'steve_startup', follows: true },
    { username: 'becky_marketing', follows: false },
    { username: 'dan_coder', follows: true },
    { username: 'lucy_creator', follows: true },
  ];

  for (let i = 0; i < days; i++) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - i);
    
    const count = Math.floor(Math.random() * 3) + 1;
    for (let c = 0; c < count; c++) {
      const commenter = commenters[Math.floor(Math.random() * commenters.length)];
      const autom = Math.random() > 0.5 ? automation1 : automation2;
      
      logsToCreate.push({
        instagramAccountId: account.id,
        automationId: autom.id,
        commentId: `seed_comment_${i}_${c}_` + Math.random().toString(36).substring(2, 6),
        commentText: `I would love the ${autom.triggerKeyword} details!`,
        commenterUsername: commenter.username,
        commenterId: 'seed_scoped_user_' + Math.random().toString(36).substring(2, 6),
        isFollower: commenter.follows,
        status: commenter.follows ? 'SENT_SUCCESS' : 'SENT_FALLBACK',
        timestamp: logDate,
      });
    }
  }

  for (const log of logsToCreate) {
    await prisma.activityLog.create({ data: log });
  }

  console.log(`- Generated ${logsToCreate.length} historical Activity Log entries.`);
  console.log('Seeding complete! Ready for development.');
}

main()
  .catch((e) => {
    console.error('Seeding process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
