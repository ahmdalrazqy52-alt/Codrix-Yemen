import { useEffect, useState, useCallback } from 'react';
import { Star, Trash2, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Review = {
  id: string;
  name: string;
  rating: number;
  note: string;
  visible: boolean;
  created_at: string;
};

export function ReviewsManager({ onLog }: { onLog: (action: string, targetId: string, desc: string) => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleVisible = async (id: string, current: boolean) => {
    await supabase.from('reviews').update({ visible: !current }).eq('id', id);
    onLog('update', 'review', `${current ? 'إخفاء' : 'إظهار'} تقييم`);
    void load();
  };

  const remove = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id);
    onLog('delete', 'review', 'حذف تقييم');
    void load();
    setNotice('تم حذف التقييم.');
    setTimeout(() => setNotice(''), 2000);
  };

  if (loading) {
    return <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {notice && <div className="flex items-center gap-2 rounded-xl border border-mint-500/20 bg-mint-500/10 px-4 py-3 text-sm font-semibold text-mint-700 dark:text-mint-300"><Check className="h-4 w-4" />{notice}</div>}
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">التقييمات والملاحظات</h3>
          <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
            <Star className="h-4 w-4 text-sky-500" />
            <span>{reviews.length} تقييم</span>
          </div>
        </div>
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">لا توجد تقييمات حتى الآن.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className={`rounded-xl border p-4 ${r.visible ? 'border-ink-200 dark:border-ink-700' : 'border-ink-200 bg-ink-50/50 dark:border-ink-800 dark:bg-ink-900/40'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink-900 dark:text-white">{r.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-sky-500 text-sky-500' : 'text-ink-200 dark:text-ink-700'}`} />
                        ))}
                      </div>
                      {!r.visible && <span className="rounded-full bg-ink-200 px-2 py-0.5 text-[10px] font-bold text-ink-500 dark:bg-ink-800">مخفي</span>}
                    </div>
                    <time className="mt-1 block text-xs text-ink-400">{new Date(r.created_at).toLocaleString('ar')}</time>
                    {r.note && <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{r.note}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => void toggleVisible(r.id, r.visible)}
                      className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                      title={r.visible ? 'إخفاء' : 'إظهار'}
                    >
                      {r.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => void remove(r.id)}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
