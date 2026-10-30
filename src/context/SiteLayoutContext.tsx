import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export const DEFAULT_SECTION_ORDER = ['hero','services','features','process','work','team','testimonials','cta','faq','contact','reviews'];
export const SECTION_LABELS: Record<string,string> = { hero:'الرئيسية', services:'الخدمات', features:'المميزات', process:'آلية العمل', work:'الأعمال', team:'الفريق', testimonials:'آراء العملاء', cta:'الدعوة لاتخاذ إجراء', faq:'الأسئلة الشائعة', contact:'التواصل', reviews:'التقييمات' };
type LayoutValue = { order: string[]; hidden: string[]; loading: boolean; saveLayout: (order: string[], hidden: string[]) => Promise<string | null> };
const Context = createContext<LayoutValue | null>(null);
export function SiteLayoutProvider({ children }: { children: ReactNode }) {
  const [order,setOrder] = useState(DEFAULT_SECTION_ORDER);
  const [hidden,setHidden] = useState<string[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data } = await supabase.from('site_layout').select('section_order, hidden_sections').eq('id','default').maybeSingle();
      if (!alive) return;
      if (Array.isArray(data?.section_order)) {
        const valid = (data.section_order as string[]).filter(x => DEFAULT_SECTION_ORDER.includes(x));
        setOrder([...valid, ...DEFAULT_SECTION_ORDER.filter(x => !valid.includes(x))]);
      }
      if (Array.isArray(data?.hidden_sections)) setHidden((data.hidden_sections as string[]).filter(x => DEFAULT_SECTION_ORDER.includes(x)));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);
  const saveLayout = useCallback(async (nextOrder: string[], nextHidden: string[]) => {
    const { error } = await supabase.from('site_layout').upsert({ id:'default', section_order: nextOrder, hidden_sections: nextHidden, updated_at: new Date().toISOString() });
    if (error) return error.message;
    setOrder(nextOrder); setHidden(nextHidden); return null;
  },[]);
  return <Context.Provider value={{order,hidden,loading,saveLayout}}>{children}</Context.Provider>;
}
export function useSiteLayout() {
  const value = useContext(Context);
  if (!value) throw new Error('useSiteLayout must be used within SiteLayoutProvider');
  return value;
}
