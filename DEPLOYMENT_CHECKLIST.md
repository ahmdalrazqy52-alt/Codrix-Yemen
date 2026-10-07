# إطلاق النسخة الرسمية

## 1) Supabase

من جذر المشروع:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy send-contact-email --no-verify-jwt
npx supabase secrets set RESEND_API_KEY=YOUR_RESEND_API_KEY
```

> لا تضع Service Role Key داخل `.env` الخاص بواجهة Vite.

## 2) Vite

أنشئ `.env` محليًا من `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

ثم:

```powershell
npm install
npm run typecheck
npm run build
```

## 3) الاستضافة

اربط المستودع في Vercel أو Netlify، واختر Vite/React، وضع متغيري البيئة نفسيهما. أمر البناء:

```text
npm run build
```

ومجلد الإخراج:

```text
dist
```

## 4) بعد النشر

- افتح `/admin`.
- أنشئ أول حساب مالك مرة واحدة.
- اختبر تعديل المحتوى.
- اختبر رفع شعار/أيقونة/إعلان.
- أنشئ مساحة إعلانية واختر موقعها ثم أضف إعلانًا بصلاحية 7 أيام.
- افتح استوديو التصميم واختبر التحديد والتراجع والحفظ.
- اختبر زر «أريد هذه الخدمة» واقتراحات نموذج التواصل.
- اختبر إرسال رسالة التواصل ووصول البريد.
- اختبر التقييمات والسجل.
- اختبر الوضع الداكن والعربي/الإنجليزي والجوال.
