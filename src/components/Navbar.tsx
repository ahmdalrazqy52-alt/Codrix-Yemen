import { useEffect, useState } from 'react';
import { Menu, X, Sun, Moon, Home, Languages } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLang, translations } from '@/context/LangContext';
import { useSiteSettings } from '@/context/SiteContentContext';
import { SiteSearch } from '@/components/SiteSearch';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const settings = useSiteSettings();
  const t = translations.nav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { href: '#home', label: t.home[lang] },
    { href: '#services', label: t.services[lang] },
    { href: '#process', label: t.process[lang] },
    { href: '#work', label: t.work[lang] },
    { href: '#team', label: t.team[lang] },
    { href: '#testimonials', label: t.testimonials[lang] },
    { href: '#faq', label: t.faq[lang] },
    { href: '#contact', label: t.contact[lang] },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-ink-200/80 bg-white/80 backdrop-blur-xl dark:border-ink-800/80 dark:bg-ink-950/80' : 'border-b border-transparent bg-transparent'}`}>
      <nav className="container-x flex h-16 items-center justify-between lg:h-20">
        <a href="#home" className="group flex items-center">
          <img src={settings.logoLight} alt={settings.companyName} className="h-12 w-auto object-contain transition-transform group-hover:scale-[1.03] dark:hidden" />
          <img src={settings.logoDark} alt={settings.companyName} className="hidden h-12 w-auto object-contain transition-transform group-hover:scale-[1.03] dark:block" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-accent-700 dark:text-ink-200 dark:hover:bg-ink-800/60 dark:hover:text-white">{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <SiteSearch />
          <button onClick={toggleLang} className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-accent-500/50 hover:text-accent-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-100 dark:hover:text-accent-300" aria-label="Toggle Language" title={lang === 'ar' ? 'English' : 'العربية'}>
            <Languages className="h-5 w-5" />
          </button>
          <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-accent-500/50 hover:text-accent-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-100 dark:hover:text-accent-300" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <a href="#contact" className="btn-primary hidden sm:inline-flex">{t.startProject[lang]}</a>
          <button onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 lg:hidden dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-100" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className={`overflow-hidden border-ink-200 bg-white/95 backdrop-blur-xl transition-all duration-300 dark:border-ink-800 dark:bg-ink-950/95 lg:hidden ${open ? 'max-h-[480px] border-b' : 'max-h-0'}`}>
        <ul className="container-x flex flex-col gap-1 py-4">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-accent-700 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-white">
                {l.href === '#home' && <Home className="h-4 w-4" />}{l.label}
              </a>
            </li>
          ))}
          <li className="pt-2"><a href="#contact" onClick={() => setOpen(false)} className="btn-primary w-full">{t.startProject[lang]}</a></li>
        </ul>
      </div>
    </header>
  );
}
