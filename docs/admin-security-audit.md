# 🔒 Admin System Security Audit

## 📋 Security Review Summary

**Date:** 1 พฤศจิกายน 2024  
**Status:** ⚠️ มีจุดที่ต้องปรับปรุง

---

## ✅ สิ่งที่ทำดีแล้ว

### 1. **Password Security**
- ✅ ใช้ bcrypt สำหรับ password hashing
- ✅ Password ถูก hash ก่อนเก็บใน database

### 2. **Session Management**
- ✅ Session token เก็บใน database (ไม่ใช่ JWT stateless)
- ✅ Session expiration (24 hours)
- ✅ Session cleanup function มีอยู่
- ✅ HttpOnly cookies (ป้องกัน XSS)
- ✅ Secure flag ใน production

### 3. **Route Protection**
- ✅ แต่ละ admin page ตรวจสอบ session
- ✅ API routes ตรวจสอบ session (`/api/admin/me`, `/api/admin/logout`)
- ✅ Middleware แยก admin routes ออกจาก Clerk

### 4. **Activity Logging**
- ✅ Log admin activities (login, actions)
- ✅ Track IP address และ User Agent

---

## ⚠️ ปัญหาความปลอดภัยที่พบ

### 🔴 Critical Issues

#### 1. **ไม่มี Rate Limiting บน Login Endpoint**
**Risk:** Brute Force Attack  
**Impact:** ผู้โจมตีสามารถพยายาม login หลายครั้งจนเดารหัสผ่านได้

**Current Code:**
```typescript
// app/api/admin/login/route.ts
export async function POST(req: NextRequest) {
  // No rate limiting!
  const { email, password } = await req.json();
  // ...
}
```

**Recommendation:** เพิ่ม rate limiting
- จำกัด 5 attempts ต่อ 15 นาที ต่อ IP
- ใช้ library เช่น `@upstash/ratelimit` หรือ Redis

---

#### 2. **Login Error Message ให้ข้อมูลมากเกินไป**
**Risk:** User Enumeration Attack  
**Impact:** ผู้โจมตีรู้ว่า email อยู่ในระบบหรือไม่

**Current Code:**
```typescript
if (!result.success || !result.admin) {
  return NextResponse.json(
    { error: 'Invalid email or password' }, // ควร generic กว่านี้
    { status: 401 }
  );
}
```

**Recommendation:** ใช้ generic error message
```typescript
{ error: 'Invalid credentials' } // ไม่บอกว่า email หรือ password ผิด
```

---

### 🟡 Medium Issues

#### 3. **ไม่มี Input Validation สำหรับ Email**
**Risk:** Invalid Data, Potential Injection  
**Impact:** รับค่า email ที่ไม่ถูกต้อง

**Current Code:**
```typescript
const { email, password } = await req.json();
// No validation!
```

**Recommendation:** เพิ่ม email validation
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

---

#### 4. **Session Token Exposure ใน Response**
**Risk:** Information Disclosure  
**Impact:** ข้อมูล admin ถูกส่งกลับ (ไม่จำเป็น)

**Current Code:**
```typescript
return NextResponse.json({
  success: true,
  admin: { id, email, name }, // ไม่จำเป็นต้องส่งกลับ
});
```

**Recommendation:** ส่งแค่ success
```typescript
return NextResponse.json({ success: true });
```

---

#### 5. **Layout Protection ไม่อ่อนแอ แต่ไม่ Redirect**
**Risk:** Minor UX Issue  
**Impact:** ถ้าไม่มี session token, layout จะแสดง children โดยตรง (แต่แต่ละ page จะ redirect เอง)

**Current Code:**
```typescript
if (!sessionToken) {
  return <>{children}</>; // ไม่ redirect
}
```

**Status:** ✅ ปลอดภัย เพราะแต่ละ page check เอง แต่ควรปรับปรุง UX

---

#### 6. **ไม่มี CSRF Protection**
**Risk:** CSRF Attack  
**Impact:** ผู้โจมตีสามารถบังคับให้ admin ทำ action ได้

**Recommendation:** 
- ใช้ SameSite cookie (มีแล้ว 'lax')
- เพิ่ม CSRF token สำหรับ sensitive operations (POST/PUT/DELETE)

---

#### 7. **ไม่มี Password Policy Enforcement**
**Risk:** Weak Passwords  
**Impact:** Password ง่ายเกินไป

**Current Code:**
```typescript
// ไม่มีการ validate password strength
```

**Recommendation:** 
- Minimum 8 characters
- Require complexity (uppercase, lowercase, numbers)
- หรือใช้ library เช่น `zxcvbn`

---

#### 8. **Session Cleanup ไม่ถูกเรียกอัตโนมัติ**
**Risk:** Database Bloat  
**Impact:** Expired sessions สะสมใน database

**Current Code:**
```typescript
// มี function cleanupExpiredSessions() แต่ไม่เห็นถูกเรียก
```

