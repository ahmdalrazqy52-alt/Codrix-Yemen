import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const { ref, visible } = useReveal();
  const { testimonials } = useContent();
  return (
    <section id="testimonials" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="container-x relative">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-2xl text-center`}>
          <span className="eyebrow">{testimonials.eyebrow}</span>
          <h2 className="mt-5 section-title">{testimonials.title}</h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{testimonials.subtitle}</p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <figure key={i} className="card flex h-full flex-col p-7 hover:border-accent-500/30">
              <Quote className="h-8 w-8 text-accent-500/40" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{t.text}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-200 pt-5 dark:border-ink-800">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-mint-500 text-sm font-bold text-ink-950">{t.initials}</span>
                <div><div className="text-sm font-bold text-ink-900 dark:text-white">{t.name}</div><div className="text-xs text-ink-500 dark:text-ink-400">{t.role}</div></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
