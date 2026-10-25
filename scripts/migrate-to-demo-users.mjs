process.loadEnvFile('C:/Users/Khaled/Khaled Dask/Backend/cpbryn/.env');

async function migrateUsers() {
  const backendPrismaPath = 'file:///C:/Users/Khaled/Khaled%20Dask/Backend/cpbryn/node_modules/@prisma/client/index.js';
  const { PrismaClient } = await import(backendPrismaPath);
  const prisma = new PrismaClient();

  const DEMO_EMAILS = [
    'admin@example.com',
    'khaledahmednayeem.dev@gmail.com',
    'user001@testmail.com'
  ];

  try {
    console.log('--- STARTING USER CLEANUP TO 3 QUICK DEMO USERS ---');

    // 1. Verify Demo Users exist
    const demoUsers = await prisma.user.findMany({
      where: { email: { in: DEMO_EMAILS } },
      include: { operatorProfile: true }
    });

    if (demoUsers.length !== 3) {
      throw new Error(`Expected all 3 demo users to exist. Found: ${demoUsers.map(u => u.email).join(', ')}`);
    }

    const khaledUser = demoUsers.find(u => u.email === 'khaledahmednayeem.dev@gmail.com');
    if (!khaledUser || !khaledUser.operatorProfile) {
      throw new Error('Operator user khaledahmednayeem.dev@gmail.com does not have an operator profile!');
    }
    const targetOperatorProfileId = khaledUser.operatorProfile.id;
    console.log(`Found target operator profile: ${khaledUser.operatorProfile.companyName} (${targetOperatorProfileId})`);

    // 2. Identify users to delete
    const usersToDelete = await prisma.user.findMany({
      where: { email: { notIn: DEMO_EMAILS } },
      select: { id: true, email: true, role: true }
    });
    const deleteIds = usersToDelete.map(u => u.id);
    console.log(`Found ${usersToDelete.length} extra users to remove.`);

    // 3. Re-assign all ferries and routes from other operators to Khaled's profile
    const otherProfiles = await prisma.operatorProfile.findMany({
      where: { id: { not: targetOperatorProfileId } }
    });
    const otherProfileIds = otherProfiles.map(p => p.id);

    if (otherProfileIds.length > 0) {
      const transferredFerries = await prisma.ferry.updateMany({
        where: { operatorId: { in: otherProfileIds } },
        data: { operatorId: targetOperatorProfileId }
      });
      console.log(`Transferred ${transferredFerries.count} ferries to Khaled's operator profile.`);

      const transferredRoutes = await prisma.route.updateMany({
        where: { operatorId: { in: otherProfileIds } },
        data: { operatorId: targetOperatorProfileId }
      });
      console.log(`Transferred ${transferredRoutes.count} routes to Khaled's operator profile.`);

      // 4. Delete the other operator profiles
      const deletedProfiles = await prisma.operatorProfile.deleteMany({
        where: { id: { in: otherProfileIds } }
      });
      console.log(`Deleted ${deletedProfiles.count} other operator profiles.`);
    }

    // 5. Delete sessions of users being deleted
    if (prisma.session) {
      const deletedSessions = await prisma.session.deleteMany({
        where: { userId: { in: deleteIds } }
      });
      console.log(`Cleaned up ${deletedSessions.count} sessions.`);
    }

    // 6. Delete other users
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: deleteIds } }
    });
    console.log(`Deleted ${deletedUsers.count} extra users.`);

    // 7. Verification: Confirm only 3 users remain
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        status: true,
        operatorProfile: {
          select: {
            id: true,
            companyName: true,
            _count: {
              select: { ferries: true, routes: true }
            }
          }
        }
      }
    });

    console.log('\n======================================================');
    console.log(`SUCCESS! Total users in database now: ${remainingUsers.length}`);
    console.log('======================================================');
    console.log(JSON.stringify(remainingUsers, null, 2));

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
