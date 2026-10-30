import { useContent } from '@/hooks/useContent';
import { getIcon } from '@/content-types';

export default function Marquee() {
  const { tech } = useContent();
  const items = [...tech.items, ...tech.items];
  return (
    <section className="overflow-hidden border-y border-ink-200 bg-ink-100/40 py-6 dark:border-ink-800/80 dark:bg-ink-900/30">
      <div className="container-x mb-4">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-ink-400 dark:text-ink-500">{tech.label}</p>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-10">
          {items.map((t, i) => {
            const Icon = getIcon(t.icon);
            return (
              <div key={i} className="flex items-center gap-2.5 text-ink-500 transition-colors hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-300">
                <Icon className="h-5 w-5" />
                <span className="font-mono text-sm font-semibold">{t.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
