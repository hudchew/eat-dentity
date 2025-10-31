# 🐛 Debug Webhook Issues

## สาเหตุที่ webhook fail และวิธีแก้ไข

### 1. ตรวจสอบ Vercel Logs

**วิธีดู Logs:**
1. ไปที่ Vercel Dashboard → Project "eat-dentity"
2. คลิก "Deployments" → เลือก deployment ล่าสุด
3. คลิก "Functions" → หา `/api/webhooks/clerk`
4. ดู logs ว่ามี error message อะไร

**Error ที่น่าจะเจอ:**
- `Error: Verification failed` → Webhook secret ไม่ตรงกัน
- `Error: Missing CLERK_WEBHOOK_SECRET` → Environment variable ไม่ตั้งค่า
- `Error: No email address` → Email array ว่าง
- Database connection error → `DATABASE_URL` ผิด

---

### 2. ตรวจสอบ Webhook Secret

**ใน Clerk Dashboard:**
1. ไปที่ Webhooks → Endpoints → "OeoiDY"
2. ดู "Signing Secret" → Copy มา

**ใน Vercel Dashboard:**
1. ไปที่ Settings → Environment Variables
2. ตรวจสอบ `CLERK_WEBHOOK_SECRET` ว่าตรงกับ Clerk Dashboard หรือไม่

**⚠️ สำคัญ:** Secret ต้องตรงกันทุกตัวอักษร!

---

### 3. ดู Failed Message Details

**ใน Clerk Dashboard:**
1. ไปที่ Webhooks → Endpoints → "OeoiDY"
2. ดู "Message Attempts" → คลิก failed message
3. ดู "Response" หรือ "Error Message" ว่าคืออะไร

---

### 4. ทดสอบ Webhook ด้วย Test Event

**วิธี:**
1. ไปที่ Clerk Dashboard → Webhooks → Endpoints → "OeoiDY"
2. คลิก tab "Testing"
3. ส่ง test event `user.created`
4. ดู Vercel logs ว่ามี request เข้ามาหรือไม่

---

### 5. ตรวจสอบว่า Deployment เสร็จแล้วหรือยัง

**วิธี:**
1. ไปที่ Vercel Dashboard → Deployments
2. ดู deployment ล่าสุดว่าเป็น "Ready" หรือยัง
3. ถ้ายังเป็น "Building" → รอให้เสร็จก่อน

---

## ✅ Checklist

- [ ] Vercel deployment เป็น "Ready"
- [ ] `CLERK_WEBHOOK_SECRET` ใน Vercel ตรงกับ Clerk Dashboard
- [ ] `DATABASE_URL` ใน Vercel ถูกต้อง
- [ ] Vercel logs ไม่มี error
- [ ] Retry failed messages ใน Clerk Dashboard

---

## 🔄 Retry Failed Messages

1. ไปที่ Clerk Dashboard → Webhooks → Endpoints → "OeoiDY"
2. คลิก "Failed" filter
3. เลือก failed messages → คลิก menu (3 dots) → "Replay"
4. เลือก "Resend all failed messages"

