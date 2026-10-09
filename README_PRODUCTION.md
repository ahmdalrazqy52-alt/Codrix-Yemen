# Codrix Yemen — Production Website

نسخة مستقلة عن Bolt مبنية بـ React + Vite + TypeScript + Supabase.

## التشغيل المحلي

1. انسخ `.env.example` إلى `.env` وضع بيانات مشروع Supabase.
2. نفّذ:

```bash
npm install
npm run typecheck
npm run build
npm run preview
```

## قاعدة البيانات

ملفات `supabase/migrations` يجب تنفيذها بالترتيب على مشروع Supabase الإنتاجي. آخر migrations تضيف:

- إدارة الإعلانات وصلاحية الإعلان والمساحات المخصصة.
- محرر التصميم المرئي وقواعد المظهر.
- مختبر SQL للقراءة للمالك فقط.
- تشديد رفع الملفات.
- إعداد بريد استقبال رسائل التواصل من لوحة الإدارة.

## النشر

المشروع Vite Static ويمكن نشر مجلد `dist` على Vercel أو Netlify أو أي استضافة Static. يجب ضبط:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

كما يجب نشر Supabase Edge Function:

`supabase/functions/send-contact-email`

ووضع `RESEND_API_KEY` في أسرار Supabase، وعدم وضع Service Role Key داخل الواجهة.

## الدخول إلى لوحة الإدارة

المسار:

`/admin`

يتم إنشاء أول مالك من خيار إعداد حساب المالك مرة واحدة، ثم يُغلق التسجيل العام.
