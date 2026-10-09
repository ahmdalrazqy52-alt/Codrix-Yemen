import { ChevronUp, ChevronDown, Plus, Trash2, GripVertical } from 'lucide-react';
import { iconNames, getIcon } from '@/content-types';
import type { LucideIcon } from 'lucide-react';

const inputCls =
  'w-full rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-ink-700 dark:bg-ink-950 dark:text-white';

export function TextField({ label, value, onChange, placeholder, dir }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; dir?: 'rtl' | 'ltr';
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir} className={inputCls} />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputCls} resize-none leading-relaxed`} />
    </label>
  );
}

export function IconPicker({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const SelectedIcon = getIcon(value);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">{label}</span>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-300"><SelectedIcon className="h-5 w-5" /></span>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>{iconNames.map((n) => <option key={n} value={n}>{n}</option>)}</select>
      </div>
    </label>
  );
}

export function ToggleField({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-700 dark:bg-ink-950">
      <span className="text-sm font-bold text-ink-700 dark:text-ink-200">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-accent-500' : 'bg-ink-300 dark:bg-ink-700'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'right-0.5' : 'right-5'}`} />
      </button>
    </label>
  );
}

export function ListEditor<T>({ items, onChange, itemLabel, renderItem, newItem }: {
  items: T[]; onChange: (items: T[]) => void;
  itemLabel: (item: T, index: number) => string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  newItem: () => T;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const t = i + dir; if (t < 0 || t >= items.length) return;
    const next = [...items]; [next[i], next[t]] = [next[t], next[i]]; onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-900/40">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-bold text-ink-600 dark:text-ink-300"><GripVertical className="h-4 w-4 text-ink-400" />{itemLabel(item, i)}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 dark:hover:bg-ink-800"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 dark:hover:bg-ink-800"><ChevronDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => remove(i)} className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="space-y-3">{renderItem(item, (patch) => update(i, patch))}</div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 px-4 py-3 text-sm font-bold text-ink-500 transition-colors hover:border-accent-500 hover:text-accent-600 dark:border-ink-700 dark:text-ink-400 dark:hover:border-accent-500 dark:hover:text-accent-300"><Plus className="h-4 w-4" />إضافة عنصر جديد</button>
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
