import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed initial admin user
 * Run with: tsx prisma/admin-seed.ts
 */
async function main() {
  console.log('🔐 Starting admin seed...');

  // Get admin email and password from environment or use defaults
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eatdentity.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Super Admin';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`⚠️  Admin with email ${adminEmail} already exists. Skipping...`);
    return;
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      isActive: true,
    },
  });

  console.log(`✅ Admin created successfully!`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.name}`);
  console.log(`   ID: ${admin.id}`);
  console.log(`\n⚠️  IMPORTANT: Please change the default password after first login!`);
}

main()
  .catch((e) => {
    console.error('❌ Admin seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

