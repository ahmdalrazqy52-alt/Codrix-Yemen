import { useState } from 'react';
import { Database, Loader2, Play, ShieldAlert, Terminal, Eye, PencilLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'read' | 'write';
export function SqlConsole({ isOwner }: { isOwner: boolean }) {
  const [mode, setMode] = useState<Mode>('read');
  const [sql, setSql] = useState('select id, name, email, created_at from contact_messages order by created_at desc limit 20');
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const run = async () => {
    setBusy(true); setError(''); setNotice(''); setResult(null);
    const query = sql.trim();
    if (!query || query.includes(';') || /--|\/\*|\*\//.test(query)) {
      setError('اكتب جملة SQL واحدة فقط، دون فواصل منقوطة أو تعليقات.');
      setBusy(false); return;
    }
    if (mode === 'read') {
      if (!/^(select|with|explain)\b/i.test(query) || /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|comment|refresh|vacuum|analyze)\b/i.test(query)) {
        setError('وضع القراءة يقبل SELECT / WITH / EXPLAIN فقط.');
        setBusy(false); return;
      }
      const { data, error: rpcError } = await supabase.rpc('admin_execute_readonly_sql', { p_sql: query });
      if (rpcError) setError(rpcError.message);
      else setResult(Array.isArray(data) ? data : []);
    } else {
      if (!/^(insert|update|delete)\b/i.test(query) || /\b(drop|alter|create|truncate|grant|revoke|comment|refresh|vacuum|analyze|call|do|copy|execute|prepare)\b/i.test(query) || /\breturning\b/i.test(query)) {
        setError('وضع التعديل يقبل INSERT / UPDATE / DELETE فقط، دون RETURNING أو DDL. استخدم القراءة لمعاينة البيانات أولاً.');
        setBusy(false); return;
      }
      if (!window.confirm('تحذير: هذا الأمر سيغيّر قاعدة البيانات فعليًا. هل راجعت الجدول والشرط WHERE وتريد المتابعة؟')) {
        setBusy(false); return;
      }
      const { data, error: rpcError } = await supabase.rpc('admin_execute_sql', { p_sql: query });
      if (rpcError) setError(rpcError.message);
      else { setResult(data); setNotice('اكتمل تنفيذ الأمر على قاعدة البيانات.'); }
    }
    setBusy(false);
  };

  if (!isOwner) return <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center dark:border-ink-800 dark:bg-ink-900"><ShieldAlert className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-4 text-lg font-black">هذه الميزة متاحة لمالك الموقع فقط</h2><p className="mt-2 text-sm text-ink-500">لا تظهر واجهة SQL للمدراء العاديين، ويظل بإمكانهم استخدام أدوات الإدارة المعتادة.</p></div>;

  const rows = Array.isArray(result) ? result as Record<string, unknown>[] : null;
  return <div className="space-y-5 pb-44">
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><div><h2 className="font-black">مختبر قاعدة البيانات — المالك فقط</h2><p className="mt-1 text-xs leading-6 text-ink-500 dark:text-ink-400">ابدأ بوضع القراءة لمعاينة البيانات. وضع التعديل ينفذ INSERT/UPDATE/DELETE فعليًا، مع منع مخططات النظام والجداول الحساسة وDDL، ويطلب تأكيدًا قبل التنفيذ. خذ نسخة احتياطية قبل التغييرات المهمة.</p></div></div>
    </div>
    <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Database className="h-5 w-5 text-accent-500" /><h3 className="font-extrabold">نتائج الاستعلام</h3></div><div className="flex gap-2"><button onClick={() => setMode('read')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${mode === 'read' ? 'bg-mint-500 text-ink-950' : 'bg-ink-100 dark:bg-ink-800'}`}><Eye className="h-4 w-4" />قراءة آمنة</button><button onClick={() => setMode('write')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${mode === 'write' ? 'bg-amber-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800'}`}><PencilLine className="h-4 w-4" />تعديل البيانات</button></div></div>
      {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</div>}
      {notice && <div className="mb-3 rounded-xl bg-mint-500/10 p-3 text-sm text-mint-700 dark:text-mint-300">{notice}</div>}
      {rows && <div className="mb-4 max-h-96 overflow-auto rounded-xl border border-ink-200 dark:border-ink-700">{rows.length ? <table className="min-w-full text-right text-xs"><thead className="sticky top-0 bg-ink-100 dark:bg-ink-800"><tr>{Object.keys(rows[0] || {}).map(key => <th key={key} className="whitespace-nowrap px-4 py-3 font-black">{key}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-t border-ink-100 dark:border-ink-800">{Object.keys(rows[0] || {}).map(key => <td key={key} className="max-w-sm px-4 py-3 align-top whitespace-pre-wrap break-words">{typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}</td>)}</tr>)}</tbody></table> : <p className="p-8 text-center text-sm text-ink-500">الاستعلام اكتمل ولا توجد صفوف.</p>}</div>}
      {result !== null && !rows && <pre className="mb-4 max-h-96 overflow-auto rounded-xl bg-ink-950 p-4 text-sm text-green-300" dir="ltr">{JSON.stringify(result, null, 2)}</pre>}
    </div>
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-6xl overflow-hidden rounded-2xl border border-green-900/80 bg-black shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-green-900/60 bg-ink-950 px-4 py-2 text-xs text-green-300"><span className="flex items-center gap-2"><Terminal className="h-4 w-4" /> codrix@database:~$ {mode === 'read' ? 'READ ONLY' : 'WRITE MODE'}</span><span>{mode === 'read' ? 'قراءة فقط' : 'تغيير مباشر للبيانات'}</span></div>
      <textarea value={sql} onChange={e => setSql(e.target.value)} dir="ltr" spellCheck={false} aria-label="SQL command" className="min-h-28 w-full resize-y bg-black p-4 font-mono text-sm text-green-300 outline-none placeholder:text-green-900" placeholder={mode === 'read' ? 'SELECT ...' : 'UPDATE public.site_content SET ... WHERE ...'} />
      <div className="flex items-center justify-between gap-3 border-t border-green-900/60 px-4 py-3"><span className="text-[11px] text-green-700">{mode === 'write' ? 'لا تستخدم UPDATE/DELETE بدون WHERE. التنفيذ لا يمكن التراجع عنه تلقائيًا.' : 'أوامر القراءة لا تغيّر البيانات.'}</span><button onClick={() => void run()} disabled={busy} className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black disabled:opacity-60 ${mode === 'write' ? 'bg-amber-400' : 'bg-green-400'}`}><Play className="h-4 w-4" />{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ? 'جارٍ التنفيذ...' : 'تنفيذ'}</button></div>
    </div>
  </div>;
}
