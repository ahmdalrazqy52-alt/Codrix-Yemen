import { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw, Search, Trash2, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type LogEntry = {
  id: string; admin_id: string; admin_name: string; action: string;
  target_type: string; target_id: string; description: string; created_at: string;
  details?: Record<string, unknown> | null;
};
type Reaction = { id: string; log_id: string; admin_id: string; emoji: string };
type Category = 'all' | 'ad' | 'content' | 'admin' | 'message' | 'design' | 'review' | 'profile' | 'sql' | 'media' | 'settings' | 'other';
const EMOJIS = ['👍', '👎', '👏', '😂', '🤩', '😐', '❤', '❓', '💯'];
const CATEGORIES: { id: Category; label: string; types?: string[] }[] = [
  { id: 'all', label: 'كل السجل' },
  { id: 'ad', label: 'الإعلانات', types: ['ad', 'ad-slot'] },
  { id: 'content', label: 'المحتوى', types: ['content'] },
  { id: 'message', label: 'الرسائل', types: ['message'] },
  { id: 'admin', label: 'المدراء', types: ['admin'] },
  { id: 'design', label: 'التصميم والمظهر', types: ['design'] },
  { id: 'review', label: 'التقييمات', types: ['review'] },
  { id: 'profile', label: 'الملفات الشخصية', types: ['profile'] },
  { id: 'sql', label: 'أوامر SQL', types: ['sql'] },
  { id: 'media', label: 'مكتبة الوسائط', types: ['media'] },
  { id: 'settings', label: 'الإعدادات وترتيب الأقسام', types: ['settings'] },
  { id: 'other', label: 'إعدادات وأخرى' },
];
const actionLabels: Record<string, string> = { create: 'إضافة', update: 'تعديل', delete: 'حذف' };
const actionColors: Record<string, string> = {
  create: 'bg-mint-500/15 text-mint-600 dark:text-mint-300',
  update: 'bg-accent-500/15 text-accent-600 dark:text-accent-300',
  delete: 'bg-red-500/15 text-red-600 dark:text-red-300',
};
const targetLabels: Record<string, string> = {
  content: 'محتوى', ad: 'إعلان', 'ad-slot': 'مساحة إعلانية', admin: 'مدير',
  message: 'رسالة', profile: 'ملف شخصي', review: 'تقييم', design: 'تصميم', sql: 'استعلام', media: 'وسائط', settings: 'إعدادات',
};
export function ActivityLog({ userId, isOwner = false }: { userId: string; isOwner?: boolean }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [{ data: logRows, error: logError }, { data: reactionRows, error: reactionError }] = await Promise.all([
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('log_reactions').select('*'),
    ]);
    if (logError) setError(`تعذر تحميل السجلات: ${logError.message}`);
    else setLogs((logRows as LogEntry[]) || []);
    if (reactionError) setError((old) => old || `تعذر تحميل التفاعلات: ${reactionError.message}`);
    setReactions((reactionRows as Reaction[]) || []);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = logs.filter((log) => {
    const cat = CATEGORIES.find((c) => c.id === category);
    const categoryMatch = !cat || category === 'all' ||
      (category === 'other' ? !CATEGORIES.filter(c => c.types).some(c => c.types!.includes(log.target_type)) :
        !!cat.types?.includes(log.target_type));
    const text = `${log.admin_name} ${log.description} ${log.target_type} ${log.target_id}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase().trim());
  });

  const toggleReaction = async (logId: string, emoji: string) => {
    const existing = reactions.find((r) => r.log_id === logId && r.admin_id === userId);
    if (existing?.emoji === emoji) {
      const { error: e } = await supabase.from('log_reactions').delete().eq('id', existing.id);
      if (e) setError(`تعذر إزالة التفاعل: ${e.message}`);
    } else {
      if (existing) await supabase.from('log_reactions').delete().eq('id', existing.id);
      const { error: e } = await supabase.from('log_reactions').insert({ log_id: logId, admin_id: userId, emoji });
      if (e) setError(`تعذر حفظ التفاعل: ${e.message}`);
    }
    await load();
  };
  const toggleHeart = (logId: string) => void toggleReaction(logId, '❤');
  const countsFor = (id: string) => {
    const counts: Record<string, number> = {};
    reactions.filter(r => r.log_id === id).forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
    return counts;
  };
  const myReaction = (id: string) => reactions.find(r => r.log_id === id && r.admin_id === userId)?.emoji;
  const removeLog = async (log: LogEntry) => {
    if (!isOwner || !window.confirm('حذف هذا السجل نهائيًا؟ لا يمكن التراجع عن الحذف.')) return;
    const { error: deleteError } = await supabase.from('activity_log').delete().eq('id', log.id);
    if (deleteError) setError(`تعذر حذف السجل: ${deleteError.message}`);
    else { setSelected(null); await load(); }
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-400" /></div>;
  return <div className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1"><Search className="absolute right-3 top-3 h-4 w-4 text-ink-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث باسم المدير أو تفاصيل العملية..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pr-10 pl-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" /></div>
      <button onClick={() => void load()} className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm font-bold dark:border-ink-700"><RefreshCw className="h-4 w-4" /> تحديث السجل</button>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map(c => <button key={c.id} onClick={() => setCategory(c.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${category === c.id ? 'bg-accent-500 text-white' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'}`}>{c.label}{c.id === 'all' ? ` (${logs.length})` : ''}</button>)}
    </div>
    {error && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>}
    {!filtered.length ? <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-sm text-ink-500 dark:border-ink-800 dark:bg-ink-900">{logs.length ? 'لا توجد نتائج تطابق البحث أو القسم المحدد.' : 'لا توجد سجلات بعد. ستظهر العمليات الجديدة هنا عند ربطها بنظام التسجيل.'}</div> :
      filtered.map(log => {
        const counts = countsFor(log.id);
        const mine = myReaction(log.id);
        const isExpanded = expanded.includes(log.id);
        return <article key={log.id} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest('button,a,input,select,textarea')) void toggleHeart(log.id); }} title="انقر مرتين على مساحة الإجراء للتفاعل بالقلب" className="rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${actionColors[log.action] || 'bg-ink-100 text-ink-500'}`}>{actionLabels[log.action] || log.action}</span>
                <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[10px] font-bold text-ink-500 dark:bg-ink-800 dark:text-ink-300">{targetLabels[log.target_type] || log.target_type}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">{log.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400"><b className="text-ink-700 dark:text-ink-300">{log.admin_name || 'مدير غير معروف'}</b><span>·</span><time>{new Date(log.created_at).toLocaleString('ar')}</time></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setSelected(log)} className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200"><Eye className="h-3.5 w-3.5" /> رؤية الإجراء</button>
                <button onClick={() => setExpanded(v => v.includes(log.id) ? v.filter(x => x !== log.id) : [...v, log.id])} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800">{isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} التفاعلات</button>
                {isOwner && <button onClick={() => void removeLog(log)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 className="h-3.5 w-3.5" /> حذف السجل</button>}
              </div>
            </div>
          </div>
          {Object.keys(counts).length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{Object.entries(counts).map(([emoji, count]) => <span key={emoji} className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${mine === emoji ? 'bg-accent-500/15 ring-1 ring-accent-500/30' : 'bg-ink-100 dark:bg-ink-800'}`}>{emoji} <b>{count}</b></span>)}</div>}
          {isExpanded && <div className="mt-3 border-t border-ink-100 pt-3 dark:border-ink-800"><div className="flex flex-wrap gap-1.5">{EMOJIS.map(emoji => <button key={emoji} title={`تفاعل ${emoji}`} onClick={() => void toggleReaction(log.id, emoji)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-ink-100 dark:hover:bg-ink-800 ${mine === emoji ? 'bg-accent-500/15 ring-1 ring-accent-500/40' : ''}`}>{emoji}</button>)}</div><p className="mt-2 text-[11px] text-ink-500">تفاعل واحد لكل مدير. الضغط على ❤ مرة أخرى يزيل التفاعل.</p></div>}
        </article>;
      })}
    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}><div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-ink-900" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-lg font-extrabold">تفاصيل الإجراء</h3><button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="h-5 w-5" /></button></div><div className="mt-4 space-y-3 text-sm"><p><b>المدير:</b> {selected.admin_name}</p><p><b>العملية:</b> {actionLabels[selected.action] || selected.action}</p><p><b>القسم:</b> {targetLabels[selected.target_type] || selected.target_type}</p><p><b>العنصر:</b> {selected.target_id || '—'}</p><p><b>الوصف:</b> {selected.description}</p><p><b>التاريخ:</b> {new Date(selected.created_at).toLocaleString('ar')}</p>{selected.target_type === 'content' && !['settings','ads'].includes(selected.target_id) && <a href={`/#${encodeURIComponent(selected.target_id)}`} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-accent-500 px-3 py-2 text-xs font-bold text-ink-950">فتح القسم في الموقع</a>}{selected.details && <pre className="overflow-auto rounded-xl bg-ink-950 p-3 text-xs text-green-300" dir="ltr">{JSON.stringify(selected.details, null, 2)}</pre>}</div></div></div>}
  </div>;
}
