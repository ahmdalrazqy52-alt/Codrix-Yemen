import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useLang, translations } from '@/context/LangContext';
import { useContent } from '@/hooks/useContent';

type SearchResult = {
  id: string;
  label: string;
  desc: string;
  href: string;
};

export function SiteSearch() {
  const { lang } = useLang();
  const t = translations.search;
  const content = useContent();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [
      { id: 'home', label: t.home[lang], desc: content.home.title, href: '#home' },
      { id: 'services', label: t.services[lang], desc: content.services.title, href: '#services' },
      { id: 'process', label: t.process[lang], desc: content.process.title, href: '#process' },
      { id: 'work', label: t.work[lang], desc: content.work.title, href: '#work' },
      { id: 'features', label: t.features[lang], desc: content.features.title, href: '#features' },
      { id: 'team', label: t.team[lang], desc: content.team.title, href: '#team' },
      { id: 'testimonials', label: t.testimonials[lang], desc: content.testimonials.title, href: '#testimonials' },
      { id: 'faq', label: t.faq[lang], desc: content.faq.title, href: '#faq' },
      { id: 'contact', label: t.contact[lang], desc: translations.contact.heading[lang], href: '#contact' },
      { id: 'reviews', label: t.reviews[lang], desc: t.reviews[lang], href: '#reviews' },
    ];

    content.services.items.forEach((s, i) => {
      results.push({ id: `svc-${i}`, label: s.title, desc: s.desc, href: '#services' });
    });
    content.work.projects.forEach((p, i) => {
      results.push({ id: `prj-${i}`, label: p.title, desc: p.desc, href: '#work' });
    });
    content.faq.items.forEach((f, i) => {
      results.push({ id: `faq-${i}`, label: f.q, desc: f.a, href: '#faq' });
    });
    content.features.items.forEach((f, i) => {
      results.push({ id: `feat-${i}`, label: f.title, desc: f.desc, href: '#features' });
    });
    content.team.members.forEach((m, i) => {
      results.push({ id: `team-${i}`, label: m.name, desc: m.role, href: '#team' });
    });

    return results;
  }, [lang, content, t]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allResults.filter((r) =>
      r.label.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, allResults]);

  const goTo = (href: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-accent-500/50 hover:text-accent-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-100 dark:hover:text-accent-300"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/60 backdrop-blur-sm pt-[10vh] px-4"
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-3 border-b border-ink-200 px-4 dark:border-ink-800">
              <Search className="h-5 w-5 shrink-0 text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder[lang]}
                className="flex-1 bg-transparent py-4 text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-white dark:placeholder:text-ink-500"
              />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div className="p-4">
                  <p className="mb-3 text-xs font-bold text-ink-400">{t.results[lang]}</p>
                  <div className="grid gap-1.5">
                    {allResults.slice(0, 8).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => goTo(r.href)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-ink-900 dark:text-white">{r.label}</div>
                          <div className="truncate text-xs text-ink-500 dark:text-ink-400">{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-ink-500">{t.noResults[lang]}</div>
              ) : (
                <div className="p-2">
                  {filtered.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => goTo(r.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-right transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                    >
                      <Search className="h-4 w-4 shrink-0 text-ink-300" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-ink-900 dark:text-white">{r.label}</div>
                        <div className="truncate text-xs text-ink-500 dark:text-ink-400">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
