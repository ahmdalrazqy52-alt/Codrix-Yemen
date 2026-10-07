import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, Eye, Loader2, Maximize2, Palette, Redo2, RotateCcw,
  Save, SlidersHorizontal, Undo2, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DesignRule } from '@/context/DesignContext';

type Props = { userId: string; onLog: (action: string, targetId: string, desc: string) => void };
type Snapshot = DesignRule[];

const fields: Array<{ key: string; label: string; type?: 'text' | 'color' }> = [
  { key: 'color', label: 'لون النص', type: 'color' },
  { key: 'background-color', label: 'لون الخلفية', type: 'color' },
  { key: 'font-size', label: 'حجم الخط' },
  { key: 'font-weight', label: 'سماكة الخط' },
  { key: 'line-height', label: 'ارتفاع السطر' },
  { key: 'letter-spacing', label: 'تباعد الأحرف' },
  { key: 'text-align', label: 'محاذاة النص' },
  { key: 'border-radius', label: 'استدارة الحواف' },
  { key: 'padding', label: 'الحشو الداخلي' },
  { key: 'margin', label: 'الهامش الخارجي' },
  { key: 'width', label: 'العرض' },
  { key: 'height', label: 'الارتفاع' },
  { key: 'opacity', label: 'الشفافية' },
  { key: 'display', label: 'طريقة العرض' },
  { key: 'gap', label: 'المسافة بين العناصر' },
  { key: 'justify-content', label: 'محاذاة أفقية' },
  { key: 'align-items', label: 'محاذاة عمودية' },
  { key: 'border', label: 'الإطار' },
  { key: 'box-shadow', label: 'الظل' },
  { key: 'transform', label: 'التحويل' },
];

function cloneRules(rules: DesignRule[]): DesignRule[] {
  return rules.map((r) => ({ selector: r.selector, styles: { ...r.styles }, ...(typeof r.text === 'string' ? { text: r.text } : {}) }));
}

