import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type DesignRule = {
  selector: string;
  styles: Record<string, string>;
  text?: string;
};

type DesignContextValue = {
  rules: DesignRule[];
  loading: boolean;
};

const DesignContext = createContext<DesignContextValue>({ rules: [], loading: true });

function sanitizeCssValue(value: string): string {
  return value.replace(/[{}<>]/g, '').trim();
}

function buildCss(rules: DesignRule[]): string {
  return rules.map((rule) => {
    const declarations = Object.entries(rule.styles)
      .filter(([key, value]) => /^[a-z-]+$/.test(key) && value)
      .map(([key, value]) => `${key}:${sanitizeCssValue(value)};`)
      .join('');
    return declarations ? `${rule.selector}{${declarations}}` : '';
  }).join('\n');
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<DesignRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.from('site_design').select('rules').eq('id', 'default').maybeSingle();
      if (!active) return;
      if (data?.rules && Array.isArray(data.rules)) setRules(data.rules as DesignRule[]);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const id = 'codrix-site-design';
    document.getElementById(id)?.remove();
    if (!rules.length) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = buildCss(rules);
    document.head.appendChild(style);
    return () => document.getElementById(id)?.remove();
  }, [rules]);

  useEffect(() => {
    for (const rule of rules) {
      if (typeof rule.text !== 'string') continue;
      try { document.querySelectorAll(rule.selector).forEach((el) => { if (!el.children.length) el.textContent = rule.text!; }); } catch { /* invalid selector from old data */ }
    }
  }, [rules]);

  const value = useMemo(() => ({ rules, loading }), [rules, loading]);
  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign() {
  return useContext(DesignContext);
}
