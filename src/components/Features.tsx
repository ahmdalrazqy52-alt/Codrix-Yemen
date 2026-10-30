import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { getIcon } from '@/content-types';

export default function Features() {
  const { ref, visible } = useReveal();
  const { features } = useContent();
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="container-x">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-2xl text-center`}>
          <span className="eyebrow">{features.eyebrow}</span>
          <h2 className="mt-5 section-title">{features.title}</h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{features.subtitle}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((f, i) => {
            const Icon = getIcon(f.icon);
            return (
              <div key={i} className="card group flex items-start gap-5 p-7 hover:border-accent-500/40 hover:-translate-y-1" style={{ transitionDelay: `${i * 50}ms` }}>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/15 to-mint-500/10 text-accent-600 ring-1 ring-accent-500/20 transition-transform group-hover:scale-110 dark:text-accent-300"><Icon className="h-7 w-7" strokeWidth={1.8} /></span>
                <div><h3 className="text-lg font-bold text-ink-900 dark:text-white">{f.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{f.desc}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
