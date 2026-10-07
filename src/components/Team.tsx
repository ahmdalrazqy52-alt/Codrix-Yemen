import { useContent } from '@/hooks/useContent';
import { useReveal } from '@/hooks/useReveal';
import { Linkedin, Twitter } from 'lucide-react';

export default function Team() {
  const { ref, visible } = useReveal();
  const { team } = useContent();
  return (
    <section id="team" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="container-x relative">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-2xl text-center`}>
          <span className="eyebrow">{team.eyebrow}</span>
          <h2 className="mt-5 section-title">{team.title}</h2>
          <p className="mt-4 text-lg text-ink-600 dark:text-ink-300">{team.subtitle}</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.members.map((m, i) => (
            <div key={i} className="card group p-6 text-center hover:border-accent-500/40 hover:-translate-y-1.5" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="relative mx-auto h-24 w-24">
                <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${m.gradient} text-2xl font-bold text-ink-950 shadow-lg transition-transform group-hover:scale-105`}>{m.initials}</div>
                <span className="absolute inset-0 -z-10 rounded-full bg-accent-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-5 text-base font-bold text-ink-900 dark:text-white">{m.name}</h3>
              <p className="mt-1 text-sm text-accent-600 dark:text-accent-400">{m.role}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500 transition-colors hover:bg-accent-500 hover:text-ink-950 dark:bg-ink-800/60 dark:text-ink-400"><Linkedin className="h-4 w-4" /></a>
                <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-500 transition-colors hover:bg-accent-500 hover:text-ink-950 dark:bg-ink-800/60 dark:text-ink-400"><Twitter className="h-4 w-4" /></a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
