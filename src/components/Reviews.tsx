import { useEffect, useState } from 'react';
import { Star, X, Check, Loader2, MessageSquare } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useLang, translations } from '@/context/LangContext';
import { supabase } from '@/lib/supabase';

type Review = {
  id: string;
  name: string;
  rating: number;
  note: string;
  created_at: string;
};

const STAR_COLORS = {
  active: 'text-sky-600 dark:text-sky-400',
  inactive: 'text-ink-300 dark:text-ink-600',
};

export default function Reviews() {
  const { ref, visible } = useReveal();
  const { lang, dir } = useLang();
  const t = translations.reviews;
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [visibleSection, setVisibleSection] = useState(true);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('id, name, rating, note, created_at')
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setReviews(data as Review[]);
      const avg = data.length > 0 ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
      setAvgRating(avg);
    }
  };

  useEffect(() => { void loadReviews(); }, []);

  // Check visibility from site_content settings
  useEffect(() => {
    const checkVisibility = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('section', 'reviews')
        .maybeSingle();
      if (data?.content && typeof data.content === 'object' && 'visible' in data.content) {
        setVisibleSection((data.content as Record<string, unknown>).visible as boolean);
      }
    };
    void checkVisibility();
  }, []);

  if (!visibleSection) return null;

  const submit = async (withNote: boolean) => {
    if (rating < 1) return;
    setStatus('loading');
    const { error } = await supabase.from('reviews').insert({
      name: name.trim() || (lang === 'ar' ? 'زائر' : 'Guest'),
      rating,
      note: withNote ? note.trim() : '',
    });
    if (!error) {
      setStatus('success');
      setRating(0);
      setHoverRating(0);
      setName('');
      setNote('');
      void loadReviews();
      setTimeout(() => {
        setStatus('idle');
        setShowModal(false);
      }, 2500);
    } else {
      setStatus('idle');
    }
  };

  const displayRating = hoverRating || rating;
  const isRtl = dir === 'rtl';

  const inputCls = 'w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white dark:placeholder:text-ink-500';

  return (
    <section id="reviews" className="py-24 lg:py-32">
      <div className="container-x">
        <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} mx-auto max-w-2xl text-center`}>
          <span className="eyebrow"><Star className="h-3.5 w-3.5" />{t.title[lang]}</span>
          <h2 className="mt-5 section-title">{t.subtitle[lang]}</h2>
        </div>

        {reviews.length > 0 && (
          <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-6 w-6 ${s <= Math.round(avgRating) ? 'fill-sky-500 text-sky-500' : 'text-ink-300 dark:text-ink-600'}`}
                />
              ))}
            </div>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {t.avgRating[lang]}: <span className="font-bold text-ink-900 dark:text-white">{avgRating.toFixed(1)}</span> · {t.basedOn[lang]} {reviews.length} {t.reviewsWord[lang]}
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Star className="h-4 w-4" />{t.rateButton[lang]}
          </button>
        </div>

        {reviews.length > 0 && (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((r) => (
              <div key={r.id} className="card group p-6 hover:border-sky-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sm font-bold text-sky-600 dark:text-sky-400">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink-900 dark:text-white">{r.name}</div>
                      <time className="text-[11px] text-ink-400">{new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</time>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-sky-500 text-sky-500' : 'text-ink-200 dark:text-ink-700'}`} />
                    ))}
                  </div>
                </div>
                {r.note && <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{r.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/15">
                  <Check className="h-8 w-8 text-sky-500" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-ink-900 dark:text-white">{t.thankYou[lang]}</h3>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{t.thankYouDesc[lang]}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 dark:border-ink-800">
                  <h3 className="text-lg font-extrabold text-ink-900 dark:text-white">{t.title[lang]}</h3>
                  <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.name[lang]}</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.namePlaceholder[lang]}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink-700 dark:text-ink-200">{t.stars[lang]}</label>
                    <div className="flex justify-center gap-2 py-2" dir={isRtl ? 'rtl' : 'ltr'}>
                      {[1, 2, 3, 4, 5].map((s) => {
                        const active = s <= displayRating;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                            aria-label={`${s} stars`}
                          >
                            <Star
                              className={`h-9 w-9 ${active ? 'fill-sky-600 text-sky-600 dark:fill-sky-400 dark:text-sky-400' : STAR_COLORS.inactive}`}
                              strokeWidth={1.5}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void submit(false)}
                    disabled={rating < 1 || status === 'loading'}
                    className="btn-ghost w-full disabled:opacity-50"
                  >
                    <Star className="h-4 w-4" />{t.rateOnly[lang]}
                  </button>

                  <div className="border-t border-ink-200 pt-4 dark:border-ink-800">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t.notePlaceholder[lang]}
                      rows={3}
                      className={`${inputCls} resize-none`}
                    />
                    <button
                      type="button"
                      onClick={() => void submit(true)}
                      disabled={rating < 1 || status === 'loading'}
                      className="btn-primary mt-3 w-full disabled:opacity-50"
                    >
                      {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                      {t.confirm[lang]}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
