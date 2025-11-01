# 🗺️ Eat-dentity Development Plan

แผนการพัฒนาแอป Eat-dentity แบบทีละขั้นตอน

**เริ่ม:** 31 ตุลาคม 2025  
**Timeline:** 8 Phases (ประมาณ 2-3 สัปดาห์)  
**Approach:** ทีละขั้นตอน ทดสอบได้ตลอดเวลา

---

## Phase 1: Foundation Setup ⚙️

**เป้าหมาย:** Setup โปรเจกต์พื้นฐาน + UI Framework  
**เวลา:** 1-2 ชั่วโมง

### Tasks

1. **Create Next.js Project**
```bash
npx create-next-app@latest eat-dentity --typescript --tailwind --app
cd eat-dentity
```

2. **Install shadcn/ui**
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge progress dialog avatar tabs
```

3. **โครงสร้างโฟลเดอร์**
```
/app
  /api                 # Server Actions
  /(auth)              # Sign-in, Sign-up
  /(main)              # Protected routes
    /dashboard
    /capture
    /result
    /profile
  /page.tsx            # Landing
/components
  /ui                  # shadcn
  /features            # Feature components
/lib
  /utils.ts
  /constants.ts
  /prisma.ts
/prisma
  /schema.prisma
/public
  /icons               # PWA icons
