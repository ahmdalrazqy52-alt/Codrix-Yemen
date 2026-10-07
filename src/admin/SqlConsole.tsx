import { useState } from 'react';
import { Database, Loader2, Play, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function SqlConsole({ isOwner }: { isOwner: boolean }) {
  const [sql, setSql] = useState('select id, name, email, created_at from contact_messages order by created_at desc limit 20');
  const [rows, setRows] = useState<unknown[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true); setError(''); setRows([]);
    const query = sql.trim();
    if (!/^(select|with|explain)\b/i.test(query) || /;|\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|comment|refresh|vacuum|analyze)\b/i.test(query)) {
      setError('المختبر يسمح فقط باستعلامات القراءة SELECT / WITH / EXPLAIN، وبدون أوامر تغيير أو أكثر من جملة واحدة.');
      setBusy(false); return;
    }
    const { data, error: rpcError } = await supabase.rpc('admin_execute_readonly_sql', { p_sql: query });
    if (rpcError) setError(rpcError.message);
    else setRows(Array.isArray(data) ? data : []);
    setBusy(false);
  };

  if (!isOwner) return <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center dark:border-ink-800 dark:bg-ink-900"><ShieldAlert className="mx-auto h-10 w-10 text-amber-500" /><h2 className="mt-4 text-lg font-black">هذه الميزة متاحة لمالك الموقع فقط</h2><p className="mt-2 text-sm text-ink-500">لأسباب أمنية، مختبر SQL لا يظهر للمدراء العاديين.</p></div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" /><div><h2 className="font-black">مختبر قاعدة البيانات — قراءة آمنة</h2><p className="mt-1 text-xs leading-6 text-ink-500 dark:text-ink-400">يمكن للمالك/المدير تنفيذ استعلامات القراءة لرؤية النتائج فعلياً. تم منع أوامر INSERT/UPDATE/DELETE/DDL من الواجهة لتقليل خطر إتلاف الموقع.</p></div></div>
      </div>
      <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        <div className="mb-3 flex items-center gap-2"><Database className="h-5 w-5 text-accent-500" /><h3 className="font-extrabold">SQL</h3></div>
        <textarea value={sql} onChange={(e) => setSql(e.target.value)} dir="ltr" spellCheck={false} className="min-h-48 w-full rounded-xl border border-ink-200 bg-ink-950 p-4 font-mono text-sm text-white outline-none focus:border-accent-500 dark:border-ink-700" />
        <button onClick={() => void run()} disabled={busy} className="mt-3 flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-ink-950 disabled:opacity-60"><Play className="h-4 w-4" />{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ? 'جارٍ التنفيذ...' : 'تنفيذ الاستعلام'}</button>
      </div>
      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-300">{error}</div>}
      <div className="overflow-auto rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
        {rows.length ? <table className="min-w-full text-right text-xs"><thead className="border-b border-ink-200 dark:border-ink-800"><tr>{Object.keys((rows[0] || {}) as object).map((key) => <th key={key} className="whitespace-nowrap px-4 py-3 font-black">{key}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className="border-b border-ink-100 last:border-0 dark:border-ink-800">{Object.keys((rows[0] || {}) as object).map((key) => <td key={key} className="max-w-sm px-4 py-3 align-top whitespace-pre-wrap break-words">{typeof (row as Record<string, unknown>)[key] === 'object' ? JSON.stringify((row as Record<string, unknown>)[key]) : String((row as Record<string, unknown>)[key] ?? '')}</td>)}</tr>)}</tbody></table> : <div className="p-10 text-center text-sm text-ink-400">لا توجد نتائج لعرضها.</div>}
      </div>
    </div>
  );
}