**Recommendation:** 
- เรียก cleanup ใน cron job หรือ
- เรียก cleanup เมื่อ verify session (ถ้าเจอ expired)

---

### 🟢 Low Priority Issues

#### 9. **Error Logging อาจละเอียดเกินไป**
**Risk:** Information Disclosure ใน Logs  
**Impact:** Error logs อาจมี sensitive data

**Recommendation:** 
- Mask sensitive data ใน logs
- ไม่ log passwords หรือ tokens

---

#### 10. **ไม่มี Session Refresh Mechanism**
**Risk:** Session Hijacking  
**Impact:** ถ้า session token ถูกขโมย จะใช้ได้จนกว่า expire

**Recommendation:** 
- Rotate session token เป็นระยะ
- Track device/IP และ alert ถ้ามีการเปลี่ยน

---

## 🛡️ Recommended Security Improvements

### Priority 1: Critical

1. **Rate Limiting**
   ```typescript
   // app/api/admin/login/route.ts
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, '15 m'),
   });

   const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
   const { success } = await ratelimit.limit(ip);
   if (!success) {
     return NextResponse.json(
       { error: 'Too many attempts. Please try again later.' },
       { status: 429 }
     );
   }
   ```

2. **Generic Error Messages**
   ```typescript
   // ใช้ error เดียวกันสำหรับทุกกรณี
   return NextResponse.json(
     { error: 'Invalid credentials' },
     { status: 401 }
   );
   ```

3. **Input Validation**
   ```typescript
   import { z } from 'zod';

   const loginSchema = z.object({
     email: z.string().email('Invalid email format'),
     password: z.string().min(1, 'Password is required'),
   });

   const validated = loginSchema.safeParse(await req.json());
   if (!validated.success) {
     return NextResponse.json(
       { error: 'Invalid input' },
       { status: 400 }
     );
   }
   ```

---

### Priority 2: Medium

4. **CSRF Protection**
   - เพิ่ม CSRF token สำหรับ POST/PUT/DELETE requests
   - ใช้ library เช่น `csrf` หรือ Next.js built-in CSRF

5. **Password Policy**
   ```typescript
   const passwordSchema = z
     .string()
     .min(8, 'Password must be at least 8 characters')
     .regex(/[A-Z]/, 'Password must contain uppercase letter')
     .regex(/[a-z]/, 'Password must contain lowercase letter')
     .regex(/[0-9]/, 'Password must contain number');
   ```

6. **Auto Session Cleanup**
   ```typescript
   // ใน verifyAdminSession()
   if (session.expiresAt < new Date()) {
     await prisma.adminSession.delete({ where: { id: session.id } });
     // Also cleanup other expired sessions
     await cleanupExpiredSessions();
     return { valid: false };
   }
   ```

---

### Priority 3: Nice to Have

7. **Session Rotation**
   - Refresh session token หลังใช้งาน 24 ชั่วโมง

8. **Device/IP Tracking**
   - บันทึก device และ IP ใน session
   - Alert เมื่อมีการเปลี่ยนแปลง

9. **2FA (Two-Factor Authentication)**
   - เพิ่ม 2FA สำหรับ admin accounts

---

## 📊 Security Checklist

### Authentication & Authorization
- [x] Password hashing (bcrypt)
- [x] Session management
- [x] Route protection (page level)
- [x] API route protection
- [ ] Rate limiting ❌
- [ ] CSRF protection ❌
- [ ] Password policy ❌

### Session Security
- [x] HttpOnly cookies
- [x] Secure flag (production)
- [x] SameSite cookie
- [x] Session expiration
- [ ] Session rotation ❌
- [ ] Device/IP tracking ❌
- [ ] Auto cleanup ✅ (มี function แต่ไม่ auto)

### Input Validation
- [ ] Email validation ❌
- [ ] Password validation ❌
- [ ] SQL injection prevention ✅ (Prisma)

### Error Handling
- [ ] Generic error messages ❌
- [ ] Error logging (masked) ⚠️

### Audit & Monitoring
- [x] Activity logging
- [x] IP tracking
- [ ] Failed login alerts ❌
- [ ] Suspicious activity detection ❌

---

## 🚀 Implementation Plan

### Phase 1: Critical Fixes (ทำทันที)
1. Rate limiting บน login endpoint
2. Generic error messages
3. Input validation (email format)

### Phase 2: Medium Priority (ทำเร็วๆ)
4. CSRF protection
5. Password policy
6. Auto session cleanup

### Phase 3: Enhancements (ทำเมื่อมีเวลา)
7. Session rotation
8. Device/IP tracking
9. 2FA

---

## 📝 Notes

- **Current Security Level:** 6/10
- **After Critical Fixes:** 8/10
- **After All Improvements:** 9/10

**Status:** ปลอดภัยพอสำหรับ internal use แต่ควรปรับปรุงก่อน production launch