```

4. **Environment Variables** (`.env.local`)
```env
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
BLOB_READ_WRITE_TOKEN=""
GEMINI_API_KEY=""
```

5. **Git Init**
```bash
git init
git add .
git commit -m "Initial setup: Next.js + Tailwind + shadcn/ui"
```

**Checklist:**
- [ ] Next.js running on localhost:3000
- [ ] Tailwind working
- [ ] shadcn components installed
- [ ] Folder structure created

---

## Phase 2: UI Components & Mock Data 🎨

**เป้าหมาย:** สร้าง UI ทุกหน้าด้วย Mock Data  
**เวลา:** 3-4 วัน

### 2.1 Landing Page (`/app/page.tsx`)

**Components:**
- Hero: "You Are What You Eat!" 🍔→🧑
- Feature Highlights
- Persona Examples Gallery
- CTA: "Start 7-Day Challenge"

**สร้าง:**
- `components/landing/HeroSection.tsx`
- `components/landing/FeatureHighlight.tsx`
- `components/landing/PersonaShowcase.tsx`

### 2.2 Dashboard (`/app/(main)/dashboard/page.tsx`)

**Components:**
- Daily Challenge (Mock Gemini text)
- Challenge Progress (Day 1-7)
- Element Bars (Real-time stats)
- "Capture Meal" Button

**สร้าง:**
- `components/features/ChallengeProgress.tsx`
- `components/features/ElementBars.tsx`
- `components/features/DailyChallenge.tsx`

**Mock Data** (`lib/mock-data.ts`):
```typescript
export const mockChallenge = {
  currentDay: 3,
  totalDays: 7,
  stats: { fried: 40, vegetables: 20, meat: 30, carbs: 10 }
};
```

### 2.3 Capture Page (`/app/(main)/capture/page.tsx`)

**Components:**
- Camera UI (Web API)
- Photo Preview
- Quick Tags Grid
- Save Button

**สร้าง:**
- `components/features/CameraCapture.tsx`
- `components/features/QuickTagsSelector.tsx`
- `components/ui/tag-button.tsx`

**Tags Data** (`lib/constants.ts`):
```typescript
export const QUICK_TAGS = [
  { id: 1, name: 'ทอด', emoji: '🍳', color: 'bg-yellow-500' },
  { id: 2, name: 'ผัก', emoji: '🥬', color: 'bg-green-500' },
  // ... ดูเพิ่มใน app_idea.md
];
```

### 2.4 Result Page (`/app/(main)/result/page.tsx`)

**Components:**
- Food Persona Card (Shareable)
- Stats Chart (Pie/Bar)
- Fun Powers List
- AI Insight (Mock)
- Share & Restart Buttons

**สร้าง:**
- `components/features/PersonaCard.tsx`
- `components/features/StatsChart.tsx`
- `components/features/PowersList.tsx`

**Mock Persona:**
```typescript
export const mockPersona = {
  title: "นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน",
  emoji: "🍗⚔️",
  stats: { fried: 55, veg: 5, meat: 30, carbs: 10 },
  aiInsight: "จงภูมิใจในความกรอบนี้!..."
};
```

### 2.5 Profile Page (`/app/(main)/profile/page.tsx`)

**Components:**
- User Info (Mock)
- Challenge History Timeline
- Persona Collection Gallery
- Overall Stats Chart

**สร้าง:**
- `components/features/ProfileHeader.tsx`
- `components/features/ChallengeHistory.tsx`
- `components/features/PersonaCollection.tsx`

**Checklist:**
- [ ] All pages created with UI
- [ ] Navigation working
- [ ] Mock data displaying
- [ ] Responsive design

---

## Phase 3: Database Setup 🗄️

**เป้าหมาย:** เชื่อม PostgreSQL + Prisma  
**เวลา:** 2-3 ชั่วโมง

### Tasks

1. **Setup Railway PostgreSQL**
   - Sign up: https://railway.app
   - Create New Project → PostgreSQL
   - Copy `DATABASE_URL`

2. **Install Prisma**
```bash
npm install prisma @prisma/client
npx prisma init
```

3. **Create Schema** (`prisma/schema.prisma`)
```prisma
model User {
  id         String      @id @default(cuid())
  clerkId    String      @unique
  email      String      @unique
  name       String?
  imageUrl   String?
  challenges Challenge[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model Challenge {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startDate DateTime
  endDate   DateTime
  status    Status   @default(ACTIVE)
  meals     Meal[]
  persona   Persona?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Status {
  ACTIVE
  COMPLETED
  ABANDONED
}

model Meal {
  id          String    @id @default(cuid())
  challengeId String
  challenge   Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  imageUrl    String
  mealTime    DateTime
  dayNumber   Int
  notes       String?
  tags        MealTag[]
  createdAt   DateTime  @default(now())
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  category Category
  emoji    String
  color    String
  meals    MealTag[]
}

enum Category {
  COOKING_METHOD
  FOOD_GROUP
  TASTE
  BEVERAGE
}

model MealTag {
  id     String @id @default(cuid())
  mealId String
  meal   Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)
  tagId  String
  tag    Tag    @relation(fields: [tagId], references: [id])
  @@unique([mealId, tagId])
}

model Persona {
  id           String    @id @default(cuid())
  challengeId  String    @unique
  challenge    Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  title        String
  description  String
  statsJson    Json
  aiInsight    String?
  cardImageUrl String?
  createdAt    DateTime  @default(now())
}
```

4. **Run Migration**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Seed Tags** (`prisma/seed.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const tags = [
  { name: 'ทอด', slug: 'fried', category: 'COOKING_METHOD', emoji: '🍳', color: 'bg-yellow-500' },
  { name: 'ผัก', slug: 'vegetable', category: 'FOOD_GROUP', emoji: '🥬', color: 'bg-green-500' },
  // ... เพิ่มเติมตาม app_idea.md
];

async function main() {
  for (const tag of tags) {
    await prisma.tag.create({ data: tag });
  }
}

main();
```

Run: `npx prisma db seed`

6. **Prisma Client** (`lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Checklist:**
- [ ] Railway PostgreSQL running
- [ ] Prisma schema created
- [ ] Migration successful
- [ ] Tags seeded
- [ ] Can query database

---

## Phase 4: Authentication 🔐

**เป้าหมาย:** Clerk Login/Logout  
**เวลา:** 2-3 ชั่วโมง

### Tasks

1. **Setup Clerk**
   - Sign up: https://clerk.com
   - Create Application
   - Enable Google, Facebook OAuth
   - Copy API keys

2. **Install Clerk**
```bash
npm install @clerk/nextjs
```

3. **Wrap App** (`app/layout.tsx`)
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="th">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

4. **Auth Pages**
- `/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

5. **Protect Routes** (`middleware.ts`)
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) auth().protect();
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)','/(api|trpc)(.*)'],
};
```

6. **Sync User Webhook** (`/app/api/webhooks/clerk/route.ts`)

**Checklist:**
- [ ] Clerk configured
- [ ] Can sign in/up
- [ ] Protected routes working
- [ ] User synced to database

---

## Phase 5: File Storage 📸

**เป้าหมาย:** Upload รูปไปที่ Vercel Blob  
**เวลา:** 1-2 ชั่วโมง

### Tasks

1. **Setup Vercel Blob**
   - Vercel Dashboard → Storage → Create Blob
   - Copy `BLOB_READ_WRITE_TOKEN`

2. **Install Package**
```bash
npm install @vercel/blob
```

3. **Upload Server Action** (`lib/actions/upload.ts`)
```typescript
'use server';
import { put } from '@vercel/blob';

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;
  if (!file) throw new Error('No file');
  const blob = await put(file.name, file, { access: 'public' });
  return blob.url;
}
```

4. **Update Camera Component** - ใช้ Server Action

**Checklist:**
- [ ] Vercel Blob configured
- [ ] Can upload images
- [ ] Image URLs returned

---

## Phase 6: Core Logic 🧠

**เป้าหมาย:** ระบบคำนวณฉายา  
**เวลา:** 2-3 ชั่วโมง

### Tasks

1. **Challenge Actions** (`lib/actions/challenge.ts`)
```typescript
'use server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function startChallenge() {
  const { userId } = auth();
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  return await prisma.challenge.create({
    data: {
      userId: user!.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function saveMeal(challengeId: string, imageUrl: string, tagIds: string[], dayNumber: number) {
  return await prisma.meal.create({
    data: {
      challengeId, imageUrl, dayNumber, mealTime: new Date(),
      tags: { create: tagIds.map(tagId => ({ tagId })) },
    },
  });
}
```

2. **Persona Engine** (`lib/persona-engine.ts`)
```typescript
import { prisma } from './prisma';

export async function calculatePersona(challengeId: string) {
  // 1. Get meals + tags
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { meals: { include: { tags: { include: { tag: true } } } } },
  });

  // 2. Count tags
  const tagCounts: Record<string, number> = {};
  let totalTags = 0;
  challenge!.meals.forEach(meal => {
    meal.tags.forEach(({ tag }) => {
      tagCounts[tag.slug] = (tagCounts[tag.slug] || 0) + 1;
      totalTags++;
    });
  });

  // 3. Calculate %
  const stats: Record<string, number> = {};
  Object.entries(tagCounts).forEach(([slug, count]) => {
    stats[slug] = Math.round((count / totalTags) * 100);
  });

  // 4. Determine Persona (ตาม Persona Rules ใน app_idea.md)
  const persona = determinePersona(stats);

  // 5. Save
  return await prisma.persona.create({
    data: {
      challengeId,
      title: persona.title,
      description: persona.description,
      statsJson: stats,
    },
  });
}

function determinePersona(stats: Record<string, number>) {
  if (stats.fried > 50) return { title: "นักรบไก่ทอด ผู้แบกโลกด้วยไขมัน", description: "..." };
  if (stats.vegetable > 50) return { title: "กระต่ายน้อยรักษ์โลก", description: "..." };
  // ... เพิ่มกฎอื่นๆ
  return { title: "พลเมืองอาหาร 5 หมู่", description: "..." };
}
```

3. **Complete Challenge**
```typescript
export async function completeChallenge(challengeId: string) {
  const persona = await calculatePersona(challengeId);
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: 'COMPLETED' },
  });
  return persona;
}
```

**Checklist:**
- [ ] Can start challenge
- [ ] Can save meals
- [ ] Persona calculated correctly
- [ ] Challenge completed

---

## Phase 7: AI Integration 🤖

**เป้าหมาย:** Gemini AI Insights  
**เวลา:** 2-3 ชั่วโมง

### Tasks

1. **Setup Gemini**
   - Get API Key: https://makersuite.google.com/app/apikey
   - Add to `.env.local`

2. **Install SDK**
```bash
npm install @google/generative-ai
```

3. **Gemini Functions** (`lib/gemini.ts`)
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generatePersonaInsight(title: string, stats: Record<string, number>) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `
    คุณเป็น AI นักวิเคราะห์อาหารที่มีอารมณ์ขัน
    User ได้รับฉายา: "${title}"
    สถิติ: ${JSON.stringify(stats)}
    เขียนบทวิเคราะห์ตลกๆ 100-150 คำ
  `;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateDailyChallenge() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = 'สร้างภารกิจกินอาหารตลกๆ 1-2 ประโยค';
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

4. **Update Persona Engine** - เพิ่ม AI Insight
5. **Add Daily Challenge** to Dashboard

**Checklist:**
- [ ] Gemini API working
- [ ] AI Insight generated
- [ ] Daily Challenge generated

---

## Phase 8: Profile & History 📜

**เป้าหมาย:** Complete Profile Page  
**เวลา:** 2-3 ชั่วโมง

### Tasks

1. **Challenge History Component**
```typescript
async function getChallengeHistory(userId: string) {
  return await prisma.challenge.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { persona: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

2. **Persona Collection**
```typescript
async function getPersonaCollection(userId: string) {
  return await prisma.persona.findMany({
    where: { challenge: { userId, status: 'COMPLETED' } },
  });
}
```

3. **Overall Stats**
```typescript
async function getOverallStats(userId: string) {
  // Aggregate stats from all completed challenges
}
```

**Checklist:**
- [ ] History displayed
- [ ] Collection gallery working
- [ ] Overall stats calculated

---

## Bonus: PWA Setup 📱

**เป้าหมาย:** Progressive Web App  
**เวลา:** 1-2 ชั่วโมง

### Tasks

1. **Install PWA**
```bash
npm install @ducanh2912/next-pwa
```

2. **Config** (`next.config.js`)
```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
});
module.exports = withPWA({});
```

3. **Create manifest.json** (ใช้โค้ดจาก app_idea.md)
4. **Generate Icons** (72x72 → 512x512)

**Checklist:**
- [ ] manifest.json created
- [ ] Icons generated
- [ ] App installable

---

## 🚀 Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add Environment Variables
4. Deploy

**URL:** `eat-dentity.vercel.app`

---

## 📊 Timeline Summary

| Phase | งาน | เวลา |
|-------|-----|------|
| 1 | Foundation | 1-2 ชม. |
| 2 | UI | 3-4 วัน |
| 3 | Database | 2-3 ชม. |
| 4 | Auth | 2-3 ชม. |
| 5 | Storage | 1-2 ชม. |
| 6 | Logic | 2-3 ชม. |
| 7 | AI | 2-3 ชม. |
| 8 | Profile | 2-3 ชม. |
| Bonus | PWA | 1-2 ชม. |

**รวม:** 2-3 สัปดาห์

---

## ✅ Master Checklist

### Phase 1: Foundation
- [x] Next.js initialized
- [x] Tailwind configured
- [x] shadcn/ui installed
- [x] Folder structure

### Phase 2: UI
- [x] Landing Page
- [x] Dashboard
- [x] Capture Page
- [x] Result Page
- [x] Profile Page

### Phase 3: Database
- [x] Railway setup
- [x] Prisma schema
- [x] Migration done
- [x] Tags seeded

### Phase 4: Auth
- [x] Clerk configured
- [x] Sign in/up working
- [x] Routes protected
- [x] User synced

### Phase 5: Storage
- [x] Vercel Blob setup
- [x] Upload working
- [x] Images saved

### Phase 6: Logic
- [x] Start challenge
- [x] Save meals
- [x] Calculate persona
- [x] Complete challenge

### Phase 7: AI
- [x] Gemini setup
- [x] AI Insights
- [x] Daily Challenge

### Phase 8: Profile
- [x] History
- [x] Collection
- [x] Overall Stats
- [x] Navigation Header
- [x] Active Route Indication
- [x] Mobile Responsive Menu

### Bonus: PWA
- [x] Manifest
- [x] Icons
- [x] Installable

### Deploy
- [x] GitHub
- [x] Vercel (Auto-deploy from GitHub)
- [x] Live URL (Check Vercel Dashboard)

---

**สร้างโดย:** เฉียบ (AI Assistant)  
**สำหรับ:** พี่สุ (Project Manager)  
**วันที่:** 31 ตุลาคม 2025

---

## Phase 9: Admin System 🔐

**Status:** ✅ **COMPLETED** (100% เสร็จ)

### Overview
ระบบ Admin สำหรับจัดการข้อมูลทั้งหมดของแอป แยกออกจาก User System เพื่อความปลอดภัย

### Features

#### 9.1 Database Schema ✅ **COMPLETED**
- [x] สร้าง Admin model (แยกจาก User)
- [x] สร้าง AdminSession model (JWT/Session)
- [x] สร้าง AdminActivity model (Audit Trail)
- [x] Migration & Update Prisma Schema

#### 9.2 Authentication ✅ **COMPLETED**
- [x] Admin Login System (Password-based, ไม่ใช้ Clerk)
- [x] Password Hashing (bcrypt)
- [x] Session Management (JWT/Database-based)
- [x] Middleware สำหรับ Admin Routes
- [x] Admin Logout
- [x] Rate Limiting (5 attempts / 15 min)
- [x] Input Validation (Zod)
- [x] Generic Error Messages

#### 9.3 Admin Dashboard 🟡 **IN PROGRESS** (75% เสร็จ)
- [x] Dashboard Layout (Sidebar Navigation) - Shadcn Sidebar
- [x] Overview Stats (Users, Challenges, Meals, Personas)
- [ ] Recent Activity Feed
- [x] Quick Actions

#### 9.4 User Management 🟡 **IN PROGRESS** (60% เสร็จ)
- [x] User List (Table with Pagination)
- [x] Search & Filter Users
- [x] View User Details
- [ ] Edit User Info
- [ ] Delete User (Soft/Hard Delete)
- [x] View User's Challenges/Meals/Personas

#### 9.5 Challenge Management ✅ **COMPLETED**
- [x] Challenge List (Table)
- [x] Filter by Status, Date Range
- [x] View Challenge Details
- [x] Edit Challenge (Status, Dates)
- [x] Delete Challenge
- [x] View Challenge Meals

#### 9.6 Meal Management ✅ **COMPLETED**
- [x] Meal List (Grid/Table View)
- [x] Filter by Challenge, User, Date
- [x] View Meal Details (Image + Tags) - Dialog Modal
- [x] Edit Meal (Time, Day, Tags)
- [x] Delete Meal
- [x] Bulk Delete

#### 9.7 Persona Management ✅ **COMPLETED**
- [x] Persona List (Table View)
- [x] View Persona Details
- [x] Edit Persona (Title, Description, Stats)
- [x] Regenerate AI Insight
- [x] Delete Persona

#### 9.8 Tag Management ✅ **COMPLETED**
- [x] Tag List (Table View)
- [x] Create Tag
- [x] Edit Tag
- [x] Delete Tag (Check Usage) - Prevents deletion if tag is used
- [ ] Merge Tags (Future enhancement)
- [x] View Tag Usage - Shows usage count in table and edit page

#### 9.9 Activity Log ✅ **COMPLETED**
- [x] Activity List (All Admin Actions) - Table View
- [x] Filter by Admin, Entity Type, Action, Date
- [x] View Activity Details - Dialog Modal
- [x] Export Activity Log - CSV Export

#### 9.10 Security & Audit ✅ **COMPLETED** (90% เสร็จ)
- [x] Audit Trail (Log all actions) - `logAdminActivity()`
- [x] IP Tracking - Logged in login activity
- [x] Session Timeout - 24 hours expiration
- [ ] CSRF Protection (มี SameSite cookie แล้ว แต่ควรเพิ่ม CSRF token - Optional enhancement)
- [x] All admins have full access (no role restrictions)
- [x] Rate Limiting on Login (5 attempts / 15 min)
- [x] Input Validation (Zod)
- [x] Secure Cookie Settings (httpOnly, secure, sameSite)
- [x] Auto Session Cleanup

### Tech Stack
- **Authentication:** NextAuth.js หรือ Custom JWT
- **Password Hashing:** bcrypt
- **Session:** JWT หรือ Database Sessions
- **UI:** shadcn/ui components
- **Tables:** TanStack Table (React Table)

### Estimated Time
- Phase 9.1-9.2: 4-6 hours (Auth + Schema)
- Phase 9.3-9.5: 6-8 hours (Dashboard + Users + Challenges)
- Phase 9.6-9.8: 6-8 hours (Meals + Personas + Tags)
- Phase 9.9-9.10: 4-6 hours (Activity Log + Security)

**Total: 20-28 hours**

### Documentation
- [Admin System Design](./admin-system-design.md)

---

## 🎉 Next Steps After MVP

1. **Admin System** - Phase 9 (จัดการข้อมูลทั้งหมด)
2. **User Testing** - รับ Feedback
3. **Monetization** - ระบบ Premium
4. **Marketing** - โพสต์โซเชียล
5. **Expansion** - Image Recognition, Partnership

