import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Lang = 'ar' | 'en';

type LangContextValue = {
  lang: Lang;
  toggleLang: () => void;
  dir: 'rtl' | 'ltr';
};

const LangContext = createContext<LangContextValue | undefined>(undefined);

const t = {
  nav: {
    home: { ar: 'الرئيسية', en: 'Home' },
    services: { ar: 'خدماتنا', en: 'Services' },
    process: { ar: 'آلية العمل', en: 'Process' },
    work: { ar: 'أعمالنا', en: 'Work' },
    team: { ar: 'الفريق', en: 'Team' },
    testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
    faq: { ar: 'الأسئلة', en: 'FAQ' },
    contact: { ar: 'تواصل', en: 'Contact' },
    startProject: { ar: 'ابدأ مشروعك', en: 'Start Project' },
  },
  common: {
    viewAll: { ar: 'عرض الكل', en: 'View All' },
    loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
  },
  contact: {
    title: { ar: 'تواصل معنا', en: 'Contact Us' },
    heading: { ar: 'لنحوّل فكرتك إلى منتج حقيقي', en: 'Let\'s turn your idea into a real product' },
    description: { ar: 'أخبرنا عن مشروعك وسيتواصل معك فريقنا خلال 24 ساعة بخطة واضحة.', en: 'Tell us about your project and our team will reach out within 24 hours with a clear plan.' },
    name: { ar: 'الاسم الكامل', en: 'Full Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    message: { ar: 'تفاصيل المشروع', en: 'Project Details' },
    submit: { ar: 'إرسال الطلب', en: 'Send Message' },
    success: { ar: 'تم إرسال رسالتك بنجاح!', en: 'Your message was sent successfully!' },
    successDesc: { ar: 'سنتواصل معك في أقرب وقت ممكن.', en: 'We\'ll get back to you as soon as possible.' },
    error: { ar: 'تعذّر إرسال الرسالة', en: 'Failed to send message' },
    retry: { ar: 'المحاولة مرة أخرى', en: 'Try Again' },
    mail: { ar: 'البريد', en: 'Email' },
    phone: { ar: 'الهاتف', en: 'Phone' },
    location: { ar: 'الموقع', en: 'Location' },
    namePlaceholder: { ar: 'اكتب اسمك', en: 'Enter your name' },
    msgPlaceholder: { ar: 'أخبرنا عن فكرتك ومتطلباتك...', en: 'Tell us about your idea and requirements...' },
  },
  footer: {
    services: { ar: 'خدماتنا', en: 'Services' },
    company: { ar: 'الشركة', en: 'Company' },
    rights: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
    builtWith: { ar: 'صُمم وبُني بشغف', en: 'Designed & built with passion' },
  },
  hero: {
    achievements: { ar: 'إنجازات نفخر بها', en: 'Achievements We\'re Proud Of' },
    quickWork: { ar: 'أعمالنا', en: 'Our Work' },
    quickWorkDesc: { ar: 'شاهد مشاريعنا', en: 'See our projects' },
    quickServices: { ar: 'خدماتنا', en: 'Services' },
    quickServicesDesc: { ar: 'ماذا نقدم', en: 'What we offer' },
    quickContact: { ar: 'تواصل', en: 'Contact' },
    quickContactDesc: { ar: 'ابدأ مشروعك', en: 'Start your project' },
  },
  sections: {
    customService: { ar: 'اطلب خدمة مخصصة', en: 'Request a Custom Service' },
    contactTeam: { ar: 'تواصل مع فريقنا', en: 'Contact Our Team' },
    wantThis: { ar: 'أريد هذه الخدمة', en: 'I Want This Service' },
  },
  search: {
    placeholder: { ar: 'ابحث في الموقع...', en: 'Search the site...' },
    noResults: { ar: 'لا توجد نتائج', en: 'No results found' },
    results: { ar: 'النتائج', en: 'Results' },
    home: { ar: 'الرئيسية', en: 'Home' },
    services: { ar: 'الخدمات', en: 'Services' },
    process: { ar: 'آلية العمل', en: 'Process' },
    work: { ar: 'الأعمال', en: 'Our Work' },
    team: { ar: 'الفريق', en: 'Team' },
    testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
    faq: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
    contact: { ar: 'تواصل معنا', en: 'Contact' },
    reviews: { ar: 'التقييمات', en: 'Reviews' },
    features: { ar: 'المميزات', en: 'Features' },
    cta: { ar: 'دعوة للتواصل', en: 'Call to Action' },
  },
  reviews: {
    title: { ar: 'قيّم تجربتك', en: 'Rate Your Experience' },
    subtitle: { ar: 'رأيك يهمنا — شاركنا تقييمك وملاحظاتك', en: 'Your opinion matters — share your rating and feedback' },
    rateButton: { ar: 'تقييم', en: 'Rate' },
    name: { ar: 'الاسم', en: 'Name' },
    namePlaceholder: { ar: 'اكتب اسمك', en: 'Enter your name' },
    stars: { ar: 'اختر التقييم', en: 'Choose your rating' },
    rateOnly: { ar: 'تقييم بدون ملاحظة', en: 'Rate without note' },
    notePlaceholder: { ar: 'أضف ملاحظتك هنا...', en: 'Add your note here...' },
    confirm: { ar: 'تأكيد التقييم والملاحظة', en: 'Confirm Rating & Note' },
    thankYou: { ar: 'شكراً لك على تقييمك!', en: 'Thank you for your rating!' },
    thankYouDesc: { ar: 'نقدّر مشاركتك وآراءك القيّمة.', en: 'We appreciate your valuable feedback.' },
    close: { ar: 'إغلاق', en: 'Close' },
    avgRating: { ar: 'متوسط التقييم', en: 'Average Rating' },
    totalReviews: { ar: 'إجمالي التقييمات', en: 'Total Reviews' },
    basedOn: { ar: 'بناءً على', en: 'Based on' },
    reviewsWord: { ar: 'تقييم', en: 'reviews' },
  },
};

export type TranslationDict = typeof t;

export function tr(key: keyof TranslationDict, field: string, lang: Lang): string {
  const section = t[key];
  const entry = (section as Record<string, Record<Lang, string>>)[field];
  return entry ? entry[lang] : field;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const toggleLang = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'));

  return <LangContext.Provider value={{ lang, toggleLang, dir }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

export { t as translations };
