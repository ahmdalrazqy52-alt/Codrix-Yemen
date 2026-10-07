import { useSiteContent } from '@/context/SiteContentContext';
import { useLang } from '@/context/LangContext';
import { defaultContentEn, type AllContent } from '@/content-types';

export function useContent(): AllContent {
  const arContent = useSiteContent();
  const { lang } = useLang();

  if (lang === 'en') {
    return defaultContentEn;
  }
  return arContent;
}
