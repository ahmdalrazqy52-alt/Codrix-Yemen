import { TextField, TextArea, IconPicker, ListEditor, FieldRow } from './fields';
import { FileUpload } from './FileUpload';
import type {
  AllContent, SectionName, SiteSettings, HomeContent, ServicesContent,
  ProcessContent, WorkContent, TechContent, FeaturesContent, TeamContent,
  TestimonialsContent, CtaContent, FaqContent, FooterContent, ReviewsContent,
  ServiceItem, StepItem, StatItem, ProjectItem, TechItem, FeatureItem,
  TeamMember, TestimonialItem, FaqItem,
} from '@/content-types';

type EditorProps<T> = { data: T; onChange: (data: T) => void };

function SettingsEditor({ data, onChange }: EditorProps<SiteSettings>) {
  return (
    <div className="space-y-4">
      <FieldRow>
        <TextField label="اسم الشركة" value={data.companyName} onChange={(v) => onChange({ ...data, companyName: v })} />
        <TextField label="الاسم بالإنجليزية" value={data.englishName} onChange={(v) => onChange({ ...data, englishName: v })} dir="ltr" />
      </FieldRow>
      <FieldRow>
        <TextField label="رقم الهاتف" value={data.phone} onChange={(v) => onChange({ ...data, phone: v })} dir="ltr" />
        <TextField label="البريد الإلكتروني" value={data.email} onChange={(v) => onChange({ ...data, email: v })} dir="ltr" />
      </FieldRow>
      <TextField label="العنوان" value={data.address} onChange={(v) => onChange({ ...data, address: v })} />
      <TextField label="بريد استقبال رسائل التواصل" value={data.contactRecipientEmail} onChange={(v) => onChange({ ...data, contactRecipientEmail: v })} dir="ltr" />
      <FieldRow>
        <FileUpload label="شعار نهاري" value={data.logoLight} onChange={(v) => onChange({ ...data, logoLight: v })} accept="image/*" folder="logos" />
        <FileUpload label="شعار ليلي" value={data.logoDark} onChange={(v) => onChange({ ...data, logoDark: v })} accept="image/*" folder="logos" />
      </FieldRow>
    </div>
  );
}

function HomeEditor({ data, onChange }: EditorProps<HomeContent>) {
  return (
    <div className="space-y-4">
      <TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
      <TextArea label="العنوان الرئيسي" value={data.title} onChange={(v) => onChange({ ...data, title: v })} rows={2} />
      <TextArea label="الوصف" value={data.description} onChange={(v) => onChange({ ...data, description: v })} rows={3} />
      <FieldRow>
        <TextField label="زر الإجراء الرئيسي" value={data.ctaPrimary} onChange={(v) => onChange({ ...data, ctaPrimary: v })} />
        <TextField label="زر الإجراء الثانوي" value={data.ctaSecondary} onChange={(v) => onChange({ ...data, ctaSecondary: v })} />
      </FieldRow>
    </div>
  );
}

function ServicesEditor({ data, onChange }: EditorProps<ServicesContent>) {
  return (
    <div className="space-y-4">
      <FieldRow>
        <TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} />
        <TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} />
      </FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<ServiceItem> items={data.items} onChange={(items) => onChange({ ...data, items })} itemLabel={(item) => item.title}
        newItem={() => ({ icon: 'Code2', title: 'خدمة جديدة', desc: '', points: [] })}
        renderItem={(item, update) => (<>
          <IconPicker label="الأيقونة" value={item.icon} onChange={(v) => update({ icon: v })} />
          <TextField label="عنوان الخدمة" value={item.title} onChange={(v) => update({ title: v })} />
          <TextArea label="وصف الخدمة" value={item.desc} onChange={(v) => update({ desc: v })} />
          <TextField label="النقاط (افصل بفاصلة)" value={item.points.join('، ')} onChange={(v) => update({ points: v.split('،').map((s) => s.trim()).filter(Boolean) })} />
        </>)}
      />
    </div>
  );
}

