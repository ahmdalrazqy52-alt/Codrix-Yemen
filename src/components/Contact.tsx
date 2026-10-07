import { useEffect, useState, useMemo } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteSettings } from '@/context/SiteContentContext';
import { useContent } from '@/hooks/useContent';
import { useLang, translations } from '@/context/LangContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, AlertCircle, Lightbulb } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const { ref, visible } = useReveal();
  const settings = useSiteSettings();
  const { services } = useContent();
  const { lang } = useLang();
  const t = translations.contact;
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const serviceNames = useMemo(() => services.items.map((s) => s.title), [services]);

  const generateServiceMessage = (serviceTitle: string, serviceDesc: string) => {
    return lang === 'ar'
      ? `مرحباً، أود طلب خدمة "${serviceTitle}".\n\nالخدمة المطلوبة: ${serviceTitle}\nالتفاصيل: ${serviceDesc}\n\nأرجو التواصل معي لمناقشة التفاصيل والمتطلبات.`
      : `Hello, I'd like to request the "${serviceTitle}" service.\n\nRequested Service: ${serviceTitle}\nDetails: ${serviceDesc}\n\nPlease contact me to discuss details and requirements.`;
  };

  const applySuggestion = (serviceTitle: string) => {
    const svc = services.items.find((s) => s.title === serviceTitle);
    if (!svc) return;
    setForm({ ...form, message: generateServiceMessage(svc.title, svc.desc) });
    setShowSuggestions(false);
  };

  useEffect(() => {
    const onServiceRequest = (event: Event) => {
      const custom = event as CustomEvent<{ title: string; desc: string }>;
      if (!custom.detail?.title) return;
      setForm((current) => ({ ...current, message: generateServiceMessage(custom.detail.title, custom.detail.desc) }));
      setShowSuggestions(false);
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('#contact textarea')?.focus(), 500);
    };
    window.addEventListener('codrix:service-request', onServiceRequest);
    return () => window.removeEventListener('codrix:service-request', onServiceRequest);
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      let result: { success?: boolean; error?: string } = {};
      try { result = await response.json(); } catch { result = {}; }
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed');
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setErrorMsg(err instanceof TypeError ? (lang === 'ar' ? 'تعذر الاتصال بالخدمة حالياً.' : 'Cannot connect to the service right now.') : err instanceof Error ? err.message : 'Error');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const inputCls = 'w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white dark:placeholder:text-ink-500';

  const contactInfo = [
    { icon: Mail, label: t.mail[lang], value: settings.email, ltr: true },
    { icon: Phone, label: t.phone[lang], value: settings.phone, ltr: true },
    { icon: MapPin, label: t.location[lang], value: settings.address, ltr: false },
  ];

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
                  {contactInfo.map((c) => (
                    <li key={c.label} className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 ring-1 ring-accent-500/20 dark:text-accent-300"><c.icon className="h-5 w-5" /></span>
                      <div>
                        <div className="text-xs font-semibold text-ink-500 dark:text-ink-400">{c.label}</div>
                        <div className="text-sm font-bold text-ink-900 dark:text-white" dir={c.ltr ? 'ltr' : 'rtl'}>{c.value}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-8 lg:col-span-7 lg:p-12">
              {status === 'success' ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="h-16 w-16 text-mint-500" />
                  <h3 className="mt-5 text-2xl font-bold text-ink-900 dark:text-white">{t.success[lang]}</h3>
                  <p className="mt-2 text-ink-600 dark:text-ink-300">{t.successDesc[lang]}</p>
                </div>
              ) : status === 'error' ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                  <h3 className="mt-5 text-2xl font-bold text-ink-900 dark:text-white">{t.error[lang]}</h3>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{errorMsg}</p>
                  <button onClick={() => setStatus('idle')} className="btn-ghost mt-6">{t.retry[lang]}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.name[lang]}</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.namePlaceholder[lang]} className={inputCls} required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.email[lang]}</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" className={inputCls} required />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.message[lang]}</label>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="flex items-center gap-1.5 text-xs font-bold text-accent-600 transition-colors hover:text-accent-700 dark:text-accent-300"
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        {lang === 'ar' ? 'اقتراحات' : 'Suggestions'}
                      </button>
                    </div>

                    {showSuggestions && (
                      <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-accent-500/20 bg-accent-500/5 p-3">
                        <p className="w-full text-xs font-bold text-ink-500 dark:text-ink-400">{lang === 'ar' ? 'اختر خدمة لإنشاء رسالة تلقائية:' : 'Choose a service to generate a message:'}</p>
                        {serviceNames.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => applySuggestion(name)}
                            className="rounded-lg border border-accent-500/30 bg-white px-3 py-1.5 text-xs font-bold text-accent-600 transition-all hover:bg-accent-500 hover:text-ink-950 dark:bg-ink-900 dark:text-accent-300 dark:hover:bg-accent-500 dark:hover:text-ink-950"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}

                    <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t.msgPlaceholder[lang]} className={`${inputCls} resize-none`} required />
                    {form.message && (
                      <p className="mt-1.5 text-xs text-ink-400">{lang === 'ar' ? 'يمكنك تعديل الرسالة قبل الإرسال.' : 'You can edit the message before sending.'}</p>
                    )}
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full disabled:opacity-70">
                    {status === 'loading' ? (<><Loader2 className="h-4 w-4 animate-spin" />{lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</>) : (<>{t.submit[lang]}<Send className="h-4 w-4" /></>)}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
