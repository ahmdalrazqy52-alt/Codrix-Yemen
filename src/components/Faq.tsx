import { useState } from 'react';
import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { useLang, translations } from '@/context/LangContext';
import { Plus, Minus } from 'lucide-react';

export default function Faq() {
  const { ref, visible } = useReveal();
  const { faq } = useContent();
  const { lang } = useLang();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} lg:col-span-5`}>
            <span className="eyebrow">{faq.eyebrow}</span>
            <h2 className="mt-5 section-title">{faq.title}</h2>
            <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{faq.subtitle}</p>
            <a href="#contact" className="btn-primary mt-8">{translations.sections.contactTeam[lang]}</a>
          </div>
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-3">
              {faq.items.map((f, i) => {
                const isOpen = openIdx === i;
                return (
                  <div key={i} className={`card overflow-hidden transition-colors ${isOpen ? 'border-accent-500/30' : ''}`}>
                    <button onClick={() => setOpenIdx(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-right">
                      <span className="text-base font-bold text-ink-900 dark:text-white">{f.q}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-accent-500 text-ink-950' : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300'}`}>{isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                    </button>
                    <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{f.a}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
