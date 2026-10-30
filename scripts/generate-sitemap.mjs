import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const env = {};
if (existsSync(new URL('../.env', import.meta.url))) {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !match[2].startsWith('#')) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}
const raw = process.env.VITE_SITE_URL || process.env.SITE_URL || env.VITE_SITE_URL;
if (!raw) {
  console.warn('[SEO] VITE_SITE_URL is not set; sitemap generation skipped. Set it to the official https URL before production build.');
  process.exit(0);
}
let origin;
try {
  const parsed = new URL(raw);
  if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') throw new Error('Use HTTPS for the production domain.');
  origin = parsed.origin;
} catch (error) {
  console.error(`[SEO] Invalid VITE_SITE_URL: ${error.message}`);
  process.exit(1);
}
const urls = ['', '/#services', '/#work', '/#contact', '/#faq', '/#reviews'];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${origin}${path}</loc><changefreq>weekly</changefreq></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`[SEO] Generated sitemap.xml for ${origin}`);
