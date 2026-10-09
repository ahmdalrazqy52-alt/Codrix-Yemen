import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AdItem = {
  id: string;
  slot: 'hero' | 'bottom';
  slot_id?: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  link_url: string;
  duration: number;
  active: boolean;
  sort_order: number;
  valid_until: string | null;
};

function filterExpired<T extends { valid_until: string | null }>(items: T[]): T[] {
  const now = new Date();
  return items.filter((i) => !i.valid_until || new Date(i.valid_until) > now);
}

function useAdRotation(slot: 'hero' | 'bottom') {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    const loadAds = async () => {
      const { data } = await supabase
        .from('ad_items')
        .select('*')
        .eq('slot', slot)
        .eq('active', true)
        .order('sort_order');
      if (!active || !data || data.length === 0) return;
      setAds(filterExpired(data as AdItem[]));
    };
    void loadAds();
    return () => { active = false; };
  }, [slot]);

  const next = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % (ads.length || 1));
  }, [ads.length]);

  const prev = useCallback(() => {
    setCurrentIdx((p) => (p - 1 + (ads.length || 1)) % (ads.length || 1));
  }, [ads.length]);

  const goTo = useCallback((idx: number) => {
    setCurrentIdx(idx);
  }, []);

  // Continuous auto-rotation
  useEffect(() => {
    if (ads.length <= 1) return;
    const current = ads[currentIdx];
    if (!current) return;

    if (current.media_type === 'video') {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(next, Math.max(2, current.duration) * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIdx, ads, next]);

  const handleVideoEnded = useCallback(() => {
    next();
  }, [next]);

  // Touch swipe handling
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev(); else next();
    }
    touchStart.current = null;
  }, [next, prev]);

  return { ads, currentIdx, videoRef, next, prev, goTo, handleVideoEnded, onTouchStart, onTouchEnd };
}

