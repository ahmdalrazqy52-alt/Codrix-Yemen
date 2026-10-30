import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ExperimentTarget = 'hero_title' | 'hero_primary_cta' | 'hero_secondary_cta';
type Experiment = { id: string; variant_a: string; variant_b: string; target: ExperimentTarget };

function visitorId() {
  const key = 'codrix-ab-visitor';
  let id = localStorage.getItem(key);
  if (!id) { id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; localStorage.setItem(key,id); }
  return id;
}
export function useABVariant(target: ExperimentTarget, fallback: string) {
  const [value,setValue] = useState(fallback);
  const [experiment,setExperiment] = useState<Experiment | null>(null);
  const [variant,setVariant] = useState<'a'|'b'|null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const {data} = await supabase.from('site_experiments').select('id,variant_a,variant_b,target').eq('target',target).eq('active',true).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if (!alive || !data) return;
      const exp = data as Experiment;
      const assignmentKey = `codrix-ab-${exp.id}`;
      let assigned = localStorage.getItem(assignmentKey) as 'a'|'b'|null;
      if (assigned !== 'a' && assigned !== 'b') { assigned = Math.random() < 0.5 ? 'a' : 'b'; localStorage.setItem(assignmentKey,assigned); }
      setExperiment(exp); setVariant(assigned); setValue(assigned === 'a' ? exp.variant_a : exp.variant_b);
      const impressionKey = `codrix-ab-seen-${exp.id}`;
      if (!sessionStorage.getItem(impressionKey)) {
        sessionStorage.setItem(impressionKey,'1');
        void supabase.from('site_experiment_events').insert({experiment_id:exp.id,variant:assigned,event_type:'impression',visitor_id:visitorId()});
      }
    })();
    return () => { alive = false; };
  },[target]);
  const trackClick = useCallback(() => {
    if (experiment && variant) void supabase.from('site_experiment_events').insert({experiment_id:experiment.id,variant,event_type:'click',visitor_id:visitorId()});
  },[experiment,variant]);
  return { value, trackClick, variant };
}
