# ตารางงานคณะสุโขทัย — Vercel

เวอร์ชัน Next.js ของเว็บไซต์เดิม: ดูงานตามผู้รับผิดชอบ ปฏิทิน เพิ่ม/แก้ไขงาน แนบไฟล์ Google Drive และรับ snapshot สดจาก Google Sheets

## สถานะ
เตรียมโค้ดสำหรับ Vercel แล้ว แต่ยังไม่ได้เชื่อมบัญชีบริการและทดสอบ deployment จริง ไม่มีข้อมูลชีตหรือรหัสลับฝังใน repository

## ตั้งค่า Vercel
1. Import repository นี้ เลือก branch ที่มีเวอร์ชัน Next.js และ Framework Next.js ใช้ Node 22 และคำสั่ง build npm run build
2. ตั้ง Environment Variables ตาม .env.example บน Vercel (ห้ามใส่รหัสลับลง GitHub หรือ NEXT_PUBLIC_*)
3. SHEETS_BRIDGE_URL ใช้ Apps Script web app URL ที่ลงท้าย /exec และ SHEETS_BRIDGE_KEY ใช้ค่า BRIDGE_KEY ใน Script Properties ของโครงการเดิม
4. EDITOR_EMAILS ใส่อีเมล Google ที่แก้ไขงานได้ คั่นด้วยจุลภาค ช่องว่างหมายถึงไม่มีผู้แก้ไข
5. สร้าง Google OAuth web client สำหรับการเข้าสู่ระบบ ตั้ง callback เป็น https://ชื่อเว็บ.vercel.app/api/auth/callback/google และใส่ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET พร้อม NEXTAUTH_URL เป็น URL จริงของเว็บ กำหนด NEXTAUTH_SECRET เป็นค่าสุ่มที่ยาวอย่างน้อย 32 bytes
6. เชื่อม Upstash Redis ผ่าน Vercel Marketplace หรือบัญชีที่มีอยู่ แล้วใส่ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN ค่านี้เก็บ snapshot และไฟล์ระหว่างอัปโหลดชั่วคราว ระบบ long polling มีค่าใช้บริการตามจำนวนคำสั่งและเวลาใช้งาน จึงควรตรวจโควตาของแพ็กเกจ ใช้ CACHE_NAMESPACE ต่างกันระหว่าง preview กับ production
7. Redeploy แล้วเปิด /manage เพื่อลงชื่อเข้าใช้ Google ระบบอนุญาตเฉพาะอีเมลที่ Google ยืนยันและอยู่ในรายชื่อ

## ย้ายสัญญาณอัปเดตจาก Google Sheets
หลังตรวจเว็บใหม่สำเร็จ จึงปรับ Script Properties: SYNC_WEBHOOK_URL = https://ชื่อเว็บ.vercel.app/api/sync/hook ใช้ integration/Code.gs เวอร์ชันนี้เพื่อไม่ให้ setupLiveUpdates เปลี่ยน URL กลับโฮสต์เก่า อนุญาตสิทธิ์ external_request แล้วรัน setupLiveUpdates ตรวจว่ามี onTaskSheetEdit และ onTaskSheetChange อย่างละหนึ่งรายการ
การเปลี่ยน webhook จะย้ายสัญญาณสดไปเว็บใหม่ เว็บเก่ายังอ่านข้อมูลแบบสำรองได้ อย่าเปลี่ยนก่อนเว็บใหม่พร้อม

## ไฟล์แนบ
รองรับไฟล์ 10 MB โดยแบ่งส่งครั้งละ 2 MB เพื่อให้แต่ละ request ต่ำกว่าขีดจำกัด Vercel ไฟล์พักใน Redis ไม่เกิน 10 นาทีแล้วส่งต่อไป Google Drive ของเจ้าของชีต ไฟล์เดิมที่เป็นลิงก์จากโฮสต์เก่ายังคงพึ่งพาโฮสต์นั้น จึงยังไม่ควรปิดเว็บเก่าจนย้ายไฟล์เหล่านั้นครบ

## ตรวจสอบก่อนใช้งานจริง
ติดตั้งด้วย npm install แล้ว npm run typecheck และ npm run build ตรวจอ่านชีต, login ที่อนุญาต/ไม่อนุญาต, เพิ่ม/แก้ไขงานและ conflict, ไฟล์เล็ก/10 MB, webhook ที่ไม่มี key ต้องได้ 401, แก้ชีตแล้วดู revision ใหม่ในเว็บ และลองกลับเข้าแท็บมือถือหลังพักหน้าจอ
เครื่องที่เตรียมโค้ดไม่มีเครือข่ายติดตั้ง Next.js จึงยังไม่ยืนยัน build ของเวอร์ชัน Vercel ต้องผ่านขั้นตอนนี้ก่อนนำขึ้น production

เอกสาร: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Google login](https://next-auth.js.org/providers/google), [Vercel limits](https://vercel.com/docs/functions/limitations), [Redis REST API](https://upstash.com/docs/redis/features/restapi)
