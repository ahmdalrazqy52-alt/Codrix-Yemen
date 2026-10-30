import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Eye,
  Loader2,
  Maximize2,
  Palette,
  Redo2,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Undo2,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DesignRule } from '@/context/DesignContext';
import { useSiteLayout, SECTION_LABELS } from '@/context/SiteLayoutContext';

type Props = {
  userId: string;
  onLog: (action: string, targetId: string, desc: string) => void;
};

type Snapshot = DesignRule[];

const fields: Array<{
  key: string;
  label: string;
  type?: 'text' | 'color';
}> = [
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
  return rules.map((rule) => ({
    selector: rule.selector,
    styles: { ...rule.styles },
    ...(typeof rule.text === 'string'
      ? { text: rule.text }
      : {}),
  }));
}

export function DesignStudio({
  userId,
  onLog,
}: Props) {
  const { order: savedOrder, hidden: savedHidden, saveLayout } = useSiteLayout();
  const [layoutOrder, setLayoutOrder] = useState<string[]>(savedOrder);
  const [layoutHidden, setLayoutHidden] = useState<string[]>(savedHidden);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [layoutNotice, setLayoutNotice] = useState('');
  useEffect(() => { setLayoutOrder(savedOrder); setLayoutHidden(savedHidden); }, [savedOrder, savedHidden]);
  const moveSection = (id: string, direction: -1 | 1) => {
    const index = layoutOrder.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= layoutOrder.length) return;
    const next = [...layoutOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setLayoutOrder(next);
  };
  const persistLayout = async () => {
    const error = await saveLayout(layoutOrder, layoutHidden);
    if (error) setLayoutNotice(`تعذر حفظ ترتيب الأقسام: ${error}`);
    else { setLayoutNotice('تم حفظ ترتيب الأقسام وظهورها.'); onLog('update', 'site-layout', 'حفظ ترتيب الأقسام وظهورها'); }
  };
  const iframeRef =
    useRef<HTMLIFrameElement>(null);

  const [rules, setRules] =
    useState<DesignRule[]>([]);

  // أحدث نسخة من القواعد لاستخدامها عند تحميل iframe.
  const rulesRef = useRef<DesignRule[]>([]);
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);

  const [selected, setSelected] =
    useState<{
      selector: string;
      tag: string;
      text: string;
      groupSelector: string;
      canEditText: boolean;
    } | null>(null);

  const [styles, setStyles] =
    useState<Record<string, string>>({});

  const [textValue, setTextValue] =
    useState('');

  const [history, setHistory] =
    useState<Snapshot[]>([]);

  const [future, setFuture] =
    useState<Snapshot[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [notice, setNotice] =
    useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');

  const [previewWidth, setPreviewWidth] =
    useState<
      'desktop' | 'tablet' | 'mobile'
    >('desktop');

  const selectedRule = useMemo(
    () =>
      rules.find(
        (rule) =>
          rule.selector ===
          selected?.selector
      ),
    [rules, selected]
  );

  /*
   * تحميل التصميم المحفوظ
   */
  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } =
        await supabase
          .from('site_design')
          .select('rules')
          .eq('id', 'default')
          .maybeSingle();

      if (!active) return;

      setRules(
        Array.isArray(data?.rules)
          ? cloneRules(
              data.rules as DesignRule[]
            )
          : []
      );

      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  /*
   * تحديث لوحة الخصائص عند اختيار عنصر.
   * لا نصل إلى DOM الخاص بالـ iframe مباشرة لأن sandbox يعزله.
   */
  useEffect(() => {
    if (!selected) {
      setStyles({});
      setTextValue('');
      return;
    }

    setStyles({ ...(selectedRule?.styles || {}) });
    setTextValue(selectedRule?.text ?? selected.text ?? '');
  }, [selected, selectedRule]);

  /*
   * لا نعتمد على وجود iframe عند تنفيذ effect؛ فالمعاينة لا تُرسم
   * إلا بعد انتهاء تحميل قواعد التصميم. هذا كان يمنع تسجيل مستمع الرسائل
   * نهائياً، وبالتالي لا تصل اختيارات العناصر إلى لوحة الخصائص.
   */
  const sendRulesToPreview = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'codrix:apply-rules', rules: rulesRef.current },
      '*'
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const message = event.data;
      if (!message || typeof message !== 'object') return;

      if (message.type === 'codrix:preview-ready') {
        sendRulesToPreview();
        return;
      }

      if (message.type === 'codrix:element-selected') {
        const item = message.element;
        if (!item || typeof item.selector !== 'string' || typeof item.tag !== 'string') return;
        setSelected({
          selector: item.selector,
          tag: item.tag,
          text: typeof item.text === 'string' ? item.text : '',
          groupSelector: typeof item.groupSelector === 'string' ? item.groupSelector : item.tag,
          canEditText: item.canEditText !== false,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /*
   * إرسال تغييرات التصميم إلى المعاينة.
   * تطبيق CSS والنصوص يتم داخل صفحة المعاينة نفسها.
   */
  const applyToPreview = (nextRules: DesignRule[]) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'codrix:apply-rules', rules: nextRules },
      '*'
    );
  };

  /*
   * تسجيل تعديل في Undo history.
   */
  const commit = (
    nextRules: DesignRule[]
  ) => {
    setHistory((history) => [
      ...history.slice(-29),
      cloneRules(rules),
    ]);

    setFuture([]);

    const cloned =
      cloneRules(nextRules);

    setRules(cloned);

    applyToPreview(cloned);
  };

  /*
   * تعديل خاصية.
   */
  const updateSelectedStyle = (
    key: string,
    value: string
  ) => {
    if (!selected) return;

    const next =
      cloneRules(rules);

    const existing =
      next.find(
        (rule) =>
          rule.selector ===
          selected.selector
      );

    if (value) {
      if (existing) {
        existing.styles[key] =
          value;
      } else {
        next.push({
          selector:
            selected.selector,
          styles: {
            [key]: value,
          },
        });
      }
    } else if (existing) {
      delete existing.styles[key];

      if (
        !Object.keys(
          existing.styles
        ).length
      ) {
        next.splice(
          next.indexOf(existing),
          1
        );
      }
    }

    setStyles((old) => ({
      ...old,
      [key]: value,
    }));

    commit(next);
  };

  /*
   * إرجاع العنصر للوضع الأصلي.
   */
  const resetSelected = () => {
    if (!selected) return;

    commit(
      rules.filter(
        (rule) =>
          rule.selector !==
          selected.selector
      )
    );

    setStyles({});
    setTextValue('');
  };

  /*
   * تعديل النص.
   */
  const updateText = (
    value: string
  ) => {
    if (!selected) return;

    const next =
      cloneRules(rules);

    const existing =
      next.find(
        (rule) =>
          rule.selector ===
          selected.selector
      );

    if (existing) {
      existing.text = value;
    } else {
      next.push({
        selector:
          selected.selector,
        styles: {},
        text: value,
      });
    }

    setTextValue(value);

    commit(next);
  };

  /*
   * تطبيق نفس الإعدادات
   * على العناصر المماثلة.
   */
  const applyToSimilar = () => {
    if (!selected) return;

    const next =
      cloneRules(rules);

    const existing =
      next.find(
        (rule) =>
          rule.selector ===
          selected.groupSelector
      );

    if (existing) {
      existing.styles = {
        ...styles,
      };
    } else {
      next.push({
        selector:
          selected.groupSelector,
        styles: {
          ...styles,
        },
      });
    }

    commit(next);
  };

  /*
   * Undo.
   */
  const undo = () => {
    const previous =
      history[history.length - 1];

    if (!previous) return;

    setFuture((future) => [
      cloneRules(rules),
      ...future,
    ].slice(0, 30));

    setHistory((history) =>
      history.slice(0, -1)
    );

    const restored =
      cloneRules(previous);

    setRules(restored);

    applyToPreview(restored);
  };

  /*
   * Redo.
   */
  const redo = () => {
    const next = future[0];

    if (!next) return;

    setHistory((history) => [
      ...history.slice(-29),
      cloneRules(rules),
    ]);

    setFuture((future) =>
      future.slice(1)
    );

    const restored =
      cloneRules(next);

    setRules(restored);

    applyToPreview(restored);
  };

  /*
   * حفظ التصميم في Supabase.
   */
  const save = async () => {
    setSaving(true);
    setNotice('');

    const { error } =
      await supabase
        .from('site_design')
        .upsert({
          id: 'default',
          rules,
          updated_by: userId,
          updated_at:
            new Date().toISOString(),
        });

    if (error) {
      setNotice(
        `تعذر الحفظ: ${error.message}`
      );
    } else {
      setNotice(
        'تم حفظ التصميم بنجاح.'
      );

      onLog(
        'update',
        'default',
        'حفظ تعديلات التصميم والمظهر'
      );
    }

    setSaving(false);

    window.setTimeout(
      () => setNotice(''),
      4000
    );
  };


  const generateCopy = async (action: 'improve' | 'description') => {
    if (!selected) return;
    setAiBusy(true); setAiError('');
    const { data, error } = await supabase.functions.invoke('generate-copy', {
      body: { action, text: textValue || selected.text, context: selected.text || selected.tag, language: 'ar' },
    });
    if (error || !data?.text) setAiError(data?.error || error?.message || 'تعذر توليد النص. تحقق من إعداد دالة الذكاء الاصطناعي ومفتاح API.');
    else updateText(String(data.text));
    setAiBusy(false);
  };

  const themePresets = [
    { id: 'ocean', label: 'المحيط', primary: '#06b6d4', secondary: '#10b981', font: 'Cairo' },
    { id: 'royal', label: 'ملكي', primary: '#8b5cf6', secondary: '#ec4899', font: 'Cairo' },
    { id: 'sunset', label: 'غروب', primary: '#f97316', secondary: '#ef4444', font: 'Tajawal' },
    { id: 'forest', label: 'الغابة', primary: '#16a34a', secondary: '#84cc16', font: 'Tajawal' },
    { id: 'minimal', label: 'هادئ', primary: '#475569', secondary: '#0ea5e9', font: 'Cairo' },
  ];

  const applyBrandColor = (color: string) => {
    const next = cloneRules(rules).filter(r => ![':root', '.bg-accent-500', '.text-accent-500', '.border-accent-500', 'button.bg-accent-500'].includes(r.selector));
    next.push({ selector: ':root', styles: { '--codrix-primary': color, '--codrix-secondary': color } });
    next.push({ selector: '.bg-accent-500', styles: { 'background-color': `${color} !important` } });
    next.push({ selector: '.text-accent-500', styles: { color: `${color} !important` } });
    next.push({ selector: '.border-accent-500', styles: { 'border-color': `${color} !important` } });
    commit(next);
  };

  const applyThemePreset = (preset: typeof themePresets[number]) => {
    const next = cloneRules(rules).filter(r => ![':root', '.bg-accent-500', '.text-accent-500', '.border-accent-500', 'body'].includes(r.selector));
    next.push({ selector: ':root', styles: { '--codrix-primary': preset.primary, '--codrix-secondary': preset.secondary } });
    next.push({ selector: '.bg-accent-500', styles: { 'background-color': `${preset.primary} !important` } });
    next.push({ selector: '.text-accent-500', styles: { color: `${preset.primary} !important` } });
    next.push({ selector: '.border-accent-500', styles: { 'border-color': `${preset.primary} !important` } });
    next.push({ selector: 'body', styles: { 'font-family': `"${preset.font}", "Tajawal", sans-serif` } });
    commit(next);
    setNotice(`تم تطبيق سمة ${preset.label}. اضغط «حفظ التصميم» لتثبيتها.`);
  };

  const frameClass =
    previewWidth === 'desktop'
      ? 'w-full'
      : previewWidth === 'tablet'
        ? 'mx-auto w-[768px] max-w-full'
        : 'mx-auto w-[390px] max-w-full';

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-12 text-center dark:border-ink-800 dark:bg-ink-900">
        <Loader2 className="mx-auto h-7 w-7 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-mint-500/20 bg-mint-500/10 px-4 py-3 text-sm font-bold text-mint-700 dark:text-mint-300">
          <Check className="h-4 w-4" />
          {notice}
        </div>
      )}

      <section className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-extrabold">ترتيب الأقسام وإظهارها</h3><p className="mt-1 text-xs text-ink-500">اسحب القسم لترتيبه أو استخدم الأسهم. يمكنك إخفاء أي قسم وإعادته لاحقًا.</p></div><button onClick={() => void persistLayout()} className="rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-extrabold text-ink-950">حفظ ترتيب الموقع</button></div>
        {layoutNotice && <p className="mt-3 rounded-lg bg-mint-500/10 p-2 text-xs font-bold text-mint-700 dark:text-mint-300">{layoutNotice}</p>}
        <div className="mt-4 space-y-2">{layoutOrder.map((id,index) => <div key={id} draggable onDragStart={() => setDraggedSection(id)} onDragOver={e => e.preventDefault()} onDrop={() => { if (draggedSection && draggedSection !== id) { const next = [...layoutOrder]; const from = next.indexOf(draggedSection); const to = next.indexOf(id); next.splice(from,1); next.splice(to,0,draggedSection); setLayoutOrder(next); } setDraggedSection(null); }} className={`flex items-center gap-2 rounded-xl border p-2 ${draggedSection === id ? 'border-accent-500 bg-accent-500/10' : 'border-ink-200 dark:border-ink-700'}`}>
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-400" />
          <span className="flex-1 text-sm font-bold">{SECTION_LABELS[id] || id}</span>
          <button aria-label="تحريك للأعلى" onClick={() => moveSection(id,-1)} disabled={index===0} className="rounded-md p-1.5 hover:bg-ink-100 disabled:opacity-25 dark:hover:bg-ink-800"><ChevronUp className="h-4 w-4" /></button>
          <button aria-label="تحريك للأسفل" onClick={() => moveSection(id,1)} disabled={index===layoutOrder.length-1} className="rounded-md p-1.5 hover:bg-ink-100 disabled:opacity-25 dark:hover:bg-ink-800"><ChevronDown className="h-4 w-4" /></button>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!layoutHidden.includes(id)} onChange={e => setLayoutHidden(old => e.target.checked ? old.filter(x => x !== id) : [...old,id])} />ظاهر</label>
        </div>)}</div>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-extrabold">هوية الموقع والثيمات</h3><p className="mt-1 text-xs text-ink-500">اختر سمة جاهزة أو غيّر اللون الرئيسي ثم احفظ التصميم.</p></div>
          <label className="flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2 dark:border-ink-700">
            <span className="text-xs font-bold">اللون الرئيسي</span>
            <input aria-label="اللون الرئيسي للموقع" type="color" defaultValue="#06b6d4" onChange={e => applyBrandColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {themePresets.map(preset => <button key={preset.id} onClick={() => applyThemePreset(preset)} className="flex items-center gap-2 rounded-xl border border-ink-200 p-3 text-xs font-bold hover:border-accent-500 dark:border-ink-700"><span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full"><i className="h-full w-1/2" style={{ background: preset.primary }} /><i className="h-full w-1/2" style={{ background: preset.secondary }} /></span>{preset.label}</button>)}
        </div>
      </section>

      <div className="rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Palette className="h-5 w-5 text-accent-500" />
              استوديو التصميم المرئي
            </h2>

            <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
              اضغط على أي جزء من الموقع داخل المعاينة لتحديده ثم عدّل خصائصه مباشرة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              onClick={undo}
              disabled={!history.length}
              className="rounded-lg border border-ink-200 p-2 disabled:opacity-30 dark:border-ink-700"
              title="تراجع"
            >
              <Undo2 className="h-4 w-4" />
            </button>

            <button
              onClick={redo}
              disabled={!future.length}
              className="rounded-lg border border-ink-200 p-2 disabled:opacity-30 dark:border-ink-700"
              title="إعادة"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            <button
              onClick={resetSelected}
              disabled={!selected}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-xs font-bold disabled:opacity-40 dark:border-ink-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              إرجاع الأصل
            </button>

            <button
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-ink-950 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving
                ? 'جارٍ الحفظ...'
                : 'حفظ التصميم'}
            </button>

          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">

        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 p-3 dark:border-ink-800 dark:bg-ink-950">

          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-white p-2 dark:bg-ink-900">

            <div className="flex items-center gap-1">
              <Eye className="mr-1 h-4 w-4 text-ink-400" />
              <span className="text-xs font-bold">
                معاينة حية
              </span>
            </div>

            <div className="flex gap-1">

              {(
                [
                  'desktop',
                  'tablet',
                  'mobile',
                ] as const
              ).map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    setPreviewWidth(mode)
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    previewWidth === mode
                      ? 'bg-accent-500 text-ink-950'
                      : 'text-ink-500'
                  }`}
                >
                  {mode === 'desktop'
                    ? 'سطح المكتب'
                    : mode === 'tablet'
                      ? 'لوحي'
                      : 'جوال'}
                </button>
              ))}

            </div>
          </div>

          <div className="flex min-h-[720px] justify-center overflow-auto rounded-xl bg-white dark:bg-ink-900">

            <iframe
              ref={iframeRef}
              title="معاينة الموقع"
              src="/?editorPreview=1"
              sandbox="allow-scripts"
              loading="eager"
              onLoad={sendRulesToPreview}
              className={`${frameClass} min-h-[720px] border-0 bg-white`}
            />

          </div>
        </div>

        <aside className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">

          {!selected ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-ink-400">

              <SlidersHorizontal className="h-10 w-10" />

              <h3 className="mt-4 font-bold text-ink-700 dark:text-ink-200">
                لم تحدد عنصراً
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-6">
                اضغط على عنوان أو نص أو صورة أو زر أو بطاقة أو أي عنصر في المعاينة لفتح إعداداته.
              </p>

            </div>
          ) : (

            <div className="space-y-5">

              <div className="rounded-xl bg-accent-500/10 p-4">

                <div className="text-[11px] font-bold text-accent-700 dark:text-accent-300">
                  العنصر المحدد
                </div>

                <div className="mt-1 text-sm font-black">
                  {selected.tag}
                </div>

                {selected.text && (
                  <div className="mt-2 line-clamp-3 text-xs text-ink-500">
                    {selected.text}
                  </div>
                )}

                <div className="mt-2 break-all font-mono text-[10px] text-ink-400">
                  {selected.selector}
                </div>

              </div>

              {[
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'span',
                'a',
                'button',
                'label',
              ].includes(selected.tag) && selected.canEditText && (

                <label className="block">

                  <span className="mb-1.5 block text-xs font-bold text-ink-600 dark:text-ink-300">
                    النص / المحتوى
                  </span>

                  <textarea
                    value={textValue}
                    onChange={(event) =>
                      updateText(
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs dark:border-ink-700 dark:bg-ink-950"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button type="button" disabled={aiBusy} onClick={() => void generateCopy('improve')} className="rounded-lg bg-accent-500/10 px-3 py-2 text-[11px] font-bold text-accent-700 disabled:opacity-50 dark:text-accent-300">{aiBusy ? 'جارٍ التوليد...' : '✨ حسّن هذا النص'}</button>
                    <button type="button" disabled={aiBusy} onClick={() => void generateCopy('description')} className="rounded-lg bg-mint-500/10 px-3 py-2 text-[11px] font-bold text-mint-700 disabled:opacity-50 dark:text-mint-300">اكتب وصفًا للخدمة</button>
                  </div>
                  {aiError && <p className="mt-2 text-xs text-red-500">{aiError}</p>}
                </label>
              )}

              <div className="grid gap-3">

                {fields.map((field) => (

                  <label
                    key={field.key}
                    className="block"
                  >

                    <span className="mb-1.5 block text-xs font-bold text-ink-600 dark:text-ink-300">
                      {field.label}
                    </span>

                    {field.type === 'color' ? (

                      <div className="flex gap-2">

                        <input
                          type="color"
                          value={
                            styles[
                              field.key
                            ] || '#000000'
                          }
                          onChange={(event) =>
                            updateSelectedStyle(
                              field.key,
                              event.target.value
                            )
                          }
                          className="h-10 w-12 rounded-lg border border-ink-200 bg-transparent p-1 dark:border-ink-700"
                        />

                        <input
                          value={
                            styles[
                              field.key
                            ] || ''
                          }
                          onChange={(event) =>
                            updateSelectedStyle(
                              field.key,
                              event.target.value
                            )
                          }
                          className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-ink-50 px-3 text-xs dark:border-ink-700 dark:bg-ink-950"
                          placeholder="#000000"
                        />

                      </div>

                    ) : (

                      <input
                        value={
                          styles[
                            field.key
                          ] || ''
                        }
                        onChange={(event) =>
                          updateSelectedStyle(
                            field.key,
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs dark:border-ink-700 dark:bg-ink-950"
                        placeholder="مثال: 24px"
                        dir={
                          field.key.includes(
                            'size'
                          ) ||
                          field.key ===
                            'line-height' ||
                          field.key ===
                            'letter-spacing' ||
                          field.key ===
                            'padding' ||
                          field.key ===
                            'margin' ||
                          field.key ===
                            'width' ||
                          field.key ===
                            'height'
                            ? 'ltr'
                            : undefined
                        }
                      />

                    )}

                  </label>

                ))}

              </div>

              <button
                onClick={applyToSimilar}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 text-xs font-bold text-accent-700 dark:text-accent-300"
              >
                <Maximize2 className="h-4 w-4" />
                تطبيق نفس الإعدادات على العناصر المماثلة
              </button>

              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    updateSelectedStyle(
                      'display',
                      'none'
                    )
                  }
                  className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-300"
                >
                  إخفاء العنصر
                </button>

                <button
                  onClick={() =>
                    updateSelectedStyle(
                      'display',
                      ''
                    )
                  }
                  className="rounded-xl border border-ink-200 px-3 py-2.5 text-xs font-bold text-ink-600 dark:border-ink-700 dark:text-ink-200"
                >
                  إظهار العنصر
                </button>

              </div>

              <button
                onClick={() =>
                  setSelected(null)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-100 px-4 py-3 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-200"
              >
                <X className="h-4 w-4" />
                إلغاء التحديد
              </button>

            </div>

          )}

        </aside>
      </div>
    </div>
  );
}