import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, FileText, Megaphone, Users, Mail, Star, ScrollText, Settings } from 'lucide-react';

export type AdminSearchResult = {
  id: string;
  label: string;
  desc: string;
  view: string;
  section?: string;
  icon: typeof FileText;
};

export function AdminSearch({ onNavigate }: { onNavigate: (view: string, section?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results = useMemo<AdminSearchResult[]>(() => {
    const base: AdminSearchResult[] = [
      { id: 'overview', label: 'نظرة عامة', desc: 'لوحة المعلومات الرئيسية', view: 'overview', icon: FileText },
      { id: 'content', label: 'محتوى الموقع', desc: 'تحرير أقسام الموقع', view: 'content', icon: FileText },
      { id: 'ads', label: 'الإعلانات', desc: 'إدارة المساحات الإعلانية', view: 'ads', icon: Megaphone },
      { id: 'admins', label: 'المدراء', desc: 'إدارة المدراء والملفات الشخصية', view: 'admins', icon: Users },
      { id: 'log', label: 'السجل', desc: 'سجل النشاطات', view: 'log', icon: ScrollText },
      { id: 'messages', label: 'رسائل التواصل', desc: 'مراجعة رسائل الزوار', view: 'messages', icon: Mail },
      { id: 'reviews', label: 'التقييمات والملاحظات', desc: 'إدارة تقييمات الزوار', view: 'reviews', icon: Star },
      { id: 'settings', label: 'بيانات الشركة', desc: 'الاسم، الهاتف، البريد، الشعار', view: 'content', section: 'settings', icon: Settings },
      { id: 'home', label: 'الصفحة الرئيسية', desc: 'العناوين والأزرار', view: 'content', section: 'home', icon: FileText },
      { id: 'services', label: 'الخدمات', desc: 'قائمة الخدمات', view: 'content', section: 'services', icon: FileText },
      { id: 'process', label: 'آلية العمل', desc: 'مراحل العمل', view: 'content', section: 'process', icon: FileText },
      { id: 'work', label: 'الأعمال', desc: 'المشاريع', view: 'content', section: 'work', icon: FileText },
      { id: 'features', label: 'المميزات', desc: 'مميزات الشركة', view: 'content', section: 'features', icon: FileText },
      { id: 'team', label: 'الفريق', desc: 'أعضاء الفريق', view: 'content', section: 'team', icon: FileText },
      { id: 'testimonials', label: 'آراء العملاء', desc: 'الشهادات', view: 'content', section: 'testimonials', icon: FileText },
      { id: 'faq', label: 'الأسئلة الشائعة', desc: 'الأسئلة والأجوبة', view: 'content', section: 'faq', icon: FileText },
      { id: 'footer', label: 'التذييل', desc: 'روابط ووصف الشركة', view: 'content', section: 'footer', icon: FileText },
    ];

    if (!query.trim()) return base.slice(0, 8);
    const q = query.toLowerCase().trim();
    return base.filter((r) =>
      r.label.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query]);

  const handleSelect = (r: AdminSearchResult) => {
    onNavigate(r.view, r.section);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors hover:border-accent-500/50 hover:text-accent-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300"
        aria-label="بحث"
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/50 backdrop-blur-sm pt-[10vh] px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-3 border-b border-ink-200 px-4 dark:border-ink-800">
              <Search className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في لوحة التحكم..."
                className="flex-1 bg-transparent py-3.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 dark:text-white dark:placeholder:text-ink-500"
              />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="p-8 text-center text-sm text-ink-500">لا توجد نتائج</div>
              ) : (
                results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-ink-400" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-ink-900 dark:text-white">{r.label}</div>
                        <div className="truncate text-xs text-ink-500 dark:text-ink-400">{r.desc}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
