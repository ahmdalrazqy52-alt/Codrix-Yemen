import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type LogEntry = {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  description: string;
  created_at: string;
};

type Reaction = {
  id: string;
  log_id: string;
  admin_id: string;
  emoji: string;
};

const EMOJIS = ['👍', '❤️', '👏', '🔥', '😮', '✅'];

const actionLabels: Record<string, string> = {
  create: 'إضافة',
  update: 'تعديل',
  delete: 'حذف',
};

const actionColors: Record<string, string> = {
  create: 'bg-mint-500/15 text-mint-600 dark:text-mint-300',
  update: 'bg-accent-500/15 text-accent-600 dark:text-accent-300',
  delete: 'bg-red-500/15 text-red-600 dark:text-red-300',
};

const targetLabels: Record<string, string> = {
  content: 'محتوى',
  ad: 'إعلان',
  admin: 'مدير',
  message: 'رسالة',
  profile: 'ملف شخصي',
};

export function ActivityLog({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: logRows }, { data: reactionRows }] = await Promise.all([
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('log_reactions').select('*'),
    ]);
    setLogs((logRows as LogEntry[]) || []);
    setReactions((reactionRows as Reaction[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleReaction = async (logId: string, emoji: string) => {
    const existing = reactions.find((r) => r.log_id === logId && r.admin_id === userId && r.emoji === emoji);
    if (existing) {
      await supabase.from('log_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('log_reactions').insert({ log_id: logId, admin_id: userId, emoji });
    }
    void load();
  };

  const reactionsForLog = (logId: string) => reactions.filter((r) => r.log_id === logId);
  const myReaction = (logId: string, emoji: string) => reactions.some((r) => r.log_id === logId && r.admin_id === userId && r.emoji === emoji);
  const emojiCounts = (logId: string) => {
    const counts: Record<string, number> = {};
    for (const r of reactionsForLog(logId)) {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    }
    return counts;
  };

  if (loading) {
    return <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-400" /></div>;
  }

  if (logs.length === 0) {
    return <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-sm text-ink-500 dark:border-ink-800 dark:bg-ink-900">لا توجد سجلات بعد.</div>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const counts = emojiCounts(log.id);
        const hasReactions = Object.keys(counts).length > 0;
        return (
          <div key={log.id} className="rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${actionColors[log.action] || 'bg-ink-100 text-ink-500'}`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                  <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[10px] font-bold text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                    {targetLabels[log.target_type] || log.target_type}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">{log.description}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <span className="font-bold text-ink-700 dark:text-ink-300">{log.admin_name}</span>
                  <span>·</span>
                  <time>{new Date(log.created_at).toLocaleString('ar')}</time>
                </div>
              </div>
            </div>
            {hasReactions && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(counts).map(([emoji, count]) => (
                  <span key={emoji} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${myReaction(log.id, emoji) ? 'bg-accent-500/15 ring-1 ring-accent-500/30' : 'bg-ink-100 dark:bg-ink-800'}`}>
                    {emoji} <span className="font-bold">{count}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1 border-t border-ink-100 pt-3 dark:border-ink-800">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => void toggleReaction(log.id, emoji)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition-transform hover:scale-110 ${myReaction(log.id, emoji) ? 'bg-accent-500/15 ring-1 ring-accent-500/30' : 'hover:bg-ink-100 dark:hover:bg-ink-800'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
