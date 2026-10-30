import { useEffect } from 'react';
import { useSiteContent } from '@/context/SiteContentContext';

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) { element = document.createElement('meta'); element.setAttribute(attr, name); document.head.appendChild(element); }
  element.content = content;
}
export default function SeoManager() {
  const content = useSiteContent();
  useEffect(() => {
    const settings = content.settings;
    const title = settings.seoTitle || settings.companyName;
    const description = settings.seoDescription || settings.address;
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings.companyName,
      alternateName: settings.englishName,
      description,
      email: settings.email,
      telephone: settings.phone,
      address: { '@type': 'PostalAddress', addressCountry: 'YE', addressLocality: settings.address },
      knowsAbout: ['تطوير البرمجيات', 'تطوير المواقع', 'تطبيقات الجوال', 'المنصات الإلكترونية', 'الحلول التقنية'],
      hasPart: Object.entries(settings.seoSections || {}).map(([key, meta]) => ({
        '@type': 'WebPageElement',
        name: meta.title,
        description: meta.description,
        cssSelector: `#${key}`,
      })),
    };
    let script = document.getElementById('codrix-jsonld') as HTMLScriptElement | null;
    if (!script) { script = document.createElement('script'); script.id = 'codrix-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(schema);
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (siteUrl) {
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = new URL(window.location.pathname, siteUrl).toString();
    }
  }, [content.settings]);
  return null;
}
