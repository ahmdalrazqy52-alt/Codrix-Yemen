import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Experiment = { id: string; name: string; target: 'hero_title'|'hero_primary_cta'|'hero_secondary_cta'; variant_a: string; variant_b: string; active: boolean; created_at: string };
type EventRow = { experiment_id: string; variant: 'a'|'b'; event_type: 'impression'|'click'; visitor_id: string };
const TARGETS = [{ id:'hero_title', label:'عنوان الواجهة' }, { id:'hero_primary_cta', label:'زر التواصل الرئيسي' }, { id:'hero_secondary_cta', label:'زر الأعمال الثانوي' }] as const;
export function ABTestingManager({ userId, onLog }: { userId: string; onLog: (action: string, targetId: string, desc: string) => void }) {
  const [items,setItems] = useState<Experiment[]>([]);
  const [events,setEvents] = useState<EventRow[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [name,setName] = useState('');
  const [target,setTarget] = useState<Experiment['target']>('hero_title');
  const [a,setA] = useState('');
  const [b,setB] = useState('');
  const [busy,setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [{data: experiments,error: e1},{data: metrics,error: e2}] = await Promise.all([
      supabase.from('site_experiments').select('*').order('created_at',{ascending:false}),
      supabase.from('site_experiment_events').select('experiment_id,variant,event_type,visitor_id'),
    ]);
    if (e1) setError(`تعذر تحميل التجارب: ${e1.message}`);
    else setItems((experiments || []) as Experiment[]);
    if (e2) setError(old => old || `تعذر تحميل إحصاءات التجارب: ${e2.message}`);
    setEvents((metrics || []) as EventRow[]);
    setLoading(false);
  },[]);
  useEffect(() => { void load(); },[load]);
  const save = async () => {
    if (!name.trim() || !a.trim() || !b.trim()) { setError('أدخل اسم التجربة والنصين A وB.'); return; }
    setBusy(true); setError('');
    const {data,error:saveError} = await supabase.from('site_experiments').insert({name:name.trim(),target,variant_a:a.trim(),variant_b:b.trim(),active:false,created_by:userId}).select().single();
    if (saveError) setError(saveError.message);
    else { setName('');setA('');setB('');setNotice('تم إنشاء التجربة. فعّلها لبدء القياس.');onLog('create',data.id,`إنشاء اختبار A/B: ${data.name}`);await load(); }
    setBusy(false);
  };
  const toggle = async (item: Experiment) => {
    if (!item.active) {
      const { error: deactivateError } = await supabase.from('site_experiments').update({ active: false, updated_at: new Date().toISOString() }).eq('target', item.target).eq('active', true);
      if (deactivateError) { setError(deactivateError.message); return; }
    }
    const {error:changeError} = await supabase.from('site_experiments').update({active:!item.active,updated_at:new Date().toISOString()}).eq('id',item.id);
    if (changeError) setError(changeError.message);
    else {onLog('update',item.id,`${!item.active?'تفعيل':'إيقاف'} اختبار A/B: ${item.name}`);await load();}
  };
  const remove = async (item: Experiment) => {
    if (!window.confirm(`حذف اختبار «${item.name}» وإحصاءاته؟`)) return;
    const {error:delError} = await supabase.from('site_experiments').delete().eq('id',item.id);
    if (delError) setError(delError.message);
    else {onLog('delete',item.id,`حذف اختبار A/B: ${item.name}`);await load();}
  };
  const stats = (id:string,variant:'a'|'b',kind:'impression'|'click') => new Set(events.filter(e=>e.experiment_id===id&&e.variant===variant&&e.event_type===kind).map(e=>e.visitor_id)).size;
  const input = 'w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-950';
  if (loading) return <div className="p-10 text-center">جارٍ تحميل التجارب...</div>;
  return <div className="space-y-5">
    <div className="rounded-2xl border border-accent-500/20 bg-accent-500/5 p-5"><div className="flex items-start gap-3"><FlaskConical className="h-6 w-6 text-accent-500"/><div><h2 className="font-black">اختبارات A/B</h2><p className="mt-1 text-sm leading-6 text-ink-500">قارن عنوان الواجهة أو نصوص الأزرار. يخصص النظام نسخة ثابتة للزائر ويقيس المشاهدات والنقرات لكل نسخة؛ النقر على زر التواصل مؤشر تحويل أولي وليس ضمانًا لجودة العميل.</p></div></div></div>
    {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}{notice&&<p className="rounded-xl bg-mint-500/10 p-3 text-sm text-mint-700 dark:text-mint-300">{notice}</p>}
    <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"><h3 className="font-extrabold">إنشاء تجربة جديدة</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><input className={input} value={name} onChange={e=>setName(e.target.value)} placeholder="اسم التجربة، مثال: عنوان أكثر وضوحًا"/><select className={input} value={target} onChange={e=>setTarget(e.target.value as Experiment['target'])}>{TARGETS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select><label className="text-xs font-bold">النسخة A<textarea className={`${input} mt-1`} rows={3} value={a} onChange={e=>setA(e.target.value)} placeholder="النص الحالي أو البديل A"/></label><label className="text-xs font-bold">النسخة B<textarea className={`${input} mt-1`} rows={3} value={b} onChange={e=>setB(e.target.value)} placeholder="النص البديل B"/></label></div><button onClick={()=>void save()} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-extrabold text-ink-950"><Plus className="h-4 w-4"/>{busy?'جارٍ الحفظ...':'إنشاء التجربة'}</button></div>
    <div className="flex items-center justify-between"><h3 className="font-extrabold">التجارب والنتائج</h3><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold dark:border-ink-700"><RefreshCw className="h-4 w-4"/>تحديث</button></div>
    {!items.length?<div className="rounded-2xl border border-dashed border-ink-300 p-10 text-center text-sm text-ink-500">لم تنشئ أي تجربة بعد.</div>:items.map(item=><article key={item.id} className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-extrabold">{item.name}</h4><p className="mt-1 text-xs text-ink-500">{TARGETS.find(t=>t.id===item.target)?.label}</p></div><div className="flex gap-2"><button onClick={()=>void toggle(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${item.active?'bg-mint-500/15 text-mint-700 dark:text-mint-300':'bg-ink-100 dark:bg-ink-800'}`}>{item.active?'نشطة — إيقاف':'غير نشطة — تفعيل'}</button><button onClick={()=>void remove(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4"/></button></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{(['a','b'] as const).map(v=>{const im=stats(item.id,v,'impression');const clicks=stats(item.id,v,'click');return <div key={v} className="rounded-xl bg-ink-50 p-4 dark:bg-ink-950"><p className="text-xs font-black">النسخة {v.toUpperCase()}</p><p className="mt-2 whitespace-pre-wrap text-sm">{v==='a'?item.variant_a:item.variant_b}</p><div className="mt-4 flex items-center justify-between text-xs"><span>المشاهدات: <b>{im}</b></span><span>النقرات: <b>{clicks}</b></span><span>النسبة: <b>{im?`${(clicks/im*100).toFixed(1)}%`:'—'}</b></span></div></div>})}</div></article>)}
  </div>;
}
