import { config } from 'dotenv';
import { resolve } from 'path';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../lib/prisma';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function syncExistingUsers() {
  try {
    console.log('\n🔄 Syncing existing Clerk users to database...\n');

    // Get all users from Clerk
    const clerk = clerkClient();
    const users = await clerk.users.getUserList();

    console.log(`Found ${users.data.length} users in Clerk\n`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users.data) {
      try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { clerkId: user.id },
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${user.emailAddresses[0]?.emailAddress || user.id} (already exists)`);
          skipped++;
          continue;
        }

        // Create user in database
        await prisma.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.firstName || user.lastName || null,
            imageUrl: user.imageUrl || null,
          },
        });

        console.log(`✅ Synced: ${user.emailAddresses[0]?.emailAddress || user.id}`);
        synced++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation - user already exists
          console.log(`⏭️  Skipped: ${user.emailAddresses[0]?.emailAddress || user.id} (duplicate)`);
          skipped++;
        } else {
          console.error(`❌ Error syncing ${user.emailAddresses[0]?.emailAddress || user.id}:`, error.message);
          errors++;
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncExistingUsers();

