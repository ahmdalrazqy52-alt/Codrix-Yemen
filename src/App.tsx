import { useEffect, type ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LangProvider } from '@/context/LangContext';
import AdminApp from '@/admin/AdminApp';
import { SiteContentProvider } from '@/context/SiteContentContext';
import { DesignProvider } from '@/context/DesignContext';
import { SiteLayoutProvider, useSiteLayout } from '@/context/SiteLayoutContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Services from '@/components/Services';
import Features from '@/components/Features';
import Process from '@/components/Process';
import Work from '@/components/Work';
import Team from '@/components/Team';
import Testimonials from '@/components/Testimonials';
import Cta from '@/components/Cta';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Reviews from '@/components/Reviews';
import Footer from '@/components/Footer';
import { HeroAd, BottomBar, CustomAdSlots } from '@/components/Ads';
import ScrollNavigator from '@/components/ScrollNavigator';
import SeoManager from '@/components/SeoManager';

type DesignRuleMessage = {
  selector: string;
  styles?: Record<string, string>;
  text?: string;
};

function previewSelectorFor(el: Element, doc: Document): string {
  const designKey = el.getAttribute('data-design-key');
  if (designKey) return `[data-design-key="${CSS.escape(designKey)}"]`;

  const id = (el as HTMLElement).id;
  if (id && doc.querySelectorAll(`#${CSS.escape(id)}`).length === 1) {
    return `#${CSS.escape(id)}`;
  }

  const parts: string[] = [];
  let node: Element | null = el;

  while (node && node !== doc.body && parts.length < 7) {
    let part = node.tagName.toLowerCase();
    const classes = Array.from(node.classList)
      .filter((c) => /^[A-Za-z_-][A-Za-z0-9_-]*$/.test(c))
      .slice(0, 3);

    if (classes.length) {
      part += classes.map((c) => `.${CSS.escape(c)}`).join('');
    }

    const parent: Element | null = node.parentElement;
    if (parent) {
      const same = Array.from(parent.children).filter(
        (child) => child.tagName === node!.tagName
      );
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(node) + 1})`;
    }

    parts.unshift(part);
    const candidate = parts.join(' > ');
    try {
      if (doc.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
      // تجاهل المحددات غير الصالحة أثناء تكوين المحدد.
    }
    node = parent;
  }

  return parts.join(' > ');
}

function previewGroupSelectorFor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList)
    .filter((c) => /^[A-Za-z_-][A-Za-z0-9_-]*$/.test(c))
    .slice(0, 4);
  return tag + classes.map((c) => `.${CSS.escape(c)}`).join('');
}

export default function App() {
  return (
    <SiteLayoutProvider>
      {window.location.pathname.startsWith('/admin') ? <AdminApp /> : <SiteHome />}
    </SiteLayoutProvider>
  );
}

function SiteHome() {
  const { order, hidden } = useSiteLayout();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('editorPreview') !== '1') return;

    const doc = document;
    const editorStyleId = 'codrix-editor-base-style';
    let editorStyle = doc.getElementById(editorStyleId) as HTMLStyleElement | null;

    if (!editorStyle) {
      editorStyle = doc.createElement('style');
      editorStyle.id = editorStyleId;
      editorStyle.textContent = `
        .codrix-editor-selected {
          outline: 3px solid #06b6d4 !important;
          outline-offset: 3px !important;
        }
        .codrix-editor-hover {
          outline: 2px dashed #10b981 !important;
          outline-offset: 2px !important;
        }
        a, button, input, select, textarea, [role="button"] {
          cursor: pointer !important;
        }
      `;
      doc.head.appendChild(editorStyle);
    }

    const send = (message: unknown) => {
      window.parent.postMessage(message, '*');
    };

    const mouseOver = (event: Event) => {
      const raw = event.target;
      const target = raw instanceof Element ? raw : null;
      if (!target || target === doc.body || target.closest('[data-editor-ignore]')) return;
      target.classList.add('codrix-editor-hover');
    };

    const mouseOut = (event: Event) => {
      const raw = event.target;
      const target = raw instanceof Element ? raw : null;
      if (!target) return;
      target.classList.remove('codrix-editor-hover');
    };

    const click = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      const raw = event.target;
      const target = raw instanceof Element
        ? raw
        : raw instanceof Node
          ? raw.parentElement
          : null;

      if (!target || target === doc.body || target === doc.documentElement) return;
      if (target.closest('[data-editor-ignore]')) return;

      // السماح بتحديد العناصر العامة أيضاً (مثل div وواجهات البطاقات)،
      // وليس العناوين والنصوص فقط. استبعد عناصر التنفيذ غير المرئية.
      const editable = target.closest(
        '[data-design-key], h1, h2, h3, h4, h5, h6, p, span, img, button, a, label, article, section, header, footer, li, div'
      ) || target;
      if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HTML', 'BODY'].includes(editable.tagName)) return;

      doc.querySelectorAll('.codrix-editor-selected').forEach((element) => {
        element.classList.remove('codrix-editor-selected');
      });
      editable.classList.add('codrix-editor-selected');

      send({
        type: 'codrix:element-selected',
        element: {
          selector: previewSelectorFor(editable, doc),
          tag: editable.tagName.toLowerCase(),
          text: (editable.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
          groupSelector: previewGroupSelectorFor(editable),
          canEditText: editable.children.length === 0,
        },
      });
    };

    const stopSubmit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const keydown = (event: KeyboardEvent) => {
      const raw = event.target;
      const target = raw instanceof Element ? raw : null;
      if (target?.closest('a,button,form,input,textarea,select,[role="button"]')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const applyRules = (rules: DesignRuleMessage[]) => {
      const styleId = 'codrix-live-editor-styles';
      let style = doc.getElementById(styleId) as HTMLStyleElement | null;
      if (!style) {
        style = doc.createElement('style');
        style.id = styleId;
        doc.head.appendChild(style);
      }

      style.textContent = (Array.isArray(rules) ? rules : [])
        .filter((rule) => rule && typeof rule.selector === 'string')
        .map((rule) => {
          const declarations = Object.entries(rule.styles || {})
            .filter(([key, value]) =>
              /^[a-z-]+$/i.test(key) && typeof value === 'string'
            )
            .map(([key, value]) => `${key}:${value};`)
            .join('');
          return `${rule.selector}{${declarations}}`;
        })
        .join('\n');

      (Array.isArray(rules) ? rules : []).forEach((rule) => {
        if (!rule || typeof rule.selector !== 'string' || typeof rule.text !== 'string') return;
        try {
          doc.querySelectorAll(rule.selector).forEach((element) => {
            // لا نستبدل المحتوى الداخلي للعناصر المركبة التي تحتوي على عناصر أخرى.
            if (!element.children.length) element.textContent = rule.text!;
          });
        } catch {
          // تجاهل محدد غير صالح حتى لا تتوقف بقية القواعد.
        }
      });
    };

    const message = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'codrix:apply-rules' && Array.isArray(data.rules)) {
        applyRules(data.rules as DesignRuleMessage[]);
      }
    };

    doc.addEventListener('mouseover', mouseOver, true);
    doc.addEventListener('mouseout', mouseOut, true);
    doc.addEventListener('click', click, true);
    doc.addEventListener('submit', stopSubmit, true);
    doc.addEventListener('keydown', keydown, true);
    window.addEventListener('message', message);

    // إشعار لوحة الإدارة بأن المعاينة أصبحت جاهزة لاستقبال القواعد.
    send({ type: 'codrix:preview-ready' });

    return () => {
      doc.removeEventListener('mouseover', mouseOver, true);
      doc.removeEventListener('mouseout', mouseOut, true);
      doc.removeEventListener('click', click, true);
      doc.removeEventListener('submit', stopSubmit, true);
      doc.removeEventListener('keydown', keydown, true);
      window.removeEventListener('message', message);
    };
  }, []);

  const blocks: Record<string, ReactNode> = {
    hero: <><Hero /><HeroAd /><CustomAdSlots location="after-hero" /><Marquee /></>,
    services: <><Services /><CustomAdSlots location="after-services" /></>,
    features: <Features />,
    process: <Process />,
    work: <><Work /><CustomAdSlots location="after-work" /></>,
    team: <><Team /><CustomAdSlots location="after-team" /></>,
    testimonials: <><Testimonials /><CustomAdSlots location="after-testimonials" /></>,
    cta: <Cta />,
    faq: <><Faq /><CustomAdSlots location="before-contact" /></>,
    contact: <><Contact /><CustomAdSlots location="after-contact" /></>,
    reviews: <Reviews />,
  };

  return (
    <ThemeProvider>
      <LangProvider>
        <SiteContentProvider>
          <DesignProvider>
            <SeoManager />
            <div className="min-h-screen bg-ink-50 pb-12 transition-colors duration-300 dark:bg-ink-950">
              <Navbar />
              <main>{order.filter(id => !hidden.includes(id)).map(id => <div key={id} data-scroll-section={id}>{blocks[id]}</div>)}</main>
              <Footer />
            </div>
            <BottomBar />
            <ScrollNavigator />
          </DesignProvider>
        </SiteContentProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
