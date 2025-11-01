# 🔐 Admin System Design

## 📋 Overview

ระบบ Admin แยกออกจาก User System โดยสิ้นเชิง เพื่อความปลอดภัยและการจัดการข้อมูลที่มีประสิทธิภาพ

---

## 🗄️ Database Schema

### 1. Admin Model (แยกจาก User)

```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  role      AdminRole @default(ADMIN)
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admins")
}

enum AdminRole {
  SUPER_ADMIN  // Full access, can manage other admins
  ADMIN       // Standard admin access
  MODERATOR   // Limited access (future: content moderation only)

  @@map("admin_role")
}
```

### 2. Admin Session (สำหรับ JWT/Session Management)

```prisma
model AdminSession {
  id        String   @id @default(cuid())
  adminId   String
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("admin_sessions")
}
```

### 3. Admin Activity Log (Audit Trail)

```prisma
model AdminActivity {
  id          String   @id @default(cuid())
  adminId     String
  admin       Admin    @relation(fields: [adminId], references: [id])
  action      String   // CREATE, UPDATE, DELETE, VIEW, EXPORT
  entityType  String   // User, Challenge, Meal, Persona, Tag
  entityId    String?
  details     Json?    // Additional data (before/after changes)
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@map("admin_activities")
  @@index([adminId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## 🔐 Authentication System

### Strategy: Password-based (แยกจาก Clerk)

**ไม่ใช้ Clerk สำหรับ Admin** เพราะ:
- Admin เป็น internal team
- ต้องการ control มากขึ้น
- ลด dependency

**Implementation:**
- NextAuth.js หรือ Custom JWT
- bcrypt สำหรับ password hashing
- Session-based หรือ JWT token

---

## 🎯 Admin Features

### 1. Dashboard Overview
```
┌─────────────────────────────────────────────────┐
│ 📊 Admin Dashboard                              │
├─────────────────────────────────────────────────┤
│ • Total Users: 1,234                            │
│ • Active Challenges: 456                         │
│ • Total Meals: 8,901                            │
│ • Generated Personas: 234                        │
│ • Today's New Users: 12                         │
│ • Today's New Meals: 89                          │
└─────────────────────────────────────────────────┘
```

**Features:**
- Statistics cards (users, challenges, meals, personas)
- Recent activity feed
- System health status
- Quick actions

---

### 2. User Management

**View List:**
- Table view: ID, Name, Email, Total Challenges, Status, Created At
- Pagination
- Search/Filter: Email, Name, Date range
- Sort: Created date, Total challenges

**Actions:**
- ✅ View user details (full profile)
- ✅ View user's challenges
- ✅ View user's meals
- ✅ View user's personas
- ✅ Edit user info (name, email, imageUrl)
- ✅ Delete user (soft delete หรือ hard delete?)
- ✅ Suspend/Activate user
- ✅ Reset user data (optional)

**Details Page:**
```
User: john@example.com
├─ Profile Info
├─ Challenges (5)
│  ├─ Challenge #1 (Active)
│  ├─ Challenge #2 (Completed)
│  └─ ...
├─ Meals (35 total)
└─ Personas (2)
```

---

### 3. Challenge Management

**View List:**
- Table: ID, User, Start Date, End Date, Status, Meals Count, Created At
- Filter: Status (ACTIVE/COMPLETED/ABANDONED), Date range
- Search: User email/name

**Actions:**
- ✅ View challenge details (full data)
- ✅ View challenge meals (images + tags)
- ✅ Edit challenge: status, dates
- ✅ Delete challenge (cascade delete meals)
- ✅ Force complete challenge
- ✅ View persona (if exists)

**Details Page:**
```
Challenge: ch_abc123
├─ User: john@example.com
├─ Period: 2024-01-01 to 2024-01-07
├─ Status: COMPLETED
├─ Meals (14)
│  ├─ Day 1: 2 meals
│  ├─ Day 2: 1 meal
│  └─ ...
└─ Persona: "The Flavor Explorer"
```

---

### 4. Meal Management

**View List:**
- Grid view (images) หรือ Table view
- Table: ID, Challenge, User, Meal Time, Day Number, Tags Count, Created At
- Filter: Challenge, User, Date range, Tags
- Search: User email, Challenge ID

**Actions:**
- ✅ View meal details (full image + tags)
- ✅ Edit meal: mealTime, dayNumber, notes
- ✅ Add/Remove tags
- ✅ Delete meal
- ✅ Bulk delete (select multiple)

**Details Page:**
```
Meal: m_xyz789
├─ Image: [full size]
├─ Challenge: ch_abc123
├─ User: john@example.com
├─ Time: 2024-01-01 12:30:00
├─ Day: 1
├─ Tags (3):
│  ├─ 🍜 Noodles (FOOD_GROUP)
│  ├─ 🍛 Fried (COOKING_METHOD)
│  └─ 🌶️ Spicy (TASTE)
└─ Notes: "Lunch at restaurant"
```

---

### 5. Persona Management

**View List:**
- Card grid view หรือ Table view
- Table: ID, Challenge, User, Title, Created At
- Filter: User, Date range
- Search: User email, Title

**Actions:**
- ✅ View persona details (full card + stats)
- ✅ View AI insight
- ✅ Edit persona: title, description, statsJson
- ✅ Regenerate AI insight
- ✅ Delete persona

**Details Page:**
```
Persona: p_def456
├─ Challenge: ch_abc123
├─ User: john@example.com
├─ Title: "The Flavor Explorer"
├─ Description: "You love exploring..."
├─ Stats:
│  ├─ noodles: 25%
│  ├─ fried: 30%
│  └─ ...
└─ AI Insight: "Based on your meals..."
```

---

### 6. Tag Management

**View List:**
- Table: Name, Slug, Category, Emoji, Color, Usage Count
- Filter: Category
- Sort: Usage count, Name

**Actions:**
- ✅ View tag details
- ✅ Create new tag
- ✅ Edit tag: name, slug, category, emoji, color
- ✅ Delete tag (check if used in meals)
- ✅ View meals using this tag
- ✅ Merge tags (combine two tags into one)

**Details Page:**
```
Tag: noodles
├─ Name: Noodles
├─ Slug: noodles
├─ Category: FOOD_GROUP
├─ Emoji: 🍜
├─ Color: #f97316
├─ Used in: 234 meals
└─ Meals: [list of meals]
```

---

### 7. System Settings (Future)

- **AI Settings**: Gemini API configuration
- **Storage Settings**: Vercel Blob configuration
- **Feature Flags**: Enable/disable features
- **Notification Settings**: Email templates

---

## 🔒 Security Features

### 1. Authentication
- ✅ Password hashing (bcrypt)
- ✅ Session management (JWT หรือ database sessions)
- ✅ CSRF protection
- ✅ Rate limiting สำหรับ login

### 2. Authorization
- ✅ Role-based access (SUPER_ADMIN, ADMIN, MODERATOR)
- ✅ Route protection (middleware)
- ✅ API route protection

### 3. Audit Trail
- ✅ Log ทุก action (AdminActivity model)
- ✅ Track: Who, What, When, IP, User Agent
- ✅ View activity history per admin
- ✅ View activity history per entity

### 4. Data Protection
- ✅ Sensitive data masking (passwords, tokens)
- ✅ Safe deletion (soft delete where appropriate)
- ✅ Backup before bulk operations

---

## 🛣️ Routes Structure

```
/admin
├─ /login                    # Admin login page
├─ /dashboard                # Admin dashboard
├─ /users
│  ├─ /                      # User list
│  └─ /[id]                  # User details
├─ /challenges
│  ├─ /                      # Challenge list
│  └─ /[id]                  # Challenge details
├─ /meals
│  ├─ /                      # Meal list
│  └─ /[id]                  # Meal details
├─ /personas
│  ├─ /                      # Persona list
│  └─ /[id]                  # Persona details
├─ /tags
│  ├─ /                      # Tag list
│  ├─ /[id]                  # Tag details
│  └─ /create                # Create tag
├─ /activities               # Activity log
├─ /settings                 # System settings (future)
└─ /profile                  # Admin profile
```

---

## 🎨 UI/UX Considerations

### Design Principles:
1. **Clean & Professional**: เน้นข้อมูลชัดเจน
2. **Fast Loading**: Tables ต้องเร็ว (pagination, lazy load)
3. **Responsive**: ใช้ได้บน mobile (สำหรับ urgent fixes)
4. **Search & Filter**: หาข้อมูลได้ง่าย
5. **Bulk Actions**: จัดการหลายรายการพร้อมกัน

### Components Needed:
- AdminLayout (with sidebar navigation)
- DataTable (reusable, with pagination, search, filter, sort)
- UserCard, ChallengeCard, MealCard, PersonaCard
- EditModal (for inline editing)
- DeleteConfirmDialog
- ActivityLogViewer
- StatsCards

---

## 📊 Data Export Features

- Export users to CSV
- Export challenges to CSV
- Export meals to CSV (with image URLs)
- Export analytics report (PDF)

---

## 🔄 Future Enhancements

1. **Content Moderation**: 
   - Flag inappropriate meals
   - Auto-moderation (AI-based)
   - Review queue

2. **Analytics Dashboard**:
   - User growth charts
   - Popular tags trends
   - Engagement metrics

3. **Bulk Operations**:
   - Bulk user actions
   - Bulk challenge updates
   - Bulk tag updates

4. **Notification System**:
   - Email admin on critical events
   - In-app notifications

5. **API Management**:
   - Admin API keys
   - API usage statistics

---

## 🚀 Implementation Phases

### Phase 1: Foundation
- [ ] Database schema (Admin, AdminSession, AdminActivity)
- [ ] Admin authentication system
- [ ] Admin login page
- [ ] Admin dashboard layout
- [ ] Middleware for admin routes

### Phase 2: Core Management
- [ ] User Management (view, edit, delete)
- [ ] Challenge Management (view, edit, delete)
- [ ] Meal Management (view, edit, delete)
- [ ] Basic Activity Log

### Phase 3: Advanced Features
- [ ] Persona Management
- [ ] Tag Management
- [ ] Search & Filter improvements
- [ ] Bulk operations

### Phase 4: Polish & Security
- [ ] Activity Log UI
- [ ] Export features
- [ ] Security audit
- [ ] Performance optimization

---

## 📝 Notes

- **Admin Email**: ใช้ email แทน username (เหมือน user system)
- **Password Policy**: Minimum 8 characters, require complexity
- **Session Timeout**: 24 hours หรือ customizable
- **IP Whitelist**: Optional feature for extra security
- **Backup**: Admin actions ที่สำคัญควรมี backup

---

## 🔗 Related Files

- `prisma/schema.prisma` - Database schema
- `app/admin/` - Admin routes (to be created)
- `lib/admin/` - Admin utilities (to be created)
- `components/admin/` - Admin components (to be created)

