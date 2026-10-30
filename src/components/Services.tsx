import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { useLang, translations } from '@/context/LangContext';
import { ArrowLeft, Check } from 'lucide-react';
import { getIcon } from '@/content-types';

export default function Services() {
  const { ref, visible } = useReveal();
  const { services } = useContent();
  const { lang } = useLang();
  return (
    <section id="services" className="py-24 lg:py-32">
      <div className="container-x">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-2xl text-center`}>
          <span className="eyebrow">{services.eyebrow}</span>
          <h2 className="mt-5 section-title">{services.title}</h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{services.subtitle}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((s, i) => {
            const Icon = getIcon(s.icon);
            return (
              <article key={i} className="card group relative overflow-hidden p-7 hover:-translate-y-1.5 hover:border-accent-500/40 dark:hover:bg-ink-900/80" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-500/5 blur-2xl transition-opacity group-hover:bg-accent-500/10" />
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-mint-500/10 text-accent-600 ring-1 ring-accent-500/20 transition-transform group-hover:scale-110 dark:text-accent-300"><Icon className="h-7 w-7" strokeWidth={1.8} /></span>
                  <h3 className="mt-5 text-xl font-bold text-ink-900 dark:text-white">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{s.desc}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.points.map((p) => <li key={p} className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 dark:bg-ink-800/60 dark:text-ink-200">{p}</li>)}
                  </ul>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('codrix:service-request', { detail: { title: s.title, desc: s.desc } }));
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500/10 px-4 py-2 text-sm font-bold text-accent-600 transition-all hover:bg-accent-500 hover:text-ink-950 dark:text-accent-300 dark:hover:bg-accent-500 dark:hover:text-ink-950"
                  >
                    <Check className="h-4 w-4" />
                    {translations.sections.wantThis[lang]}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <a href="#contact" className="btn-ghost">{translations.sections.customService[lang]}<ArrowLeft className="h-4 w-4" /></a>
        </div>
      </div>
    </section>
  );
}
