import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';

export default function Process() {
  const { ref, visible } = useReveal();
  const { process } = useContent();
  return (
    <section id="process" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="container-x relative">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-2xl text-center`}>
          <span className="eyebrow">{process.eyebrow}</span>
          <h2 className="mt-5 section-title">{process.title}</h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{process.subtitle}</p>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {process.stats.map((s, i) => (
            <div key={i} className="card p-6 text-center hover:border-accent-500/30">
              <div className="text-3xl font-extrabold text-gradient lg:text-4xl">{s.value}</div>
              <div className="mt-2 text-sm font-semibold text-ink-500 dark:text-ink-400">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="card h-full p-7 hover:border-accent-500/40">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-4xl font-bold text-ink-300 dark:text-ink-700">{step.num}</span>
                  <span className="h-2 w-10 rounded-full bg-gradient-to-l from-accent-500 to-mint-500" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink-900 dark:text-white">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{step.desc}</p>
              </div>
              {i < process.steps.length - 1 && <div className="absolute left-0 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-ink-200 dark:bg-ink-700 lg:block" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
