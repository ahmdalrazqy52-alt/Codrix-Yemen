import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { defaultContent, type AllContent, type SectionName } from '@/content-types';

const SiteContentContext = createContext<AllContent>(defaultContent);

function deepMerge<T>(base: T, override: unknown): T {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return base;
  if (typeof override !== 'object' || override === null || Array.isArray(override)) return base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const baseVal = (base as Record<string, unknown>)[key];
    const overVal = (override as Record<string, unknown>)[key];
    if (Array.isArray(baseVal) && Array.isArray(overVal)) {
      result[key] = overVal;
    } else if (typeof baseVal === 'object' && baseVal !== null && !Array.isArray(baseVal) && typeof overVal === 'object' && overVal !== null) {
      result[key] = deepMerge(baseVal, overVal);
    } else if (typeof overVal === 'string' || typeof overVal === 'number' || typeof overVal === 'boolean') {
      result[key] = overVal;
    }
  }
  return result as T;
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<AllContent>(defaultContent);

  useEffect(() => {
    let active = true;
    const loadContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('section, content');
      if (!active || !data) return;
      const next: AllContent = { ...defaultContent };
      for (const row of data) {
        const section = row.section as SectionName;
        if (section in defaultContent) {
          (next as Record<string, unknown>)[section] = deepMerge(
            (defaultContent as Record<string, unknown>)[section],
            row.content,
          );
        }
      }
      setContent(next);
    };
    void loadContent();
    return () => { active = false; };
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}

export function useSiteSettings() {
  return useContext(SiteContentContext).settings;
}
