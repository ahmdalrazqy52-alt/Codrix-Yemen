import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trash2, ExternalLink, FolderOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type MediaItem = { name: string; id?: string; updated_at?: string; created_at?: string; metadata?: { mimetype?: string; size?: number } | null; path: string; url: string; };
const FOLDERS = ['ads', 'content', 'services', 'team', 'reviews', 'avatars', ''];

export function MediaLibrary({ isOwner, onLog }: { isOwner: boolean; onLog?: (action: string, targetId: string, desc: string) => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folder, setFolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const all: MediaItem[] = [];
    const scan = async (prefix: string, depth: number) => {
      if (depth > 2) return;
      const { data, error: listError } = await supabase.storage.from('media').list(prefix || undefined, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (listError) { setError(`تعذر تحميل مكتبة الوسائط: ${listError.message}`); return; }
      for (const entry of data || []) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (!entry.id && !entry.metadata) { await scan(path, depth + 1); continue; }
        const { data: publicData } = supabase.storage.from('media').getPublicUrl(path);
        all.push({ ...entry, path, url: publicData.publicUrl });
      }
    };
    if (folder) await scan(folder, 0);
    else await scan('', 0);
    const unique = Array.from(new Map(all.map(x => [x.path, x])).values());
    setItems(unique); setLoading(false);
  }, [folder]);
  useEffect(() => { void load(); }, [load]);

  const remove = async (item: MediaItem) => {
    if (!isOwner) return;
    if (!window.confirm(`هل تريد حذف الملف «${item.name}» من مكتبة الوسائط؟ قد يتوقف ظهوره في الموقع إذا كان مستخدمًا.`)) return;
    const { error: removeError } = await supabase.storage.from('media').remove([item.path]);
    if (removeError) setError(`فشل الحذف: ${removeError.message}`);
    else { setItems(old => old.filter(x => x.path !== item.path)); onLog?.('delete', item.path, `حذف ملف وسائط: ${item.path}`); }
  };
  const filtered = items.filter(x => `${x.name} ${x.path}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم الملف..." className="min-w-[200px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900" />
      <select value={folder} onChange={e => setFolder(e.target.value)} className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"><option value="">كل المجلدات</option>{FOLDERS.filter(Boolean).map(f => <option key={f} value={f}>{f}</option>)}</select>
      <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-3 text-sm font-bold dark:border-ink-700"><RefreshCw className="h-4 w-4" /> تحديث</button>
    </div>
    {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</div>}
    {loading ? <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div> : !filtered.length ? <div className="rounded-2xl border border-dashed border-ink-300 p-12 text-center text-sm text-ink-500 dark:border-ink-700"><FolderOpen className="mx-auto mb-3 h-8 w-8" />لا توجد ملفات في هذا المجلد أو لا تملك صلاحية القراءة.</div> :
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(item => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(item.name) || item.metadata?.mimetype?.startsWith('video/');
        return <article key={item.path} className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="flex h-40 items-center justify-center bg-ink-100 dark:bg-ink-950">{isVideo ? <video src={item.url} className="h-full w-full object-contain" controls /> : <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-contain" />}</div>
          <div className="p-3"><p className="truncate text-sm font-bold" title={item.path}>{item.name}</p><p className="mt-1 truncate text-[11px] text-ink-500">{item.path}</p><div className="mt-3 flex gap-2"><a href={item.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-ink-100 py-2 text-xs font-bold dark:bg-ink-800"><ExternalLink className="h-3.5 w-3.5" /> فتح</a>{isOwner && <button onClick={() => void remove(item)} className="rounded-lg bg-red-500/10 px-3 py-2 text-red-600" aria-label="حذف الملف"><Trash2 className="h-4 w-4" /></button>}</div></div>
        </article>;
      })}</div>}
  </div>;
}