function ProcessEditor({ data, onChange }: EditorProps<ProcessContent>) {
  return (
    <div className="space-y-4">
      <FieldRow><TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} /><TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} /></FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<StatItem> items={data.stats} onChange={(stats) => onChange({ ...data, stats })} itemLabel={(item) => item.label}
        newItem={() => ({ value: '', label: '' })}
        renderItem={(item, update) => (<FieldRow><TextField label="القيمة" value={item.value} onChange={(v) => update({ value: v })} /><TextField label="الوصف" value={item.label} onChange={(v) => update({ label: v })} /></FieldRow>)}
      />
      <ListEditor<StepItem> items={data.steps} onChange={(steps) => onChange({ ...data, steps })} itemLabel={(item) => `${item.num} - ${item.title}`}
        newItem={() => ({ num: '0' + (data.steps.length + 1), title: 'مرحلة جديدة', desc: '' })}
        renderItem={(item, update) => (<><FieldRow><TextField label="الرقم" value={item.num} onChange={(v) => update({ num: v })} /><TextField label="العنوان" value={item.title} onChange={(v) => update({ title: v })} /></FieldRow><TextArea label="الوصف" value={item.desc} onChange={(v) => update({ desc: v })} /></>)}
      />
    </div>
  );
}

function WorkEditor({ data, onChange }: EditorProps<WorkContent>) {
  return (
    <div className="space-y-4">
      <FieldRow><TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} /><TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} /></FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<ProjectItem> items={data.projects} onChange={(projects) => onChange({ ...data, projects })} itemLabel={(item) => item.title}
        newItem={() => ({ title: 'مشروع جديد', category: '', desc: '', image: '', tags: [] })}
        renderItem={(item, update) => (<><FieldRow><TextField label="عنوان المشروع" value={item.title} onChange={(v) => update({ title: v })} /><TextField label="التصنيف" value={item.category} onChange={(v) => update({ category: v })} /></FieldRow><TextArea label="الوصف" value={item.desc} onChange={(v) => update({ desc: v })} /><FileUpload label="صورة المشروع" value={item.image} onChange={(v) => update({ image: v })} accept="image/*" folder="projects" /><TextField label="الوسوم (افصل بفاصلة)" value={item.tags.join('، ')} onChange={(v) => update({ tags: v.split('،').map((s) => s.trim()).filter(Boolean) })} /></>)}
      />
    </div>
  );
}

function TechEditor({ data, onChange }: EditorProps<TechContent>) {
  return (
    <div className="space-y-4">
      <TextField label="عنوان القسم" value={data.label} onChange={(v) => onChange({ ...data, label: v })} />
      <ListEditor<TechItem> items={data.items} onChange={(items) => onChange({ ...data, items })} itemLabel={(item) => item.name}
        newItem={() => ({ name: '', icon: 'Code2' })}
        renderItem={(item, update) => (<FieldRow><TextField label="الاسم" value={item.name} onChange={(v) => update({ name: v })} /><IconPicker label="الأيقونة" value={item.icon} onChange={(v) => update({ icon: v })} /></FieldRow>)}
      />
    </div>
  );
}

function FeaturesEditor({ data, onChange }: EditorProps<FeaturesContent>) {
  return (
    <div className="space-y-4">
      <FieldRow><TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} /><TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} /></FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<FeatureItem> items={data.items} onChange={(items) => onChange({ ...data, items })} itemLabel={(item) => item.title}
        newItem={() => ({ icon: 'Star', title: 'ميزة جديدة', desc: '' })}
        renderItem={(item, update) => (<><IconPicker label="الأيقونة" value={item.icon} onChange={(v) => update({ icon: v })} /><TextField label="العنوان" value={item.title} onChange={(v) => update({ title: v })} /><TextArea label="الوصف" value={item.desc} onChange={(v) => update({ desc: v })} /></>)}
      />
    </div>
  );
}

