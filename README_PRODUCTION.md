# Codrix Yemen — النسخة المستقلة للإنتاج

موقع React + Vite + TypeScript + Supabase، مستقل عن Bolt. لا يحتوي هذا الأرشيف على `.env` أو مفاتيح سرية أو `node_modules`.

## التشغيل على Windows

1. ثبّت إصدار Node.js LTS (يفضّل Node 20 أو 22).
2. فك الضغط وافتح المجلد في VS Code.
3. انسخ `.env.example` إلى `.env` وأدخل بيانات مشروع Supabase. لا تشارك ملف `.env` ولا ترفعه إلى Git:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` (الدومين الرسمي HTTPS، لتوليد sitemap والـcanonical).
4. افتح PowerShell داخل مجلد المشروع وشغّل:

```powershell
npm ci
npm run typecheck
npm run lint
npm run build
npm run preview
```

إذا فشل `npm ci` بسبب الشبكة، أعد المحاولة بعد عودة الاتصال. لا تنسخ `node_modules` من نظام تشغيل مختلف.

## ترحيلات قاعدة البيانات

يجب تطبيق كل ملفات `supabase/migrations` بالترتيب على مشروع Supabase الصحيح قبل نشر الواجهة. لا تحذف الجداول الحالية ولا تعِد إنشاء قاعدة البيانات من الصفر.

آخر الإضافات تشمل:
- مكتبة الوسائط وتحويل الصور النقطية إلى WebP في المتصفح قبل الرفع.
- محرر المظهر، الثيمات، اللون الرئيسي، وترتيب/إخفاء أقسام الموقع.
- سجل النشاطات المصنّف مع تفاصيل قبل/بعد لبعض التعديلات، وحذف السجل لمالك الموقع فقط، وتفاعل واحد لكل مدير.
- مختبر SQL ثابت أسود للمالك فقط؛ القراءة آمنة، وINSERT/UPDATE/DELETE مقيدة بفحوص إضافية وتتطلب تأكيدًا.
- تجارب A/B لعناوين وأزرار الواجهة مع قياس المشاهدات والنقرات.
- SEO عام، بيانات منظمة، حقول SEO للأقسام، robots.txt، وتوليد sitemap.
- وظائف سيرفر لاقتراح النصوص بالذكاء الاصطناعي.
- سير عمل الرسائل الحالي: كل الرسائل، الجديدة، المقروءة، الحالات، والرد بالبريد محفوظ كما هو.

### تطبيق الترحيلات باستخدام Supabase CLI

بعد تثبيت Supabase CLI وتسجيل الدخول وربط المشروع الصحيح:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

تحقق من project ref قبل `db push`. خذ نسخة احتياطية من قاعدة الإنتاج أولًا.

### وظائف Edge

انشر جميع وظائف الخادم المستخدمة:

```powershell
npx supabase functions deploy send-contact-email
npx supabase functions deploy generate-copy
npx supabase functions deploy create-admin
npx supabase functions deploy update-owner-credentials
```

اضبط الأسرار من Supabase Dashboard → Edge Functions → Secrets أو عبر CLI:

```powershell
npx supabase secrets set RESEND_API_KEY=re_your_key
npx supabase secrets set RESEND_FROM_EMAIL="Codrix Yemen <no-reply@your-verified-domain.com>"
npx supabase secrets set OPENAI_API_KEY=your_openai_key
npx supabase secrets set OPENAI_MODEL=gpt-4o-mini
```

`RESEND_FROM_EMAIL` يجب أن يستخدم نطاقاً موثقاً في Resend. تقرأ وظيفة البريد `RESEND_API_KEY` من أسرار Edge Function أولاً، وتحتفظ بالتوافق مع سجل `app_secrets` القديم عند عدم ضبط السر.

### إنشاء حساب المالك الأول

1. من Supabase Dashboard → Authentication → Providers / Signups عطّل التسجيل العام (Allow new users to sign up).
2. أنشئ حساب المالك المقصود يدوياً من Authentication → Users.
3. افتح `/admin` وسجّل الدخول بهذا الحساب. إذا كان جدول `admin_users` فارغاً، تستدعي اللوحة دالة `bootstrap_admin()` الذرّية وتمنح هذا الحساب دور المالك مرة واحدة.
4. إذا كان جدول المديرين يحتوي سجلات بالفعل، فلن تمنح الدالة مالكاً جديداً. لا تحذف سجلات الإدارة لمحاولة إعادة التهيئة.

لا تضع Service Role Key أو مفاتيح API في متغيرات `VITE_*` أو في كود الواجهة.

## النشر

المشروع Vite Static؛ انشره على Vercel أو Netlify، واجعل أمر البناء `npm run build` ومجلد النشر `dist`. أضف المتغيرات `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` في إعدادات الاستضافة. أعد بناء الموقع بعد تغيير المتغيرات.

## ملاحظات تشغيلية مهمة

- لا يمكن اختبار اتصال قاعدة الإنتاج من ملف المشروع وحده؛ اختبر الدخول والرسائل والإعلانات والصلاحيات بعد تطبيق migrations.
- لا تنسخ مجلد `node_modules` من جهاز أو نظام تشغيل آخر؛ نفّذ `npm ci` على جهازك لتثبيت الحزم المتوافقة.
- راجع `SECURITY_NOTES.md` وقائمة التحقق قبل النشر، وفعّل حدًا لمعدل طلبات نموذج التواصل أو CAPTCHA على مستوى الخدمة.
- مكتبة الوسائط تحتاج صلاحية القراءة من Storage bucket `media`، وحذف الملفات مقصور على المالك من واجهة الإدارة.
- أزرار الذكاء الاصطناعي لا تعمل قبل ضبط `OPENAI_API_KEY` ونشر Edge Function.
- اختبارات A/B تعمل بعد تطبيق migration الخاص بها. فعّل تجربة واحدة فقط لكل موضع، ثم راقب النقرات والمشاهدات.
- توليد `sitemap.xml` يتطلب `VITE_SITE_URL` حقيقيًا، وليس عنوانًا تجريبيًا.
- إعداد خلاصات Instagram/YouTube التلقائية يحتاج مفاتيح API/معرّفات القنوات الرسمية؛ لا تُضمّن هذه الأسرار في الواجهة.
- جلسة إعادة التحقق لا تسجل الخروج تلقائيًا: تظهر شاشة تطلب كلمة المرور وتعود للصفحة الحالية عند نجاح التحقق.
- تحفظ لوحة الإدارة آخر تبويب وقسم محتوى زاره المستخدم في المتصفح، وتستعيدهما بعد إعادة التحميل أو إغلاق المتصفح على الجهاز نفسه.
- معاينة استوديو التصميم ترسل اختيار العنصر عبر `postMessage`؛ يجب أن تبقى المعاينة واللوحة على النطاق نفسه.

## لوحة الإدارة

المسار `/admin`. حافظ على حساب المالك الحالي ولا تنشئ مالكًا ثانيًا إلا عند الحاجة. لا ترفع `.env` أو مفاتيح سرية إلى GitHub.