function selectorFor(el: Element, doc: Document): string {
  const designKey = el.getAttribute('data-design-key');
  if (designKey) return `[data-design-key="${CSS.escape(designKey)}"]`;
  if ((el as HTMLElement).id) {
    const id = (el as HTMLElement).id;
    if (doc.querySelectorAll(`#${CSS.escape(id)}`).length === 1) return `#${CSS.escape(id)}`;
  }
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== doc.body && parts.length < 7) {
    let part = node.tagName.toLowerCase();
    const classes = Array.from(node.classList).filter((c) => /^[A-Za-z_-][A-Za-z0-9_-]*$/.test(c)).slice(0, 3);
    if (classes.length) part += classes.map((c) => `.${CSS.escape(c)}`).join('');
    const parent = node.parentElement;
    if (parent) {
      const same = Array.from(parent.children).filter((child) => child.tagName === node!.tagName);
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`;
    }
    parts.unshift(part);
    const candidate = parts.join(' > ');
    try { if (doc.querySelectorAll(candidate).length === 1) return candidate; } catch { /* continue */ }
    node = parent;
  }
  return parts.join(' > ');
}

function groupSelectorFor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList).filter((c) => /^[A-Za-z_-][A-Za-z0-9_-]*$/.test(c)).slice(0, 4);
  return tag + classes.map((c) => `.${CSS.escape(c)}`).join('');
}

export function DesignStudio({ userId, onLog }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [rules, setRules] = useState<DesignRule[]>([]);
  const [selected, setSelected] = useState<{ selector: string; tag: string; text: string; groupSelector: string } | null>(null);
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState('');
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const selectedRule = useMemo(() => rules.find((r) => r.selector === selected?.selector), [rules, selected]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.from('site_design').select('rules').eq('id', 'default').maybeSingle();
      if (!active) return;
      setRules(Array.isArray(data?.rules) ? cloneRules(data.rules as DesignRule[]) : []);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    setStyles({ ...(selectedRule?.styles || {}) });
    setTextValue(selectedRule?.text || '');
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    try { doc.querySelectorAll('.codrix-editor-hover').forEach((e) => e.classList.remove('codrix-editor-hover')); } catch { /* ignore */ }
  }, [selected?.selector]);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const onLoad = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      const style = doc.createElement('style');
      // تم إضافة pointer-events: none للروابط والأزرار لمنعها من العمل كموقع حقيقي
      style.textContent = `
        .codrix-editor-selected{outline:3px solid #06b6d4 !important;outline-offset:3px !important;}
        .codrix-editor-hover{outline:2px dashed #10b981 !important;outline-offset:2px !important;}
        a, button, input, select, textarea { pointer-events: none !important; cursor: default !important; }
      `;
      doc.head.appendChild(style);

      const mouseOver = (event: Event) => {
        const target = event.target as Element | null;
        if (!target || target === doc.body || target.closest('[data-editor-ignore]')) return;
        target.classList.add('codrix-editor-hover');
      };
      const mouseOut = (event: Event) => (event.target as Element | null)?.classList.remove('codrix-editor-hover');
      const click = (event: Event) => {
        const target = event.target as Element | null;
        if (!target || target === doc.body || target.closest('[data-editor-ignore]')) return;
        event.preventDefault(); 
        event.stopPropagation();
        
        doc.querySelectorAll('.codrix-editor-selected').forEach((e) => e.classList.remove('codrix-editor-selected'));
        const selector = selectorFor(target, doc);
        target.classList.add('codrix-editor-selected');
        setSelected({ selector, tag: target.tagName.toLowerCase(), text: (target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120), groupSelector: groupSelectorFor(target) });
      };
      doc.addEventListener('mouseover', mouseOver, true);
      doc.addEventListener('mouseout', mouseOut, true);
      doc.addEventListener('click', click, true);
      return () => {
        doc.removeEventListener('mouseover', mouseOver, true);
        doc.removeEventListener('mouseout', mouseOut, true);
        doc.removeEventListener('click', click, true);
      };
    };
    frame.addEventListener('load', onLoad);
    if (frame.contentDocument?.readyState === 'complete') onLoad();
    return () => frame.removeEventListener('load', onLoad);
  }, []);

  const applyToPreview = (nextRules: DesignRule[]) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.getElementById('codrix-live-editor-styles')?.remove();
    const style = doc.createElement('style');
    style.id = 'codrix-live-editor-styles';
    style.textContent = nextRules.map((rule) => `${rule.selector}{${Object.entries(rule.styles).map(([k, v]) => `${k}:${v};`).join('')}}`).join('\n');
    doc.head.appendChild(style);
    nextRules.forEach((rule) => { if (typeof rule.text === 'string') { try { doc.querySelectorAll(rule.selector).forEach((el) => { if (!el.children.length) el.textContent = rule.text!; }); } catch { /* ignore */ } } });
  };

  const commit = (nextRules: DesignRule[]) => {
    setHistory((h) => [...h.slice(-29), cloneRules(rules)]);
    setFuture([]);
    setRules(cloneRules(nextRules));
    applyToPreview(nextRules);
  };

  const updateSelectedStyle = (key: string, value: string) => {
    if (!selected) return;
    const next = cloneRules(rules);
    const existing = next.find((r) => r.selector === selected.selector);
    if (value) {
      if (existing) existing.styles[key] = value;
      else next.push({ selector: selected.selector, styles: { [key]: value } });
    } else if (existing) {
      delete existing.styles[key];
      if (!Object.keys(existing.styles).length) next.splice(next.indexOf(existing), 1);
    }
    setStyles((old) => ({ ...old, [key]: value }));
    commit(next);
  };


  const resetSelected = () => {
    if (!selected) return;
    commit(rules.filter((r) => r.selector !== selected.selector));
    setStyles({});
  };

  const updateText = (value: string) => {
    if (!selected) return;
    const next = cloneRules(rules);
    const existing = next.find((r) => r.selector === selected.selector);
    if (existing) existing.text = value;
    else next.push({ selector: selected.selector, styles: {}, text: value });
    setTextValue(value);
    commit(next);
  };

  const applyToSimilar = () => {
    if (!selected) return;
    const next = cloneRules(rules);
    const existing = next.find((r) => r.selector === selected.groupSelector);
    if (existing) existing.styles = { ...styles };
    else next.push({ selector: selected.groupSelector, styles: { ...styles } });
    commit(next);
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setFuture((f) => [cloneRules(rules), ...f].slice(0, 30));
    setHistory((h) => h.slice(0, -1));
    setRules(cloneRules(previous)); applyToPreview(previous);
  };

  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((h) => [...h.slice(-29), cloneRules(rules)]);
    setFuture((f) => f.slice(1));
    setRules(cloneRules(next)); applyToPreview(next);
  };

  const save = async () => {
    setSaving(true); setNotice('');
    const { error } = await supabase.from('site_design').upsert({ id: 'default', rules, updated_by: userId, updated_at: new Date().toISOString() });
    if (error) setNotice(`تعذر الحفظ: ${error.message}`);
    else { setNotice('تم حفظ التصميم بنجاح.'); onLog('update', 'default', 'حفظ تعديلات التصميم والمظهر'); }
    setSaving(false);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const frameClass = previewWidth === 'desktop' ? 'w-full' : previewWidth === 'tablet' ? 'mx-auto w-[768px] max-w-full' : 'mx-auto w-[390px] max-w-full';

  if (loading) return <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center dark:border-ink-800 dark:bg-ink-900"><Loader2 className="mx-auto h-7 w-7 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      {notice && <div className="flex items-center gap-2 rounded-xl border border-mint-500/20 bg-mint-500/10 px-4 py-3 text-sm font-bold text-mint-700 dark:text-mint-300"><Check className="h-4 w-4" />{notice}</div>}
      <div className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-lg font-black"><Palette className="h-5 w-5 text-accent-500" />استوديو التصميم المرئي</h2><p className="mt-1 text-xs text-ink-500 dark:text-ink-400">اضغط على أي جزء من الموقع داخل المعاينة لتحديده ثم عدّل خصائصه مباشرة.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={undo} disabled={!history.length} className="rounded-lg border border-ink-200 p-2 disabled:opacity-30 dark:border-ink-700" title="تراجع"><Undo2 className="h-4 w-4" /></button>
            <button onClick={redo} disabled={!future.length} className="rounded-lg border border-ink-200 p-2 disabled:opacity-30 dark:border-ink-700" title="إعادة"><Redo2 className="h-4 w-4" /></button>
            <button onClick={resetSelected} disabled={!selected} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-ink-700"><RotateCcw className="h-3.5 w-3.5" />إرجاع الأصل</button>
            <button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-ink-950 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'جارٍ الحفظ...' : 'حفظ التصميم'}</button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 p-3 dark:border-ink-800 dark:bg-ink-950">
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-white p-2 dark:bg-ink-900">
            <div className="flex items-center gap-1"><Eye className="mr-1 h-4 w-4 text-ink-400" /><span className="text-xs font-bold">معاينة حية</span></div>
            <div className="flex gap-1">
              {(['desktop', 'tablet', 'mobile'] as const).map((mode) => <button key={mode} onClick={() => setPreviewWidth(mode)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${previewWidth === mode ? 'bg-accent-500 text-ink-950' : 'text-ink-500'}`}>{mode === 'desktop' ? 'سطح المكتب' : mode === 'tablet' ? 'لوحي' : 'جوال'}</button>)}
              <button onClick={() => iframeRef.current?.contentWindow?.location.reload()} className="rounded-lg p-1.5 text-ink-500" title="تحديث"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex min-h-[720px] justify-center overflow-auto rounded-xl bg-white dark:bg-ink-900">
            <iframe ref={iframeRef} title="معاينة الموقع" src="/" className={`${frameClass} min-h-[720px] border-0 bg-white`} />
          </div>
        </div>

        <aside className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
          {!selected ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-ink-400"><SlidersHorizontal className="h-10 w-10" /><h3 className="mt-4 font-bold text-ink-700 dark:text-ink-200">لم تحدد عنصراً</h3><p className="mt-2 max-w-xs text-xs leading-6">اضغط على عنوان أو نص أو صورة أو زر أو بطاقة أو أي عنصر في المعاينة لفتح إعداداته.</p></div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl bg-accent-500/10 p-4"><div className="text-[11px] font-bold text-accent-700 dark:text-accent-300">العنصر المحدد</div><div className="mt-1 text-sm font-black">{selected.tag}</div>{selected.text && <div className="mt-2 line-clamp-3 text-xs text-ink-500">{selected.text}</div>}<div className="mt-2 break-all font-mono text-[10px] text-ink-400">{selected.selector}</div></div>
              {['h1','h2','h3','h4','h5','h6','p','span','a','button','label'].includes(selected.tag) && (
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-ink-600 dark:text-ink-300">النص / المحتوى</span><textarea value={textValue} onChange={(e) => updateText(e.target.value)} rows={4} className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs dark:border-ink-700 dark:bg-ink-950" /></label>
              )}
              <div className="grid gap-3">
                {fields.map((field) => <label key={field.key} className="block"><span className="mb-1.5 block text-xs font-bold text-ink-600 dark:text-ink-300">{field.label}</span>{field.type === 'color' ? <div className="flex gap-2"><input type="color" value={styles[field.key] || '#000000'} onChange={(e) => updateSelectedStyle(field.key, e.target.value)} className="h-10 w-12 rounded-lg border border-ink-200 bg-transparent p-1 dark:border-ink-700" /><input value={styles[field.key] || ''} onChange={(e) => updateSelectedStyle(field.key, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-ink-50 px-3 text-xs dark:border-ink-700 dark:bg-ink-950" placeholder="#000000" /></div> : <input value={styles[field.key] || ''} onChange={(e) => updateSelectedStyle(field.key, e.target.value)} className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs dark:border-ink-700 dark:bg-ink-950" placeholder="مثال: 24px" dir={field.key.includes('size') || field.key === 'line-height' || field.key === 'letter-spacing' || field.key === 'padding' || field.key === 'margin' || field.key === 'width' || field.key === 'height' ? 'ltr' : undefined} />}</label>)}
              </div>
              <button onClick={applyToSimilar} className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-xs font-bold text-accent-700 dark:text-accent-300"><Maximize2 className="h-4 w-4" />تطبيق نفس الإعدادات على العناصر المماثلة</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => updateSelectedStyle('display', 'none')} className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-300">إخفاء العنصر</button>
                <button onClick={() => updateSelectedStyle('display', '')} className="rounded-xl border border-ink-200 px-3 py-2.5 text-xs font-bold text-ink-600 dark:border-ink-700 dark:text-ink-200">إظهار العنصر</button>
              </div>
              <button onClick={() => setSelected(null)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-100 px-4 py-3 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-200"><X className="h-4 w-4" />إلغاء التحديد</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