function TeamEditor({ data, onChange }: EditorProps<TeamContent>) {
  return (
    <div className="space-y-4">
      <FieldRow><TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} /><TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} /></FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<TeamMember> items={data.members} onChange={(members) => onChange({ ...data, members })} itemLabel={(item) => item.name}
        newItem={() => ({ name: 'عضو جديد', role: '', initials: '', gradient: 'from-accent-500 to-mint-500' })}
        renderItem={(item, update) => (<><FieldRow><TextField label="الاسم" value={item.name} onChange={(v) => update({ name: v })} /><TextField label="المسمى الوظيفي" value={item.role} onChange={(v) => update({ role: v })} /></FieldRow><FieldRow><TextField label="الأحرف الأولى" value={item.initials} onChange={(v) => update({ initials: v })} /><TextField label="التدرج اللوني" value={item.gradient} onChange={(v) => update({ gradient: v })} dir="ltr" /></FieldRow></>)}
      />
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: EditorProps<TestimonialsContent>) {
  return (
    <div className="space-y-4">
      <FieldRow><TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} /><TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} /></FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<TestimonialItem> items={data.items} onChange={(items) => onChange({ ...data, items })} itemLabel={(item) => item.name}
        newItem={() => ({ name: 'عميل جديد', role: '', text: '', initials: '' })}
        renderItem={(item, update) => (<><FieldRow><TextField label="الاسم" value={item.name} onChange={(v) => update({ name: v })} /><TextField label="المسمى" value={item.role} onChange={(v) => update({ role: v })} /></FieldRow><TextArea label="الشهادة" value={item.text} onChange={(v) => update({ text: v })} rows={3} /><TextField label="الأحرف الأولى" value={item.initials} onChange={(v) => update({ initials: v })} /></>)}
      />
    </div>
  );
}

function CtaEditor({ data, onChange }: EditorProps<CtaContent>) {
  return (
    <div className="space-y-4">
      <TextField label="الشارة" value={data.badge} onChange={(v) => onChange({ ...data, badge: v })} />
      <TextArea label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} rows={2} />
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <FieldRow><TextField label="زر رئيسي" value={data.ctaPrimary} onChange={(v) => onChange({ ...data, ctaPrimary: v })} /><TextField label="زر ثانوي" value={data.ctaSecondary} onChange={(v) => onChange({ ...data, ctaSecondary: v })} /></FieldRow>
    </div>
  );
}

function FaqEditor({ data, onChange }: EditorProps<FaqContent>) {
  return (
    <div className="space-y-4">
      <FieldRow><TextField label="النص التمهيدي" value={data.eyebrow} onChange={(v) => onChange({ ...data, eyebrow: v })} /><TextField label="العنوان" value={data.title} onChange={(v) => onChange({ ...data, title: v })} /></FieldRow>
      <TextArea label="الوصف" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <ListEditor<FaqItem> items={data.items} onChange={(items) => onChange({ ...data, items })} itemLabel={(item) => item.q}
        newItem={() => ({ q: 'سؤال جديد', a: '' })}
        renderItem={(item, update) => (<><TextField label="السؤال" value={item.q} onChange={(v) => update({ q: v })} /><TextArea label="الإجابة" value={item.a} onChange={(v) => update({ a: v })} rows={3} /></>)}
      />
    </div>
  );
}

function FooterEditor({ data, onChange }: EditorProps<FooterContent>) {
  return (
    <div className="space-y-4">
      <TextArea label="وصف الشركة" value={data.description} onChange={(v) => onChange({ ...data, description: v })} rows={3} />
      <ListEditor<{ label: string; href: string; iconUrl?: string }> items={data.socialLinks} onChange={(socialLinks) => onChange({ ...data, socialLinks })} itemLabel={(item) => item.label}
        newItem={() => ({ label: 'منصة جديدة', href: '#', iconUrl: '' })}
        renderItem={(item, update) => (<>
          <FieldRow><TextField label="الاسم" value={item.label} onChange={(v) => update({ label: v })} /><TextField label="الرابط" value={item.href} onChange={(v) => update({ href: v })} dir="ltr" /></FieldRow>
          <FileUpload label="أيقونة مخصصة (اختياري - يظهر بدل الأيقونة الافتراضية)" value={item.iconUrl || ''} onChange={(v) => update({ iconUrl: v })} accept="image/*" folder="social-icons" />
        </>)}
      />
    </div>
  );
}

