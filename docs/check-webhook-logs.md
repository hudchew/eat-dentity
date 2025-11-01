# 🔍 วิธีตรวจสอบว่า User sync ไป Database

## วิธีที่ 1: ใช้ Script (เร็วที่สุด)

```bash
npm run db:check-users
```

## วิธีที่ 2: ใช้ Prisma Studio (GUI)

```bash
npm run db:studio
```

จะเปิด browser ที่ `http://localhost:5555` และแสดงข้อมูลทั้งหมดใน database

## วิธีที่ 3: ตรวจสอบ Webhook ใน Clerk Dashboard

1. ไปที่ Clerk Dashboard → Webhooks
2. เลือก endpoint ที่สร้างไว้
3. ดูในแท็บ "Logs" หรือ "Events"
4. เช็คว่ามี events `user.created` หรือไม่

## วิธีที่ 4: ตรวจสอบ Vercel Logs

1. ไปที่ Vercel Dashboard → Project → Deployments
2. เลือก deployment ล่าสุด → Functions
3. หา function `/api/webhooks/clerk`
4. ดู logs ว่ามี request เข้ามาหรือไม่

## วิธีที่ 5: ทดสอบ Webhook ด้วย Clerk Dashboard

1. ไปที่ Clerk Dashboard → Webhooks
2. เลือก endpoint → "Send Test Event"
3. เลือก event: `user.created`
4. ส่ง test event
5. ตรวจสอบ Vercel logs ว่ามี request เข้ามา

## ✅ วิธีที่แน่ใจที่สุด

1. Sign Up บน production (`https://eat-dentity.vercel.app`)
2. รอ 2-3 วินาที
3. รัน `npm run db:check-users` ดูว่ามี user ใหม่หรือไม่

---

## 🐛 Troubleshooting

### ถ้ายังไม่มี user ใน database:

1. **เช็ค Webhook URL:**
   - ต้องเป็น: `https://eat-dentity.vercel.app/api/webhooks/clerk`
   - ไม่ใช่ `localhost`

2. **เช็ค Environment Variables:**
   - `CLERK_WEBHOOK_SECRET` ต้องตรงกับ Clerk Dashboard

3. **เช็ค Vercel Logs:**
   - ดูว่ามี error ใน webhook handler หรือไม่

4. **เช็ค Database Connection:**
   - `DATABASE_URL` ต้องถูกต้อง

