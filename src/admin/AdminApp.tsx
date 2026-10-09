import { useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  BarChart3, Check, ChevronLeft, FileText, LayoutDashboard, LogOut,
  Mail, Menu, Save, ShieldCheck, Sparkles, Trash2, X, Megaphone,
  Users, ScrollText, Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { defaultContent, type AllContent, type SectionName } from '@/content-types';
import { SectionEditor, sectionDefs } from './editors';
import { AdsManager } from './AdsManager';
import { AdminManager } from './AdminManager';
import { ActivityLog } from './ActivityLog';
import { ReviewsManager } from './ReviewsManager';
import { AdminSearch } from './AdminSearch';
import { DesignStudio } from './DesignStudio';
import { SqlConsole } from './SqlConsole';

type AdminView = 'overview' | 'content' | 'messages' | 'ads' | 'admins' | 'log' | 'reviews' | 'design' | 'sql';
type ContentRecord = { section: string; content: Record<string, unknown> };
type ContactStatus = 'new' | 'read' | 'accepted' | 'processing' | 'completed' | 'cancelled';
type ContactMessage = { id: string; name: string; email: string; message: string; created_at: string; status: ContactStatus; read_at: string | null; };

function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message.includes('Invalid login credentials')) return 'البريد أو كلمة المرور غير صحيحة.';
  if (error instanceof Error && error.message.includes('already registered')) return 'هذا البريد مسجل بالفعل، جرّب تسجيل الدخول.';
  return 'حدث خطأ أثناء تنفيذ العملية. حاول مرة أخرى.';
}

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setMessage(''); setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
        } catch (cause) { setError(friendlyError(cause)); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-ink-950 px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-ink-900/80 shadow-2xl shadow-black/30 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-accent-500 to-mint-500 p-12 text-ink-950 lg:block">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full bg-ink-950/10 px-4 py-2 text-xs font-bold tracking-widest">CODRIX YEMEN</span>
                <h1 className="mt-8 max-w-md text-5xl font-black leading-tight">مركز التحكم الكامل بموقعك</h1>
                <p className="mt-6 max-w-md text-lg font-semibold leading-relaxed text-ink-900/75">أدر المحتوى، الرسائل، الإعلانات، المدراء، والسجلات من مساحة آمنة واحدة.</p>
              </div>
              <ShieldCheck className="h-20 w-20 opacity-20" />
            </div>
          </div>
          <div className="p-7 sm:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-300"><ShieldCheck className="h-6 w-6" /></div>
              <div><p className="text-sm font-bold text-accent-300">لوحة الإدارة</p><h2 className="text-xl font-extrabold">مرحباً بك</h2></div>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-semibold text-ink-200">البريد الإلكتروني<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-white outline-none focus:border-accent-400" placeholder="admin@example.com" /></label>
              <label className="block text-sm font-semibold text-ink-200">كلمة المرور<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-950 px-4 py-3 text-white outline-none focus:border-accent-400" placeholder="6 أحرف على الأقل" /></label>
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
              {message && <p className="rounded-xl border border-mint-400/20 bg-mint-400/10 px-4 py-3 text-sm text-mint-200">{message}</p>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-400 px-5 py-3.5 text-sm font-extrabold text-ink-950 transition hover:bg-accent-300 disabled:opacity-60">{busy ? 'جارٍ التحقق...' : 'دخول إلى اللوحة'}</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminDashboard({ user }: { user: User }) {
  const [view, setView] = useState<AdminView>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [content, setContent] = useState<AllContent>(defaultContent);
  const [activeSection, setActiveSection] = useState<SectionName>('settings');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messageTab, setMessageTab] = useState<'all' | 'new' | 'read' | 'accepted'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  const logAction = useCallback(async (action: string, targetType: string, targetId: string, desc: string) => {
    void supabase.rpc('log_action', {
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_description: desc,
    });
  }, []);

  const loadData = async () => {
    setLoading(true); setError('');
    const [{ data: rows }, { data: messageRows }, { data: adminRow }] = await Promise.all([
      supabase.from('site_content').select('section, content').order('section'),
      supabase.from('contact_messages').select('id, name, email, message, created_at, status, read_at').order('created_at', { ascending: false }),
      supabase.from('admin_users').select('role').eq('user_id', user.id).eq('active', true).maybeSingle(),
    ]);
    if (rows) {
      const next = { ...defaultContent };
      for (const row of rows as ContentRecord[]) {
        const section = row.section as SectionName;
        if (section in defaultContent) (next as Record<string, unknown>)[section] = { ...((next as Record<string, unknown>)[section] as object), ...row.content };
      }
      setContent(next);
    }
    if (messageRows) setMessages(messageRows as ContactMessage[]);
    if (adminRow) setIsOwner(adminRow.role === 'owner');
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const saveSection = async () => {
    setSaving(true); setError(''); setNotice('');
    const { error: saveError } = await supabase.from('site_content').upsert({
      section: activeSection, content: content[activeSection], updated_by: user.id, updated_at: new Date().toISOString(),
    });
    if (saveError) {
      setError('تعذر حفظ التعديلات.');
    } else {
      setNotice('تم حفظ التعديلات بنجاح.');
      const label = sectionDefs.find((s) => s.id === activeSection)?.label || activeSection;
      void logAction('update', 'content', activeSection, `تعديل قسم: ${label}`);
    }
    setSaving(false);
  };

  const deleteMessage = async (id: string) => {
    const { error: delError } = await supabase.from('contact_messages').delete().eq('id', id);
    if (delError) {
      setError('تعذر حذف الرسالة.');
    } else {
      setMessages((c) => c.filter((m) => m.id !== id));
      void logAction('delete', 'message', id, 'حذف رسالة تواصل');
    }
  };

  const updateMessageStatus = async (id: string, status: ContactStatus) => {
    const { error: statusError } = await supabase.rpc('update_contact_message_status', { p_id: id, p_status: status });
    if (statusError) { setError(statusError.message || 'تعذر تحديث حالة الرسالة.'); return; }
    setMessages((current) => current.map((m) => m.id === id ? { ...m, status, read_at: status === 'new' ? m.read_at : (m.read_at || new Date().toISOString()) } : m));
    void logAction('update', 'message', id, `تحديث حالة رسالة إلى ${status}`);
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const navItems: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'content', label: 'محتوى الموقع', icon: FileText },
    { id: 'ads', label: 'الإعلانات', icon: Megaphone },
    { id: 'admins', label: 'المدراء', icon: Users },
    { id: 'log', label: 'السجل', icon: ScrollText },
    { id: 'reviews', label: 'التقييمات', icon: Star },
    { id: 'design', label: 'التصميم والمظهر', icon: Sparkles },
    { id: 'sql', label: 'مختبر قاعدة البيانات', icon: BarChart3 },
    { id: 'messages', label: 'رسائل التواصل', icon: Mail },
  ];

  const viewTitles: Record<AdminView, string> = {
    overview: 'نظرة عامة',
    content: 'محتوى الموقع',
    ads: 'الإعلانات',
    admins: 'المدراء',
    log: 'سجل النشاطات',
    reviews: 'التقييمات والملاحظات',
    design: 'التصميم والمظهر',
    sql: 'مختبر قاعدة البيانات',
    messages: 'رسائل التواصل',
  };

  const navigateTo = (targetView: string, section?: string) => {
    setView(targetView as AdminView);
    if (section) setActiveSection(section as SectionName);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-white">
      <aside className={`fixed inset-y-0 right-0 z-40 w-72 overflow-y-auto border-l border-ink-200 bg-white p-5 transition-transform dark:border-ink-800 dark:bg-ink-900 ${mobileNav ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500 text-ink-950"><Sparkles className="h-5 w-5" /></div>
            <div><div className="font-extrabold">كودركس يمن</div><div className="text-xs text-ink-500 dark:text-ink-400">لوحة الإدارة</div></div>
          </div>
          <button onClick={() => setMobileNav(false)} className="rounded-lg p-2 text-ink-500 lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${view === item.id ? 'bg-accent-500 text-ink-950' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'}`}><Icon className="h-5 w-5" />{item.label}{item.id === 'messages' && messages.filter((m) => m.status === 'new').length > 0 && <span className="mr-auto rounded-full bg-ink-950/10 px-2 py-0.5 text-xs">{messages.filter((m) => m.status === 'new').length}</span>}</button>;
          })}
        </nav>
        <div className="mt-4 border-t border-ink-200 pt-4 dark:border-ink-800">
          <button onClick={() => { setView('content'); setActiveSection('settings'); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${view === 'content' && activeSection === 'settings' ? 'bg-accent-500 text-ink-950' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'}`}>
            <Mail className="h-5 w-5" />إدارة خيارات التواصل
          </button>
        </div>
        <div className="mt-6 border-t border-ink-200 pt-4 dark:border-ink-800">
          <p className="px-3 pb-2 text-xs font-bold text-ink-400">أقسام الموقع</p>
          <div className="space-y-1">
            {sectionDefs.map((s) => <button key={s.id} onClick={() => { setView('content'); setActiveSection(s.id); setMobileNav(false); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${view === 'content' && activeSection === s.id ? 'bg-accent-500/10 text-accent-700 dark:text-accent-300' : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800'}`}>{s.label}</button>)}
          </div>
        </div>
        <div className="mt-6 space-y-2 border-t border-ink-200 pt-4 dark:border-ink-800">
          <a href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"><ChevronLeft className="h-5 w-5" />عرض الموقع</a>
          <button onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"><LogOut className="h-5 w-5" />تسجيل الخروج</button>
        </div>
      </aside>

      <div className="lg:mr-72">
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/85 px-5 py-4 backdrop-blur-xl dark:border-ink-800 dark:bg-ink-950/85 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><button onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-ink-600 dark:text-ink-300 lg:hidden"><Menu className="h-5 w-5" /></button><span className="text-sm font-semibold text-ink-500 dark:text-ink-400">مساحة العمل</span><h1 className="mt-1 text-2xl font-black">{viewTitles[view]}</h1></div>
            <div className="flex items-center gap-3"><AdminSearch onNavigate={navigateTo} /><div className="hidden items-center gap-3 rounded-xl border border-ink-200 px-3 py-2 text-sm dark:border-ink-800 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-500/15 text-mint-600"><ShieldCheck className="h-4 w-4" /></div><span className="max-w-[180px] truncate">{user.email}</span></div></div>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          {notice && <div className="mb-6 flex items-center gap-2 rounded-xl border border-mint-500/20 bg-mint-500/10 px-4 py-3 text-sm font-semibold text-mint-700 dark:text-mint-300"><Check className="h-4 w-4" />{notice}</div>}
          {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">{error}</div>}
          {loading && view !== 'ads' && view !== 'admins' && view !== 'log' && view !== 'reviews' ? <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-ink-500 dark:border-ink-800 dark:bg-ink-900">جارٍ تحميل بيانات اللوحة...</div> : view === 'overview' ? (
            <div className="space-y-8">
              <div className="grid gap-5 sm:grid-cols-3">
                <StatCard icon={FileText} label="أقسام قابلة للتحرير" value={sectionDefs.length.toString()} />
                <StatCard icon={Mail} label="رسائل التواصل" value={messages.length.toString()} />
                <StatCard icon={Megaphone} label="حالة الموقع" value="نشط" />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900"><h2 className="text-lg font-extrabold">ابدأ من هنا</h2><p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">تستطيع إدارة المحتوى، الإعلانات، المدراء، ومراجعة سجل النشاطات والرسائل.</p><div className="mt-6 flex flex-wrap gap-2"><button onClick={() => setView('content')} className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-ink-950">إدارة المحتوى <ChevronLeft className="h-4 w-4" /></button><button onClick={() => setView('ads')} className="inline-flex items-center gap-2 rounded-xl bg-ink-100 px-5 py-3 text-sm font-bold text-ink-700 dark:bg-ink-800 dark:text-ink-200">الإعلانات <Megaphone className="h-4 w-4" /></button></div></div>
                <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">آخر الرسائل</h2><button onClick={() => setView('messages')} className="text-xs font-bold text-accent-600 dark:text-accent-300">عرض الكل</button></div><div className="mt-5 space-y-4">{messages.slice(0, 3).map((m) => <div key={m.id} className="flex items-start justify-between gap-3 border-b border-ink-100 pb-3 last:border-0 dark:border-ink-800"><div><p className="text-sm font-bold">{m.name}</p><p className="mt-1 line-clamp-1 text-xs text-ink-500 dark:text-ink-400">{m.message}</p></div><span className="shrink-0 text-[11px] text-ink-400">{new Date(m.created_at).toLocaleDateString('ar')}</span></div>)}{messages.length === 0 && <p className="text-sm text-ink-500">لا توجد رسائل حتى الآن.</p>}</div></div>
              </div>
            </div>
          ) : view === 'content' ? (
            <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
              <div className="flex flex-col justify-between gap-4 border-b border-ink-200 pb-5 dark:border-ink-800 sm:flex-row sm:items-center">
                <div><p className="text-xs font-bold text-accent-600 dark:text-accent-300">تحرير القسم</p><h2 className="mt-1 text-xl font-black">{sectionDefs.find((s) => s.id === activeSection)?.label}</h2></div>
                <button onClick={() => void saveSection()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-ink-950 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button>
              </div>
              <div className="mt-5"><SectionEditor section={activeSection} data={content[activeSection]} onChange={(d) => setContent({ ...content, [activeSection]: d })} /></div>
            </div>
          ) : view === 'design' ? (
            <DesignStudio userId={user.id} onLog={(action, targetId, desc) => void logAction(action, 'design', targetId, desc)} />
          ) : view === 'sql' ? (
            <SqlConsole isOwner={isOwner} />
          ) : view === 'ads' ? (
            <AdsManager userId={user.id} onLog={(action, targetId, desc) => void logAction(action, 'ad', targetId, desc)} />
          ) : view === 'admins' ? (
            <AdminManager userId={user.id} isOwner={isOwner} onLog={(action, targetId, desc) => void logAction(action, targetId.startsWith('admin') ? 'admin' : 'profile', targetId, desc)} />
          ) : view === 'log' ? (
            <ActivityLog userId={user.id} />
          ) : view === 'reviews' ? (
            <ReviewsManager onLog={(action, targetId, desc) => void logAction(action, 'review', targetId, desc)} />
          ) : (
            <div className="rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
              <div className="border-b border-ink-200 p-6 dark:border-ink-800"><h2 className="text-lg font-extrabold">رسائل التواصل</h2><p className="mt-1 text-sm text-ink-500 dark:text-ink-400">قسّم الرسائل حسب حالتها، اطّلع عليها، ثم تابع تجهيز الطلب حتى إغلاقه.</p></div>
              <div className="flex flex-wrap gap-2 border-b border-ink-200 p-4 dark:border-ink-800">
                {([
                  ['all', 'كل الرسائل'], ['new', 'الرسائل الجديدة'], ['read', 'تم الاطلاع عليها'], ['accepted', 'المقبولة'],
                ] as const).map(([key, label]) => {
                  const count = key === 'all' ? messages.length : key === 'new' ? messages.filter((m) => m.status === 'new').length : key === 'read' ? messages.filter((m) => m.status === 'read').length : messages.filter((m) => ['accepted','processing','completed','cancelled'].includes(m.status)).length;
                  return <button key={key} onClick={() => setMessageTab(key)} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${messageTab === key ? 'bg-accent-500 text-ink-950' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200'}`}>{label} <span className="mr-1 rounded-full bg-black/10 px-2 py-0.5 text-xs">{count}</span></button>;
                })}
              </div>
              <div className="divide-y divide-ink-100 dark:divide-ink-800">
                {messages.filter((m) => messageTab === 'all' ? true : messageTab === 'new' ? m.status === 'new' : messageTab === 'read' ? m.status === 'read' : ['accepted','processing','completed','cancelled'].includes(m.status)).map((m) => (
                  <article key={m.id} className="p-6">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row">
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">{m.name}</h3><span className="rounded-full bg-accent-500/10 px-2 py-1 text-[11px] font-bold text-accent-700 dark:text-accent-300">{m.status === 'new' ? 'جديدة' : m.status === 'read' ? 'تم الاطلاع' : m.status === 'accepted' ? 'مقبولة' : m.status === 'processing' ? 'قيد التجهيز' : m.status === 'completed' ? 'تم التجهيز' : 'ملغية'}</span></div><a href={`mailto:${m.email}`} className="mt-1 block text-sm text-accent-600 dark:text-accent-300">{m.email}</a><time className="mt-1 block text-xs text-ink-400">{new Date(m.created_at).toLocaleString('ar')}</time></div>
                      <div className="flex flex-wrap items-center gap-2">
                        {m.status === 'new' && <button onClick={() => void updateMessageStatus(m.id, 'read')} className="rounded-xl bg-ink-100 px-3 py-2 text-xs font-bold text-ink-700 dark:bg-ink-800 dark:text-ink-200">تم الاطلاع</button>}
                        {m.status === 'read' && <button onClick={() => void updateMessageStatus(m.id, 'accepted')} className="rounded-xl bg-accent-500 px-3 py-2 text-xs font-bold text-ink-950">قبول الطلب</button>}
                        {['accepted','processing','completed','cancelled'].includes(m.status) && <select value={m.status} onChange={(e) => void updateMessageStatus(m.id, e.target.value as ContactStatus)} className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold dark:border-ink-700 dark:bg-ink-900"><option value="accepted">مقبولة</option><option value="processing">قيد التجهيز</option><option value="completed">تم التجهيز</option><option value="cancelled">ملغية</option></select>}
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent('رد من كودركس يمن')}&body=${encodeURIComponent('مرحباً '+m.name+'،\n\n')}`} className="rounded-xl bg-mint-500 px-3 py-2 text-xs font-bold text-ink-950">الرد بالبريد</a>
                        <button onClick={() => void deleteMessage(m.id)} className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-500/10" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-700 dark:bg-ink-950 dark:text-ink-200">{m.message}</p>
                  </article>
                ))}
                {messages.filter((m) => messageTab === 'all' ? true : messageTab === 'new' ? m.status === 'new' : messageTab === 'read' ? m.status === 'read' : ['accepted','processing','completed','cancelled'].includes(m.status)).length === 0 && <div className="p-10 text-center text-sm text-ink-500">لا توجد رسائل في هذا القسم.</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-ink-500 dark:text-ink-400">{label}</span><Icon className="h-5 w-5 text-accent-500" /></div><div className="mt-5 text-3xl font-black">{value}</div></div>;
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const resolveSession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) {
      setAuthorized(false);
      setCheckingAccess(false);
      return;
    }
    setCheckingAccess(true);
    const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', nextSession.user.id).eq('active', true).maybeSingle();
    if (admin) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      await supabase.auth.signOut();
    }
    setCheckingAccess(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      void resolveSession(data.session).finally(() => { if (mounted) setLoading(false); });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) void resolveSession(nextSession);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [resolveSession]);

  if (loading || checkingAccess) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-white">جارٍ التحقق من صلاحية الدخول...</div>;
  if (!session || !authorized) return <AuthScreen />;
  return <AdminDashboard user={session.user} />;
}
