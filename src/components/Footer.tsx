import { Github, Linkedin, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useLang, translations } from '@/context/LangContext';

export default function Footer() {
  const { settings, footer } = useContent();
  const { lang } = useLang();
  const t = translations.footer;
  const tNav = translations.nav;

  const serviceLinks = [
    { href: '#services', label: lang === 'ar' ? 'تطوير الويب' : 'Web Development' },
    { href: '#services', label: lang === 'ar' ? 'تطبيقات الجوال' : 'Mobile Apps' },
    { href: '#services', label: lang === 'ar' ? 'الذكاء الاصطناعي' : 'AI Solutions' },
    { href: '#services', label: lang === 'ar' ? 'الحوسبة السحابية' : 'Cloud Computing' },
  ];
  const companyLinks = [
    { href: '#process', label: tNav.process[lang] },
    { href: '#work', label: tNav.work[lang] },
    { href: '#team', label: tNav.team[lang] },
    { href: '#faq', label: tNav.faq[lang] },
  ];

  const socialIcons: Record<string, typeof Github> = {
    GitHub: Github, LinkedIn: Linkedin, Twitter: Twitter, Email: Mail,
  };

  return (
    <footer className="border-t border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#home" className="group flex items-center">
              <img src={settings.logoLight} alt={settings.companyName} className="h-16 w-auto object-contain transition-transform group-hover:scale-[1.03] dark:hidden" />
              <img src={settings.logoDark} alt={settings.companyName} className="hidden h-16 w-auto object-contain transition-transform group-hover:scale-[1.03] dark:block" />
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-500 dark:text-ink-400">{footer.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-500 dark:text-ink-400">
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 transition-colors hover:text-accent-600 dark:hover:text-accent-300" dir="ltr"><Phone className="h-4 w-4" />{settings.phone}</a>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{settings.address}</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              {footer.socialLinks.map((s) => {
                const Icon = socialIcons[s.label] ?? Mail;
                return (
                  <a key={s.label} href={s.href} aria-label={s.label} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white text-ink-500 transition-all hover:border-accent-500/50 hover:text-accent-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300 dark:hover:text-accent-300">
                    {s.iconUrl ? <img src={s.iconUrl} alt={s.label} className="h-6 w-6 object-contain" /> : <Icon className="h-5 w-5" />}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-ink-900 dark:text-white">{t.services[lang]}</h4>
            <ul className="mt-4 space-y-3">
              {serviceLinks.map((l) => <li key={l.label}><a href={l.href} className="text-sm text-ink-500 transition-colors hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-300">{l.label}</a></li>)}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-ink-900 dark:text-white">{t.company[lang]}</h4>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((l) => <li key={l.label}><a href={l.href} className="text-sm text-ink-500 transition-colors hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-300">{l.label}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-8 sm:flex-row dark:border-ink-800">
          <p className="text-xs text-ink-400 dark:text-ink-500">© {new Date().getFullYear()} {settings.companyName}. {t.rights[lang]}.</p>
          <p className="font-mono text-xs text-ink-400 dark:text-ink-500">{t.builtWith[lang]} <span className="text-accent-500">&lt;/&gt;</span></p>
        </div>
      </div>
    </footer>
  );
}
