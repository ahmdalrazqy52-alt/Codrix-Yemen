import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function ScrollNavigator() {
  const { lang } = useLang();
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      setVisible(current > 80 && current < document.documentElement.scrollHeight - window.innerHeight - 20 || current <= 80);
      if (current > last + 4) setDirection('up');
      else if (current < last - 4) setDirection('down');
      last = current;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = () => {
    if (direction === 'up') document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };
  const UpIcon = ArrowUp;
  return (
    <button onClick={go} aria-label={direction === 'up' ? 'العودة إلى الرئيسية' : 'الانتقال إلى التواصل'} className={`fixed bottom-20 ${lang === 'ar' ? 'left-5' : 'right-5'} z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink-300/50 bg-white/45 text-ink-700/75 shadow-lg backdrop-blur-md transition-all hover:bg-white/70 hover:text-accent-600 dark:border-ink-700/60 dark:bg-ink-900/45 dark:text-white/75 dark:hover:bg-ink-900/70 ${visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'}`}>
      {direction === 'up' ? <ArrowDown className="h-5 w-5" /> : <UpIcon className="h-5 w-5" />}
    </button>
  );
}