function ReviewsEditor({ data, onChange }: EditorProps<ReviewsContent>) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-200 bg-ink-50 px-4 py-3 dark:border-ink-700 dark:bg-ink-950">
        <span className="text-sm font-bold text-ink-700 dark:text-ink-200">إظهار قسم التقييمات في الموقع</span>
        <button type="button" onClick={() => onChange({ visible: !data.visible })} className={`relative h-6 w-11 rounded-full transition-colors ${data.visible ? 'bg-accent-500' : 'bg-ink-300 dark:bg-ink-700'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data.visible ? 'right-0.5' : 'right-5'}`} />
        </button>
      </label>
      <p className="text-sm text-ink-500 dark:text-ink-400">يمكنك أيضاً إدارة التقييمات والملاحظات من تبويب «التقييمات» في القائمة الرئيسية.</p>
    </div>
  );
}

function AdsEditorNote() {
  return (
    <div className="rounded-xl border border-accent-500/20 bg-accent-500/5 p-6 text-center">
      <p className="text-sm font-bold text-ink-700 dark:text-ink-200">تم نقل إدارة الإعلانات إلى تبويب «الإعلانات» في القائمة الرئيسية.</p>
      <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">يمكنك الآن إضافة عدة إعلانات لكل مساحة مع تبديل عشوائي ودعم الصور والفيديو.</p>
    </div>
  );
}

const editorMap: Record<SectionName, React.ComponentType<EditorProps<unknown>>> = {
  settings: SettingsEditor as React.ComponentType<EditorProps<unknown>>,
  home: HomeEditor as React.ComponentType<EditorProps<unknown>>,
  services: ServicesEditor as React.ComponentType<EditorProps<unknown>>,
  process: ProcessEditor as React.ComponentType<EditorProps<unknown>>,
  work: WorkEditor as React.ComponentType<EditorProps<unknown>>,
  tech: TechEditor as React.ComponentType<EditorProps<unknown>>,
  features: FeaturesEditor as React.ComponentType<EditorProps<unknown>>,
  team: TeamEditor as React.ComponentType<EditorProps<unknown>>,
  testimonials: TestimonialsEditor as React.ComponentType<EditorProps<unknown>>,
  cta: CtaEditor as React.ComponentType<EditorProps<unknown>>,
  faq: FaqEditor as React.ComponentType<EditorProps<unknown>>,
  footer: FooterEditor as React.ComponentType<EditorProps<unknown>>,
  ads: AdsEditorNote as React.ComponentType<EditorProps<unknown>>,
  reviews: ReviewsEditor as React.ComponentType<EditorProps<unknown>>,
};

export function SectionEditor({ section, data, onChange }: {
  section: SectionName; data: AllContent[SectionName]; onChange: (data: AllContent[SectionName]) => void;
}) {
  const Editor = editorMap[section];
  if (!Editor) return <p className="text-sm text-ink-500">هذا القسم غير متاح للتحرير بعد.</p>;
  return <Editor data={data as unknown} onChange={onChange as (data: unknown) => void} />;
}

export const sectionDefs: { id: SectionName; label: string; desc: string }[] = [
  { id: 'settings', label: 'بيانات الشركة', desc: 'الاسم، الهاتف، البريد، العنوان' },
  { id: 'home', label: 'الصفحة الرئيسية', desc: 'العناوين والأزرار الرئيسية' },
  { id: 'services', label: 'الخدمات', desc: 'قائمة الخدمات المعروضة' },
  { id: 'process', label: 'آلية العمل', desc: 'مراحل العمل والإحصائيات' },
  { id: 'work', label: 'الأعمال', desc: 'المشاريع والصور' },
  { id: 'tech', label: 'التقنيات', desc: 'شريط التقنيات' },
  { id: 'features', label: 'المميزات', desc: 'لماذا نختارنا' },
  { id: 'team', label: 'الفريق', desc: 'أعضاء الفريق' },
  { id: 'testimonials', label: 'آراء العملاء', desc: 'الشهادات' },
  { id: 'cta', label: 'دعوة للتواصل', desc: 'القسم الحثي' },
  { id: 'faq', label: 'الأسئلة الشائعة', desc: 'الأسئلة والأجوبة' },
  { id: 'footer', label: 'التذييل', desc: 'روابط ووصف الشركة' },
  { id: 'ads', label: 'المساحات الإعلانية', desc: 'إعلانات متعددة' },
  { id: 'reviews', label: 'التقييمات والملاحظات', desc: 'إظهار/إخفاء القسم' },
];
