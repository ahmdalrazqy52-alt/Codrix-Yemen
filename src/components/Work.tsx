import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { ArrowUpLeft } from 'lucide-react';

export default function Work() {
  const { ref, visible } = useReveal();
  const { work } = useContent();
  return (
    <section id="work" className="py-24 lg:py-32">
      <div className="container-x">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end`}>
          <div className="max-w-xl">
            <span className="eyebrow">{work.eyebrow}</span>
            <h2 className="mt-5 section-title">{work.title}</h2>
            <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{work.subtitle}</p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {work.projects.map((p, i) => (
            <article key={i} className="card group relative overflow-hidden hover:border-accent-500/40">
              <div className="relative h-60 overflow-hidden sm:h-72">
                <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                <span className="absolute right-4 top-4 rounded-full bg-accent-500/90 px-3 py-1 text-xs font-bold text-ink-950">{p.category}</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-ink-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-300">{p.title}</h3>
                  <ArrowUpLeft className="mt-1 h-5 w-5 shrink-0 text-ink-400 transition-colors group-hover:text-accent-500" />
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => <span key={t} className="rounded-lg border border-ink-200 bg-ink-100/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-600 dark:border-ink-700 dark:bg-ink-800/40 dark:text-ink-300">{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