export function HeroAd() {
  const { ads, currentIdx, videoRef, next, prev, goTo, handleVideoEnded, onTouchStart, onTouchEnd } = useAdRotation('hero');

  if (ads.length === 0) return null;
  const current = ads[currentIdx];
  if (!current || !current.media_url) return null;

  const linkTarget = current.link_url.startsWith('http') ? '_blank' : undefined;

  return (
    <div className="container-x -mt-2 mb-4">
      <div className="group relative w-full overflow-hidden rounded-2xl border border-accent-500/30 shadow-lg shadow-accent-500/5 transition-all hover:border-accent-500/50 hover:shadow-accent-500/15">
        {/* Swipeable content */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative"
        >
          <a
            href={current.link_url || '#'}
            target={linkTarget}
            rel="noopener noreferrer"
            className="block"
          >
            {current.media_type === 'video' ? (
              <video
                ref={videoRef}
                src={current.media_url}
                className="h-[200px] w-full object-cover sm:h-[260px] lg:h-[320px]"
                muted
                playsInline
                onEnded={handleVideoEnded}
              />
            ) : (
              <img
                src={current.media_url}
                alt=""
                className="h-[200px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:h-[260px] lg:h-[320px]"
              />
            )}
          </a>
        </div>

        {/* Navigation arrows */}
        {ads.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Progress dots + counter */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 py-2.5">
          <span className="rounded-full bg-accent-500/90 px-2.5 py-0.5 text-[10px] font-bold text-ink-950">
            {ads.length > 1 ? `${currentIdx + 1} / ${ads.length}` : ''}
          </span>
          {ads.length > 1 && (
            <div className="flex gap-1.5">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-4 bg-accent-400' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                  aria-label={`الإعلان ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BottomBar() {
  const { ads, currentIdx, videoRef, next, goTo, handleVideoEnded, onTouchStart, onTouchEnd } = useAdRotation('bottom');
  const [dismissed, setDismissed] = useState(false);

  if (ads.length === 0 || dismissed) return null;
  const current = ads[currentIdx];
  if (!current || !current.media_url) return null;

  const linkTarget = current.link_url.startsWith('http') ? '_blank' : undefined;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-up">
      <div className="relative mx-auto max-w-full overflow-hidden bg-ink-900 shadow-2xl shadow-black/40 dark:bg-ink-900/95">
        {/* Swipeable content */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative"
        >
          <a
            href={current.link_url || '#'}
            target={linkTarget}
            rel="noopener noreferrer"
            className="block w-full"
          >
            {current.media_type === 'video' ? (
              <video
                ref={videoRef}
                src={current.media_url}
                className="h-20 w-full object-cover sm:h-24"
                muted
                playsInline
                onEnded={handleVideoEnded}
              />
            ) : (
              <img
                src={current.media_url}
                alt=""
                className="h-20 w-full object-cover sm:h-24"
              />
            )}
          </a>
        </div>

        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Progress dots */}
        {ads.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'w-4 bg-accent-400' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                aria-label={`الإعلان ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CustomAdSlots({ location }: { location: string }) {
  const [slots, setSlots] = useState<Array<{ id: string; name: string; width: string; height: string }>>([]);
  const [adsBySlot, setAdsBySlot] = useState<Record<string, AdItem[]>>({});
  const [indexes, setIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: slotData } = await supabase.from('ad_slots').select('id,name,width,height').eq('location', location).eq('active', true).order('sort_order');
      if (!active || !slotData?.length) { if (active) setSlots([]); return; }
      const ids = slotData.map((s) => s.id);
      const { data: adData } = await supabase.from('ad_items').select('*').in('slot_id', ids).eq('active', true).order('sort_order');
      if (!active) return;
      const grouped: Record<string, AdItem[]> = {};
      for (const ad of filterExpired((adData || []) as AdItem[])) {
        if (!ad.slot_id) continue;
        (grouped[ad.slot_id] ||= []).push(ad);
      }
      setSlots(slotData as Array<{ id: string; name: string; width: string; height: string }>);
      setAdsBySlot(grouped);
      setIndexes((old) => Object.fromEntries(slotData.map((s) => [s.id, Math.min(old[s.id] || 0, Math.max((grouped[s.id]?.length || 1) - 1, 0))])));
    };
    void load();
    return () => { active = false; };
  }, [location]);

  useEffect(() => {
    const timers = slots.map((slot) => {
      const ads = adsBySlot[slot.id] || [];
      const current = ads[indexes[slot.id] || 0];
      if (ads.length <= 1 || !current) return null;
      if (current.media_type === 'video') return null;
      return window.setTimeout(() => {
        setIndexes((old) => ({ ...old, [slot.id]: ((old[slot.id] || 0) + 1) % ads.length }));
      }, Math.max(2, current.duration || 5) * 1000);
    });
    return () => timers.forEach((timer) => { if (timer) window.clearTimeout(timer); });
  }, [slots, adsBySlot, indexes]);

  if (!slots.length) return null;

  const widthClass: Record<string, string> = {
    full: 'w-full', half: 'w-full md:w-1/2', third: 'w-full md:w-1/3', quarter: 'w-full md:w-1/4',
  };

  return (
    <div className="container-x my-6 flex flex-wrap items-stretch justify-center gap-4">
      {slots.map((slot) => {
        const ads = adsBySlot[slot.id] || [];
        const current = ads[indexes[slot.id] || 0];
        if (!current?.media_url) return null;
        const external = current.link_url?.startsWith('http');
        return (
          <div key={slot.id} className={`${widthClass[slot.width] || 'w-full'} overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm dark:border-ink-800 dark:bg-ink-900`} style={{ minHeight: slot.height }}>
            <a href={current.link_url || '#'} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="block h-full w-full">
              {current.media_type === 'video' ? (
                <video src={current.media_url} autoPlay muted playsInline onEnded={() => setIndexes((old) => ({ ...old, [slot.id]: ((old[slot.id] || 0) + 1) % ads.length }))} className="h-full w-full object-cover" style={{ minHeight: slot.height }} />
              ) : (
                <img src={current.media_url} alt={slot.name} className="h-full w-full object-cover" style={{ minHeight: slot.height }} />
              )}
            </a>
          </div>
        );
      })}
    </div>
  );
}
