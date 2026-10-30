import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { ArrowLeft, Rocket } from 'lucide-react';

export default function Cta() {
  const { ref, visible } = useReveal();
  const { cta } = useContent();
  return (
    <section className="overflow-hidden py-16 lg:py-24">
      <div className="container-x">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-500 to-mint-500 p-10 text-center shadow-2xl shadow-accent-500/20 sm:p-14 lg:p-20`}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-mint-400/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-950/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-950"><Rocket className="h-3.5 w-3.5" />{cta.badge}</span>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight text-ink-950 sm:text-4xl lg:text-5xl">{cta.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-semibold text-ink-900/80 sm:text-lg">{cta.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-950 px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-ink-900 hover:-translate-y-0.5">{cta.ctaPrimary}<ArrowLeft className="h-4 w-4" /></a>
              <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-950/20 bg-white/20 px-7 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:bg-white/30">{cta.ctaSecondary}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
