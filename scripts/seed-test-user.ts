import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

/**
 * Seed test user data for hudchew@gmail.com
 * Creates a 7-day challenge with meals spread across days
 * Meets all eligibility requirements for persona analysis
 */
async function seedTestUser() {
  console.log('🌱 Starting test user seed...');

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: 'hudchew@gmail.com' },
  });

  if (!user) {
    console.log('❌ User hudchew@gmail.com not found in database.');
    console.log('   Please make sure you have logged in with this email at least once.');
    console.log('   The user will be created automatically via Clerk webhook.');
    return;
  }

  console.log(`✅ Found user: ${user.email} (${user.name || 'No name'})`);

  // Check if user already has an active challenge
  const existingChallenge = await prisma.challenge.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
  });

  if (existingChallenge) {
    console.log(`⚠️  User already has an active challenge (ID: ${existingChallenge.id})`);
    console.log('   Deleting existing challenge and meals...');
    await prisma.challenge.delete({
      where: { id: existingChallenge.id },
    });
  }

  // Get all available tags
  const tags = await prisma.tag.findMany();
  console.log(`📋 Found ${tags.length} tags in database`);

  if (tags.length < 5) {
    console.log('❌ Not enough tags in database. Need at least 5 unique tags.');
    return;
  }

  // Group tags by category
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);

  const categories = Object.keys(tagsByCategory);
  if (categories.length < 2) {
    console.log('❌ Not enough tag categories. Need at least 2 categories.');
    return;
  }

  console.log(`📊 Available categories: ${categories.join(', ')}`);

  // Create challenge starting 6 days ago (so today is day 7)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1); // Tomorrow (to ensure day 7 is within range)
  endDate.setHours(23, 59, 59, 999);

  const challenge = await prisma.challenge.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created challenge: ${challenge.id}`);
  console.log(`   Start: ${startDate.toISOString()}`);
  console.log(`   End: ${endDate.toISOString()}`);

  // Create meals spread across 7 days
  // Day 1-7: At least 1 meal per day (total 7), plus extras to reach ≥10 meals
  // We'll create 12 meals total (distributed: 2, 2, 1, 2, 1, 2, 2)
  const mealPlan = [
    { day: 1, meals: 2 }, // Day 1: 2 meals
    { day: 2, meals: 2 }, // Day 2: 2 meals
    { day: 3, meals: 1 }, // Day 3: 1 meal
    { day: 4, meals: 2 }, // Day 4: 2 meals
    { day: 5, meals: 1 }, // Day 5: 1 meal
    { day: 6, meals: 2 }, // Day 6: 2 meals
    { day: 7, meals: 2 }, // Day 7: 2 meals
  ];

  let mealCount = 0;
  const meals = [];

  // Use a simple placeholder image URL
  // In production, you'd upload real images to Vercel Blob
  const dummyImageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';

  for (const plan of mealPlan) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + plan.day - 1);

    for (let i = 0; i < plan.meals; i++) {
      // Spread meals throughout the day
      const mealTime = new Date(dayDate);
      if (plan.meals === 1) {
        mealTime.setHours(12, 0, 0, 0); // Noon
      } else if (i === 0) {
        mealTime.setHours(8 + i * 2, 30, 0, 0); // Morning/Noon
      } else {
        mealTime.setHours(18, 30, 0, 0); // Evening
      }

      // Select diverse tags (at least 5 unique tags across 2+ categories)
      const selectedTags: typeof tags = [];
      
      // Always include tags from at least 2 categories
      selectedTags.push(...tagsByCategory[categories[0]].slice(0, 2));
      selectedTags.push(...tagsByCategory[categories[1]].slice(0, 2));
      
      // Add more tags from other categories if available
      if (categories.length > 2 && tagsByCategory[categories[2]].length > 0) {
        selectedTags.push(tagsByCategory[categories[2]][0]);
      }
      
      // Add more unique tags if needed
      const remainingTags = tags.filter(t => !selectedTags.includes(t));
      while (selectedTags.length < 3 && remainingTags.length > 0) {
        selectedTags.push(remainingTags.shift()!);
      }

      // Remove duplicates
      const uniqueSelectedTags = Array.from(
        new Map(selectedTags.map(t => [t.id, t])).values()
      );

      meals.push({
        challengeId: challenge.id,
        imageUrl: dummyImageUrl,
        mealTime,
        dayNumber: plan.day,
        notes: `Test meal ${mealCount + 1} on day ${plan.day}`,
        tags: {
          create: uniqueSelectedTags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      });

      mealCount++;
    }
  }

  // Create all meals
  for (const mealData of meals) {
    await prisma.meal.create({
      data: mealData,
    });
  }

  console.log(`✅ Created ${mealCount} meals across 7 days`);

  // Verify eligibility
  const challengeWithMeals = await prisma.challenge.findUnique({
    where: { id: challenge.id },
    include: {
      meals: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  });

  if (!challengeWithMeals) {
    console.log('❌ Error retrieving challenge');
    return;
  }

  // Calculate stats
  const totalMeals = challengeWithMeals.meals.length;
  const dayKeys = new Set<string>();
  challengeWithMeals.meals.forEach((m) => {
    const d = new Date(m.mealTime);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayKeys.add(key);
  });
  const activeDays = dayKeys.size;

  const tagSlugSet = new Set<string>();
  const catSet = new Set<string>();
  challengeWithMeals.meals.forEach((m) => {
    m.tags.forEach(({ tag }) => {
      tagSlugSet.add(tag.slug);
      catSet.add(tag.category);
    });
  });
  const uniqueTags = tagSlugSet.size;
  const distinctCategories = catSet.size;

  const now = new Date();
  const diffTime = now.getTime() - challengeWithMeals.startDate.getTime();
  const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  console.log('\n📊 Challenge Statistics:');
  console.log(`   Day Number: ${dayNumber}/7`);
  console.log(`   Total Meals: ${totalMeals}`);
  console.log(`   Active Days: ${activeDays}`);
  console.log(`   Unique Tags: ${uniqueTags}`);
  console.log(`   Distinct Categories: ${distinctCategories}`);

  console.log('\n✅ Eligibility Check:');
  const reasons: string[] = [];
  if (dayNumber < 7) {
    reasons.push(`❌ Day ${dayNumber} < 7`);
  } else {
    console.log('   ✅ Day 7 reached');
  }
  if (totalMeals < 10 && activeDays < 5) {
    reasons.push(`❌ Meals ${totalMeals} < 10 AND Active Days ${activeDays} < 5`);
  } else {
    console.log(`   ✅ Meals (${totalMeals}) ≥ 10 OR Active Days (${activeDays}) ≥ 5`);
  }
  if (uniqueTags < 5) {
    reasons.push(`❌ Unique Tags ${uniqueTags} < 5`);
  } else {
    console.log(`   ✅ Unique Tags (${uniqueTags}) ≥ 5`);
  }
  if (distinctCategories < 2) {
    reasons.push(`❌ Categories ${distinctCategories} < 2`);
  } else {
    console.log(`   ✅ Categories (${distinctCategories}) ≥ 2`);
  }

  if (reasons.length > 0) {
    console.log('\n⚠️  Eligibility Issues:');
    reasons.forEach((r) => console.log(`   ${r}`));
  } else {
    console.log('\n✅ User is ELIGIBLE for persona analysis!');
    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Login as hudchew@gmail.com`);
    console.log(`   2. Go to Dashboard`);
    console.log(`   3. Click "วิเคราะห์ Persona" button`);
  }

  console.log(`\n✅ Test user seed completed!`);
}

seedTestUser()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

