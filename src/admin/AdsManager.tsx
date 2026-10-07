import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, GripVertical, Calendar, Layout } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FileUpload } from './FileUpload';

type AdItem = {
  id: string;
  slot: 'hero' | 'bottom';
  slot_id: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  link_url: string;
  duration: number;
  active: boolean;
  sort_order: number;
  valid_until: string | null;
};

type AdSlot = {
  id: string;
  name: string;
  location: string;
  width: string;
  height: string;
  active: boolean;
  sort_order: number;
};

export function AdsManager({ userId, onLog }: { userId: string; onLog: (action: string, targetId: string, desc: string) => void }) {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin');

  const loadAds = useCallback(async () => {
    setLoading(true);
    const [{ data: adData }, { data: slotData }] = await Promise.all([
      supabase.from('ad_items').select('*').order('slot', { ascending: false }).order('sort_order'),
      supabase.from('ad_slots').select('*').order('sort_order'),
    ]);
    setAds((adData as AdItem[]) || []);
    setSlots((slotData as AdSlot[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadAds(); }, [loadAds]);

  const detectMediaType = (url: string): 'image' | 'video' => {
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) return 'video';
    return 'image';
  };

  const addAd = (slot: 'hero' | 'bottom') => {
    const newAd: AdItem = {
      id: `temp-${Date.now()}`,
      slot,
      slot_id: null,
      media_type: 'image',
      media_url: '',
      link_url: '#',
      duration: 5,
      active: true,
      sort_order: ads.filter((a) => a.slot === slot).length,
      valid_until: null,
    };
    setAds([...ads, newAd]);
  };

  const addAdToSlot = (slotId: string) => {
    const newAd: AdItem = {
      id: `temp-${Date.now()}`,
      slot: 'hero',
      slot_id: slotId,
      media_type: 'image',
      media_url: '',
      link_url: '#',
      duration: 5,
      active: true,
      sort_order: ads.filter((a) => a.slot_id === slotId).length,
      valid_until: null,
    };
    setAds([...ads, newAd]);
  };

  const updateAd = (id: string, patch: Partial<AdItem>) => {
    setAds(ads.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAd = (id: string) => {
    setAds(ads.filter((a) => a.id !== id));
  };

  const moveAd = (id: string, dir: -1 | 1) => {
    const idx = ads.findIndex((a) => a.id === id);
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= ads.length) return;
    const next = [...ads];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((a, i) => { a.sort_order = i; });
    setAds(next);
  };

  // Slot management
  const addSlot = async () => {
    const newSlot = {
      name: 'مساحة جديدة',
      location: 'after-hero',
      width: 'full',
      height: '200px',
      active: true,
      sort_order: slots.length,
      created_by: userId,
    };
    const { data, error } = await supabase.from('ad_slots').insert(newSlot).select().single();
    if (!error && data) {
      setSlots([...slots, data as AdSlot]);
      onLog('create', 'ad-slot', `إنشاء مساحة إعلانية: ${newSlot.name}`);
    }
  };

  const updateSlot = async (id: string, patch: Partial<AdSlot>) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const saveSlot = async (slot: AdSlot) => {
    const { error } = await supabase.from('ad_slots').update({
      name: slot.name,
      location: slot.location,
      width: slot.width,
      height: slot.height,
      active: slot.active,
      sort_order: slot.sort_order,
      updated_at: new Date().toISOString(),
    }).eq('id', slot.id);
    if (!error) {
      onLog('update', 'ad-slot', `تعديل مساحة: ${slot.name}`);
      setNotice('تم حفظ المساحة.');
      setTimeout(() => setNotice(''), 3000);
    }
  };

  const deleteSlot = async (id: string) => {
    await supabase.from('ad_items').delete().eq('slot_id', id);
    await supabase.from('ad_slots').delete().eq('id', id);
    setSlots(slots.filter((s) => s.id !== id));
    onLog('delete', 'ad-slot', 'حذف مساحة إعلانية');
    void loadAds();
  };

  const save = async () => {
    setSaving(true);
    setNotice('');
    try {
      const persistedIds: string[] = [];
      for (const ad of ads) {
        if (!ad.media_url) continue;
        const payload = {
          slot: ad.slot,
          slot_id: ad.slot_id,
          media_type: detectMediaType(ad.media_url),
          media_url: ad.media_url,
          link_url: ad.link_url || '#',
          duration: Math.max(2, ad.duration || 5),
          active: ad.active,
          sort_order: ad.sort_order,
          valid_until: ad.valid_until || null,
          created_by: userId,
        };
        if (ad.id.startsWith('temp-')) {
          const { data, error } = await supabase.from('ad_items').insert(payload).select('id').single();
          if (error) throw error;
          persistedIds.push(data.id);
          onLog('create', 'ad', data.id, `إضافة إعلان في ${ad.slot_id ? 'مساحة مخصصة' : ad.slot === 'hero' ? 'الواجهة' : 'الشريط السفلي'}`);
        } else {
          const { error } = await supabase.from('ad_items').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', ad.id);
          if (error) throw error;
          persistedIds.push(ad.id);
          onLog('update', 'ad', ad.id, 'تعديل إعلان');
        }
      }

      const { data: dbAds, error: listError } = await supabase.from('ad_items').select('id');
      if (listError) throw listError;
      const toDelete = (dbAds || []).map((d) => d.id).filter((id) => !persistedIds.includes(id));
      if (toDelete.length) {
        const { error } = await supabase.from('ad_items').delete().in('id', toDelete);
        if (error) throw error;
        toDelete.forEach((id) => onLog('delete', 'ad', id, 'حذف إعلان'));
      }

      setNotice('تم حفظ الإعلانات بنجاح.');
      await loadAds();
    } catch (error) {
      setNotice(error instanceof Error ? `تعذر حفظ الإعلانات: ${error.message}` : 'تعذر حفظ الإعلانات.');
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const heroAds = ads.filter((a) => a.slot === 'hero' && !a.slot_id);
  const bottomAds = ads.filter((a) => a.slot === 'bottom' && !a.slot_id);

  const inputCls = 'w-full rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-accent-500 dark:border-ink-700 dark:bg-ink-950 dark:text-white';

  const renderAdCard = (ad: AdItem) => (
    <div key={ad.id} className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-900/40">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-ink-600 dark:text-ink-300"><GripVertical className="h-4 w-4 text-ink-400" />{ad.media_type === 'video' ? 'فيديو' : 'صورة'}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => moveAd(ad.id, -1)} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"><ChevronUp className="h-4 w-4" /></button>
          <button type="button" onClick={() => moveAd(ad.id, 1)} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"><ChevronDown className="h-4 w-4" /></button>
          <button type="button" onClick={() => removeAd(ad.id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="space-y-3">
        <FileUpload
          label="الصورة أو الفيديو"
          value={ad.media_url}
          onChange={(url) => updateAd(ad.id, { media_url: url, media_type: detectMediaType(url) })}
          accept="image/*,video/*"
          folder="ads"
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">الرابط عند النقر</span>
          <input value={ad.link_url} onChange={(e) => updateAd(ad.id, { link_url: e.target.value })} dir="ltr" className={inputCls} placeholder="https://..." />
        </label>
        {ad.media_type === 'image' && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink-700 dark:text-ink-200">مدة العرض (ثواني)</span>
            <input type="number" min={2} max={60} value={ad.duration} onChange={(e) => updateAd(ad.id, { duration: parseInt(e.target.value) || 5 })} className={inputCls} />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink-700 dark:text-ink-200"><Calendar className="h-4 w-4" />مدة صلاحية الإعلان</span>
          <select
            value={ad.valid_until ? String(Math.max(1, Math.round((new Date(ad.valid_until).getTime() - Date.now()) / 86400000))) : ''}
            onChange={(e) => updateAd(ad.id, { valid_until: e.target.value ? new Date(Date.now() + Number(e.target.value) * 86400000).toISOString() : null })}
            className={inputCls}
          >
            <option value="">بدون انتهاء</option>
            <option value="1">يوم واحد</option>
            <option value="3">3 أيام</option>
            <option value="7">7 أيام</option>
            <option value="14">14 يوماً</option>
            <option value="30">30 يوماً</option>
            <option value="60">60 يوماً</option>
            <option value="90">90 يوماً</option>
          </select>
          <span className="mt-1 block text-[11px] text-ink-400">يمكن تعديل التاريخ بدقة من خلال خيار مخصص أدناه.</span>
          <input type="date" value={ad.valid_until ? ad.valid_until.split('T')[0] : ''} onChange={(e) => updateAd(ad.id, { valid_until: e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : null })} className={`${inputCls} mt-2`} />
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-2.5 dark:border-ink-700 dark:bg-ink-950">
          <span className="text-sm font-bold text-ink-700 dark:text-ink-200">مفعّل</span>
          <button type="button" onClick={() => updateAd(ad.id, { active: !ad.active })} className={`relative h-6 w-11 rounded-full transition-colors ${ad.active ? 'bg-accent-500' : 'bg-ink-300 dark:bg-ink-700'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ad.active ? 'right-0.5' : 'right-5'}`} />
          </button>
        </label>
      </div>
    </div>
  );

  const locationLabels: Record<string, string> = {
    'after-hero': 'بعد الواجهة الرئيسية',
    'after-services': 'بعد الخدمات',
    'after-work': 'بعد الأعمال',
    'after-team': 'بعد الفريق',
    'after-testimonials': 'بعد آراء العملاء',
    'before-contact': 'قبل التواصل',
    'after-contact': 'بعد التواصل',
  };

  const widthLabels: Record<string, string> = {
    'full': 'كامل العرض',
    'half': 'نصف العرض',
    'third': 'ثُلث العرض',
    'quarter': 'رُبع العرض',
  };

  return (
    <div className="space-y-6">
      {notice && <div className="rounded-xl border border-mint-500/20 bg-mint-500/10 px-4 py-3 text-sm font-semibold text-mint-700 dark:text-mint-300">{notice}</div>}

      <div className="flex gap-2 rounded-xl bg-ink-100 p-1 dark:bg-ink-900">
        <button onClick={() => setTab('builtin')} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${tab === 'builtin' ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white' : 'text-ink-500'}`}>المساحات الأساسية</button>
        <button onClick={() => setTab('custom')} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${tab === 'custom' ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-800 dark:text-white' : 'text-ink-500'}`}>مساحات مخصصة</button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-ink-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : tab === 'builtin' ? (
        <>
          <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold">المساحة الإعلانية في الواجهة الرئيسية</h3>
              <button onClick={() => addAd('hero')} className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-ink-950 hover:bg-accent-400"><Plus className="h-4 w-4" />إضافة إعلان</button>
            </div>
            <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">يتم التبديل تلقائياً بين الإعلانات مع دعم التمرير. الصور تستمر بحسب المدة، والفيديوهات حتى انتهائها.</p>
            <div className="space-y-3">{heroAds.map(renderAdCard)}</div>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold">الشريط الإعلاني السفلي</h3>
              <button onClick={() => addAd('bottom')} className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-ink-950 hover:bg-accent-400"><Plus className="h-4 w-4" />إضافة إعلان</button>
            </div>
            <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">يظهر في أسفل الشاشة بعرض كامل. يمكن للمستخدم التمرير بين الإعلانات أو إغلاق الشريط.</p>
            <div className="space-y-3">{bottomAds.map(renderAdCard)}</div>
          </div>

          <button onClick={() => void save()} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 text-sm font-bold text-ink-950 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'جارٍ الحفظ...' : 'حفظ جميع الإعلانات'}
          </button>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-extrabold"><Layout className="h-5 w-5 text-accent-500" />المساحات الإعلانية المخصصة</h3>
              <button onClick={() => void addSlot()} className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-ink-950 hover:bg-accent-400"><Plus className="h-4 w-4" />إنشاء مساحة</button>
            </div>
            <p className="mb-4 text-sm text-ink-500 dark:text-ink-400">أنشئ مساحات إعلانية في مواقع مختلفة من الموقع وحدد حجمها، ثم أضف إعلانات لكل مساحة.</p>

            {slots.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-ink-300 p-10 text-center text-sm text-ink-500 dark:border-ink-700">لا توجد مساحات مخصصة بعد. اضغط «إنشاء مساحة» للبدء.</div>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <div key={slot.id} className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-900/40">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-bold text-ink-600 dark:text-ink-300"><Layout className="h-4 w-4 text-accent-500" />{slot.name}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => void saveSlot(slot)} className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-bold text-ink-950">حفظ</button>
                        <button onClick={() => void deleteSlot(slot.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-ink-600 dark:text-ink-300">اسم المساحة</span>
                        <input value={slot.name} onChange={(e) => updateSlot(slot.id, { name: e.target.value })} className={inputCls} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-ink-600 dark:text-ink-300">الموقع في الموقع</span>
                        <select value={slot.location} onChange={(e) => updateSlot(slot.id, { location: e.target.value })} className={inputCls}>
                          {Object.entries(locationLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-ink-600 dark:text-ink-300">العرض</span>
                        <select value={slot.width} onChange={(e) => updateSlot(slot.id, { width: e.target.value })} className={inputCls}>
                          {Object.entries(widthLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-ink-600 dark:text-ink-300">الارتفاع</span>
                        <input value={slot.height} onChange={(e) => updateSlot(slot.id, { height: e.target.value })} dir="ltr" className={inputCls} placeholder="200px" />
                      </label>
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 dark:border-ink-700 dark:bg-ink-950">
                      <span className="text-xs font-bold text-ink-700 dark:text-ink-200">المساحة مفعّلة</span>
                      <button type="button" onClick={() => updateSlot(slot.id, { active: !slot.active })} className={`relative h-5 w-10 rounded-full transition-colors ${slot.active ? 'bg-accent-500' : 'bg-ink-300 dark:bg-ink-700'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${slot.active ? 'right-0.5' : 'right-5'}`} />
                      </button>
                    </label>

                    {/* Ads in this slot */}
                    <div className="mt-4 border-t border-ink-200 pt-3 dark:border-ink-700">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-500 dark:text-ink-400">الإعلانات في هذه المساحة</span>
                        <button onClick={() => addAdToSlot(slot.id)} className="flex items-center gap-1 rounded-lg bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300"><Plus className="h-3 w-3" />إضافة</button>
                      </div>
                      <div className="space-y-3">
                        {ads.filter((a) => a.slot_id === slot.id).map(renderAdCard)}
                        {ads.filter((a) => a.slot_id === slot.id).length === 0 && <p className="text-xs text-ink-400">لا توجد إعلانات بعد.</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => void save()} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 text-sm font-bold text-ink-950 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'جارٍ الحفظ...' : 'حفظ جميع الإعلانات'}
          </button>
        </>
      )}
    </div>
  );
}
