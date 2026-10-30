import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function ScrollNavigator() {
  const { lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [hasNextSection, setHasNextSection] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-section]'))
          .filter((element) => element.getBoundingClientRect().height > 0);
        const next = sections.some((element) => element.getBoundingClientRect().top + y > y + 140);
        setScrolled(y > 120);
        setHasNextSection(next);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, []);

  const go = () => {
    if (scrolled) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const current = window.scrollY;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-section]'))
      .filter((element) => element.getBoundingClientRect().height > 0)
      .sort((a, b) => (a.getBoundingClientRect().top + current) - (b.getBoundingClientRect().top + current));
    const next = sections.find((element) => element.getBoundingClientRect().top + current > current + 140);

    if (next) {
      next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const show = scrolled || hasNextSection;
  return (
    <button
      type="button"
      onClick={go}
      aria-label={scrolled ? (lang === 'ar' ? 'العودة إلى أعلى الصفحة' : 'Back to top') : (lang === 'ar' ? 'الانتقال إلى القسم التالي' : 'Go to next section')}
      title={scrolled ? (lang === 'ar' ? 'العودة للأعلى' : 'Back to top') : (lang === 'ar' ? 'القسم التالي' : 'Next section')}
      className={`fixed bottom-20 ${lang === 'ar' ? 'left-5' : 'right-5'} z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink-300/50 bg-white/90 text-ink-700 shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white hover:text-accent-600 dark:border-ink-700/60 dark:bg-ink-900/90 dark:text-white dark:hover:bg-ink-900 ${show ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'}`}
    >
      {scrolled ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
    </button>
  );
}
