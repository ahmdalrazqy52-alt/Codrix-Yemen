import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteSettings } from '@/context/SiteContentContext';
import { useContent } from '@/hooks/useContent';
import { useLang, translations } from '@/context/LangContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { ContactOption } from '@/content-types';

type Status = 'idle' | 'loading' | 'success' | 'error';

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <span className={className} aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.08 24l6.28-1.65a11.9 11.9 0 0 0 5.72 1.46h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.47-8.43ZM12.09 21.77h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.73.98.99-3.64-.23-.37a9.86 9.86 0 0 1-1.51-5.25C2.21 6.46 6.65 2.03 12.09 2.03a9.82 9.82 0 0 1 6.98 2.89 9.86 9.86 0 0 1 2.9 6.99c0 5.45-4.43 9.87-9.88 9.87Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" /></svg></span>;
}

function optionTitle(option: ContactOption, lang: 'ar' | 'en') { return lang === 'ar' ? option.titleAr : option.titleEn; }
function optionDescription(option: ContactOption, lang: 'ar' | 'en') { return lang === 'ar' ? option.descriptionAr : option.descriptionEn; }

export default function Contact() {
  const { ref, visible } = useReveal();
  const settings = useSiteSettings();
  const { services } = useContent();
  const { lang } = useLang();
  const t = translations.contact;
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [openOption, setOpenOption] = useState<string | null>(settings.contactOptions.find((o) => o.enabled)?.id ?? null);

  const contactInfo = [
    { icon: Mail, label: t.mail[lang], value: settings.email, ltr: true },
    { icon: Phone, label: t.phone[lang], value: settings.phone, ltr: true },
    { icon: MapPin, label: t.location[lang], value: settings.address, ltr: false },
  ];

  const options = settings.contactOptions.filter((o) => o.enabled);
  const defaultOptions: ContactOption[] = [
    { id: 'form', type: 'form', titleAr: 'تواصل معنا من هنا', titleEn: 'Contact us here', descriptionAr: 'أرسل تفاصيل مشروعك مباشرة.', descriptionEn: 'Send your project details directly.', image: '', href: '#contact-form', enabled: true, whatsappSuggestions: [] },
  ];
  const visibleOptions = options.length ? options : defaultOptions;

  const generateServiceMessage = (serviceTitle: string, serviceDesc: string) => lang === 'ar'
    ? `مرحباً، أود طلب خدمة "${serviceTitle}".\n\nالخدمة المطلوبة: ${serviceTitle}\nالتفاصيل: ${serviceDesc}\n\nأرجو التواصل معي لمناقشة التفاصيل والمتطلبات.`
    : `Hello, I'd like to request the "${serviceTitle}" service.\n\nRequested Service: ${serviceTitle}\nDetails: ${serviceDesc}\n\nPlease contact me to discuss details and requirements.`;

  const openForm = (message = '') => {
    setOpenOption('form');
    if (message) setForm((current) => ({ ...current, message }));
    window.setTimeout(() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  useEffect(() => {
    const onServiceRequest = (event: Event) => {
      const custom = event as CustomEvent<{ title: string; desc: string }>;
      if (!custom.detail?.title) return;
      openForm(generateServiceMessage(custom.detail.title, custom.detail.desc));
      window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('#contact-form textarea')?.focus(), 400);
    };
    window.addEventListener('codrix:service-request', onServiceRequest);
    return () => window.removeEventListener('codrix:service-request', onServiceRequest);
  }, [lang, services.items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('loading'); setErrorMsg('');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      let result: { success?: boolean; error?: string } = {};
      try { result = await response.json(); } catch { result = {}; }
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed');
      setStatus('success'); setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setErrorMsg(err instanceof TypeError ? (lang === 'ar' ? 'تعذر الاتصال بالخدمة حالياً.' : 'Cannot connect to the service right now.') : err instanceof Error ? err.message : 'Error');
      setStatus('error'); setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const sendWhatsApp = (option: ContactOption, suggestion?: ContactOption['whatsappSuggestions'][number]) => {
    const message = suggestion
      ? (lang === 'ar' ? suggestion.messageAr : suggestion.messageEn)
      : (lang === 'ar' ? 'مرحباً، هل يمكنني الحصول على معلومات إضافية؟' : 'Hello, can I get additional information?');
    const phone = settings.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    void option;
  };

  const inputCls = 'w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white dark:placeholder:text-ink-500';

  return (
    <section id="contact" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute -top-20 right-1/3 h-80 w-80 rounded-full bg-accent-500/10 blur-[120px]" />
      <div className="container-x relative">
        <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/40">
          <div className="grid lg:grid-cols-12">
            <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} relative overflow-hidden bg-gradient-to-br from-ink-100 to-ink-50 p-8 dark:from-ink-900 dark:to-ink-950 lg:col-span-5 lg:p-12`}>
              <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
              <div className="relative">
                <span className="eyebrow">{t.title[lang]}</span>
                <h2 className="mt-5 text-3xl font-extrabold text-ink-900 dark:text-white sm:text-4xl">{t.heading[lang]}</h2>
                <p className="mt-4 text-ink-600 dark:text-ink-300">{t.description[lang]}</p>
                <ul className="mt-10 space-y-5">
                  {contactInfo.map((c) => <li key={c.label} className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 ring-1 ring-accent-500/20 dark:text-accent-300"><c.icon className="h-5 w-5" /></span><div><div className="text-xs font-semibold text-ink-500 dark:text-ink-400">{c.label}</div><div className="text-sm font-bold text-ink-900 dark:text-white" dir={c.ltr ? 'ltr' : 'rtl'}>{c.value}</div></div></li>)}
                </ul>
              </div>
            </div>
            <div className="p-6 sm:p-8 lg:col-span-7 lg:p-10">
              <div className="space-y-3">
                {visibleOptions.map((option) => {
                  const expanded = openOption === option.id;
                  const title = optionTitle(option, lang);
                  return (
                    <div key={option.id} className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50/60 dark:border-ink-700 dark:bg-ink-950/50">
                      <button type="button" onClick={() => setOpenOption(expanded ? null : option.id)} className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-white dark:hover:bg-ink-900">
                        {option.image ? <img src={option.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-300">{option.type === 'whatsapp' ? <WhatsAppIcon className="h-6 w-6" /> : option.type === 'link' ? <ExternalLink className="h-6 w-6" /> : <Mail className="h-6 w-6" />}</span>}
                        <span className="min-w-0 flex-1"><span className="block font-extrabold text-ink-900 dark:text-white">{title}</span><span className="mt-1 block text-xs text-ink-500 dark:text-ink-400">{optionDescription(option, lang)}</span></span>
                        {expanded ? <ChevronDown className="h-5 w-5 shrink-0 text-accent-500" /> : lang === 'ar' ? <ChevronLeft className="h-5 w-5 shrink-0 text-ink-400" /> : <ChevronRight className="h-5 w-5 shrink-0 text-ink-400" />}
                      </button>

                      {expanded && option.type === 'form' && (
                        <div id="contact-form" className="border-t border-ink-200 p-5 dark:border-ink-700">
                          {status === 'success' ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-mint-500" /><h3 className="mt-4 text-xl font-bold text-ink-900 dark:text-white">{t.success[lang]}</h3><p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{t.successDesc[lang]}</p></div>
                            : status === 'error' ? <div className="py-8 text-center"><AlertCircle className="mx-auto h-14 w-14 text-red-500" /><h3 className="mt-4 text-xl font-bold text-ink-900 dark:text-white">{t.error[lang]}</h3><p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{errorMsg}</p><button onClick={() => setStatus('idle')} className="btn-ghost mt-5">{t.retry[lang]}</button></div>
                              : <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.name[lang]}</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.namePlaceholder[lang]} className={inputCls} required /></div><div><label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.email[lang]}</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" className={inputCls} required /></div></div>
                                <div><label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.message[lang]}</label><textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.msgPlaceholder[lang]} className={`${inputCls} resize-none`} required /></div>
                                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full disabled:opacity-70">{status === 'loading' ? <><Loader2 className="h-4 w-4 animate-spin" />{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</> : <>{t.submit[lang]}<Send className="h-4 w-4" /></>}</button>
                              </form>}
                        </div>
                      )}

                      {expanded && option.type === 'whatsapp' && (
                        <div className="border-t border-ink-200 p-5 dark:border-ink-700">
                          <p className="mb-4 text-sm font-bold text-ink-700 dark:text-ink-200">{lang === 'ar' ? 'اختر ما تريد الاستفسار عنه (اختياري):' : 'Choose what you want to ask about (optional):'}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {option.whatsappSuggestions.map((suggestion, index) => <button key={`${suggestion.titleAr}-${index}`} type="button" onClick={() => sendWhatsApp(option, suggestion)} className="rounded-xl border border-accent-500/20 bg-accent-500/5 px-4 py-3 text-start text-sm font-bold text-accent-700 transition hover:border-accent-500/50 hover:bg-accent-500/10 dark:text-accent-300">{lang === 'ar' ? suggestion.titleAr : suggestion.titleEn}</button>)}
                          </div>
                          <button type="button" onClick={() => sendWhatsApp(option)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-green-500/20 transition hover:brightness-95"><WhatsAppIcon className="h-5 w-5" />{lang === 'ar' ? 'اضغط هنا للتواصل عبر واتساب' : 'Chat with us on WhatsApp'}</button>
                        </div>
                      )}

                      {expanded && option.type === 'link' && <div className="border-t border-ink-200 p-5 dark:border-ink-700"><a href={option.href || '#'} target="_blank" rel="noreferrer" className="btn-primary w-full">{lang === 'ar' ? 'الانتقال الآن' : 'Open now'}<ExternalLink className="h-4 w-4" /></a></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
