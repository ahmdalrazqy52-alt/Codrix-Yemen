import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Sparkles, Trophy, Users, Clock, Zap, Briefcase, Phone, Settings, Star, type LucideIcon } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useLang, translations } from '@/context/LangContext';
import { useCountUp } from '@/hooks/useCountUp';

function AchievementCard({ icon: Icon, value, suffix, label, delay }: {
  icon: LucideIcon; value: number; suffix: string; label: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 2000, inView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="card group flex flex-col items-center p-6 text-center hover:border-accent-500/40 hover:-translate-y-1" style={{ animationDelay: `${delay}ms` }}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-mint-500/10 text-accent-600 ring-1 ring-accent-500/20 transition-transform group-hover:scale-110 dark:text-accent-300"><Icon className="h-7 w-7" strokeWidth={1.8} /></span>
      <div className="mt-4 text-3xl font-extrabold text-gradient sm:text-4xl">{count}{suffix}</div>
      <div className="mt-1.5 text-xs font-semibold text-ink-500 dark:text-ink-400 sm:text-sm">{label}</div>
    </div>
  );
}

export default function Hero() {
  const { settings, home, process } = useContent();
  const { lang } = useLang();
  const tHero = translations.hero;
  const quickNav = [
    { href: '#work', label: tHero.quickWork[lang], desc: tHero.quickWorkDesc[lang], icon: Briefcase, color: 'text-accent-500' },
    { href: '#services', label: tHero.quickServices[lang], desc: tHero.quickServicesDesc[lang], icon: Settings, color: 'text-mint-500' },
    { href: '#contact', label: tHero.quickContact[lang], desc: tHero.quickContactDesc[lang], icon: Phone, color: 'text-accent-400' },
  ];

  const achievementIcons = [Trophy, Users, Clock, Zap];
  const stats = process.stats.slice(0, 4).map((s, i) => {
    const numMatch = s.value.match(/(\d+)/);
    return { icon: achievementIcons[i] || Star, value: numMatch ? parseInt(numMatch[1]) : 0, suffix: s.value.replace(/\d+/, ''), label: s.label };
  });

  return (
    <section id="home" className="relative overflow-hidden pt-28 lg:pt-36">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 dark:opacity-60" />
        <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-accent-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-40 left-1/4 h-72 w-72 rounded-full bg-mint-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-50 to-transparent dark:from-ink-950" />
      </div>

      <div className="container-x relative">
        <div className="flex flex-col items-center text-center animate-fade-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="flex items-center justify-center">
            <img src={settings.logoLight} alt={settings.companyName} className="h-28 w-auto object-contain dark:hidden sm:h-36" />
            <img src={settings.logoDark} alt={settings.companyName} className="hidden h-28 w-auto object-contain dark:block sm:h-36" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-ink-900 dark:text-white lg:text-3xl">{settings.companyName}</h1>
          <p className="font-mono text-xs tracking-[0.3em] text-accent-600 dark:text-accent-400">{settings.englishName}</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl text-center animate-fade-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />{home.eyebrow}</span>
          <h2 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-ink-900 dark:text-white sm:text-5xl lg:text-6xl">{home.title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-600 dark:text-ink-300">{home.description}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
          <a href="#contact" className="btn-primary">{home.ctaPrimary}<ArrowLeft className="h-4 w-4" /></a>
          <a href="#work" className="btn-ghost">{home.ctaSecondary}</a>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
          {quickNav.map((q) => (
            <a key={q.href} href={q.href} className="card group flex items-center gap-4 p-5 hover:border-accent-500/40 hover:-translate-y-1">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 ${q.color} dark:bg-ink-800/60`}><q.icon className="h-6 w-6" /></span>
              <div className="text-right"><div className="text-sm font-bold text-ink-900 dark:text-white">{q.label}</div><div className="text-xs text-ink-500 dark:text-ink-400">{q.desc}</div></div>
              <ArrowLeft className="mr-auto h-4 w-4 text-ink-400 transition-transform group-hover:-translate-x-1" />
            </a>
          ))}
        </div>

        {stats.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 text-center animate-fade-up [animation-delay:500ms] opacity-0 [animation-fill-mode:forwards]">
              <h3 className="flex items-center justify-center gap-2 text-lg font-bold text-ink-700 dark:text-ink-200"><Star className="h-5 w-5 text-accent-500" />{tHero.achievements[lang]}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((a, i) => <AchievementCard key={i} {...a} delay={i * 100} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
