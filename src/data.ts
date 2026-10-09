import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  Smartphone,
  Cloud,
  Brain,
  ShieldCheck,
  Gauge,
  Layout,
  Server,
  Boxes,
  GitBranch,
  Workflow,
  Rocket,
  Zap,
  Clock,
  Users,
  Trophy,
  HeartHandshake,
  Target,
  Lightbulb,
  Wrench,
} from 'lucide-react';

export type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
  points: string[];
};

export const services: Service[] = [
  {
    icon: Code2,
    title: 'تطوير الويب',
    desc: 'مواقع ومنصات ويب حديثة سريعة وقابلة للتطوير، مبنية بأحدث التقنيات.',
    points: ['واجهات تفاعلية', 'لوحات تحكم', 'متاجر إلكترونية'],
  },
  {
    icon: Smartphone,
    title: 'تطبيقات الجوال',
    desc: 'تطبيقات iOS و Android بتجربة استخدام سلسة وأداء عالٍ.',
    points: ['تصميم أصلي', 'إشعارات فورية', 'عمل دون اتصال'],
  },
  {
    icon: Brain,
    title: 'الذكاء الاصطناعي',
    desc: 'حلول ذكاء اصطناعي وتعلّم آلي تُضيف قيمة حقيقية لمنتجك.',
    points: ['نماذج تنبؤية', 'معالجة لغة', 'أتمتة ذكية'],
  },
  {
    icon: Cloud,
    title: 'الحوسبة السحابية',
    desc: 'بنية تحتية سحابية موثوقة وقابلة للتوسع حسب نمو أعمالك.',
    points: ['توسّع تلقائي', 'نسخ احتياطي', 'مراقبة 24/7'],
  },
  {
    icon: Layout,
    title: 'تصميم تجربة المستخدم',
    desc: 'تصاميم أنيقة تركز على المستخدم وتحوّل الزوار إلى عملاء.',
    points: ['واجهات UI/UX', 'اختبار قابلية', 'هوية بصرية'],
  },
  {
    icon: ShieldCheck,
    title: 'الأمن السيبراني',
    desc: 'تدقيق وحماية الأنظمة من الثغرات وفق أعلى المعايير.',
    points: ['تدقيق أمني', 'اختبار اختراق', 'حماية البيانات'],
  },
];

export type Stat = { value: string; label: string; num: number; suffix: string };

export const stats: Stat[] = [
  { value: '+120', label: 'مشروع منجز', num: 120, suffix: '+' },
  { value: '+45', label: 'عميل حول العالم', num: 45, suffix: '+' },
  { value: '8', label: 'سنوات خبرة', num: 8, suffix: '' },
  { value: '99.9%', label: 'نسبة التشغيل', num: 99, suffix: '.9%' },
];

export type Achievement = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
};

export const achievements: Achievement[] = [
  { icon: Trophy, value: 120, suffix: '+', label: 'مشروع منجز بنجاح' },
  { icon: Users, value: 45, suffix: '+', label: 'عميل حول العالم' },
  { icon: Clock, value: 8, suffix: '', label: 'سنوات من الخبرة' },
  { icon: Zap, value: 99, suffix: '%', label: 'نسبة التشغيل' },
];

export type Step = { num: string; title: string; desc: string };

export const steps: Step[] = [
  {
    num: '01',
    title: 'الاكتشاف والتخطيط',
    desc: 'نفهم أهدافك ومتطلباتك بعمق، ونضع خريطة طريق واضحة للمشروع.',
  },
  {
    num: '02',
    title: 'التصميم والنموذج الأولي',
    desc: 'نصمم تجربة المستخدم والواجهات، ونعرض نماذج أولية للمراجعة.',
  },
  {
    num: '03',
    title: 'التطوير والبناء',
    desc: 'نبني المنتج بكود نظيف وقابل للتوسع مع اختبارات مستمرة.',
  },
  {
    num: '04',
    title: 'الإطلاق والدعم',
    desc: 'نطلق المنتج ونتابعه بالدعم والتحسينات المستمرة بعد الإطلاق.',
  },
];

export type Tech = { name: string; icon: LucideIcon };

export const techStack: Tech[] = [
  { name: 'React', icon: Code2 },
  { name: 'Node.js', icon: Server },
  { name: 'TypeScript', icon: Boxes },
  { name: 'Supabase', icon: Cloud },
  { name: 'CI/CD', icon: GitBranch },
  { name: 'Automation', icon: Workflow },
  { name: 'Performance', icon: Gauge },
  { name: 'DevOps', icon: Rocket },
];

export type Project = {
  title: string;
  category: string;
  desc: string;
  image: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    title: 'منصة تجارة إلكترونية',
    category: 'ويب',
    desc: 'متجر متكامل بنظام دفع ولوحة تحكم للتجار وتحليلات مباشرة.',
    image: 'https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tags: ['React', 'Supabase', 'Payments'],
  },
  {
    title: 'تطبيق إدارة الأعمال',
    category: 'جوال',
    desc: 'تطبيق جوال لإدارة المهام والمشاريع مع تكامل أدوات سحابية.',
    image: 'https://images.pexels.com/photos/38639/mockup-psd-ipad-iphone-38639.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tags: ['iOS', 'Android', 'Cloud'],
  },
  {
    title: 'لوحة تحكم تحليلات',
    category: 'بيانات',
    desc: 'لوحة بيانات تفاعلية تعرض مؤشرات الأداء في الوقت الحقيقي.',
    image: 'https://images.pexels.com/photos/7988745/pexels-photo-7988745.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tags: ['Dashboard', 'Charts', 'API'],
  },
  {
    title: 'بنية سحابية موزّعة',
    category: 'بنية تحتية',
    desc: 'تصميم ونشر بنية سحابية قابلة للتوسع لخدمات عالية الحمل.',
    image: 'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    tags: ['Cloud', 'DevOps', 'Scaling'],
  },
];

export type Testimonial = {
  name: string;
  role: string;
  text: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'أحمد المنصور',
    role: 'مدير تنفيذي - شركة تقنية',
    text: 'فريق كودركس يمن حوّل فكرتنا إلى منتج متكامل باحترافية عالية. التواصل ممتاز والتسليم في الموعد.',
    initials: 'أم',
  },
  {
    name: 'سارة العتيبي',
    role: 'مؤسسة منصة تجارية',
    text: 'جودة العمل تفوق التوقعات. التطبيق أصبح سريعاً وسهل الاستخدام ومبيعاتنا زادت بشكل ملحوظ.',
    initials: 'سع',
  },
  {
    name: 'خالد الرشيد',
    role: 'مدير منتج',
    text: 'تعاملت مع شركات كثيرة لكن كودركس يمن تتميز بالشفافية والاهتمام بأدق التفاصيل.',
    initials: 'خر',
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: 'كم تستغرق مدة تنفيذ المشروع؟',
    a: 'تختلف المدة حسب حجم المشروع وتعقيده. المشاريع الصغيرة تستغرق 2-4 أسابيع، بينما المشاريع المتوسطة والكبيرة من 2 إلى 6 أشهر. نزوّدك بجدول زمني واضح بعد مرحلة التخطيط.',
  },
  {
    q: 'هل تقدمون الدعم بعد إطلاق المشروع؟',
    a: 'نعم، نقدم باقات دعم وصيانة بعد الإطلاق تشمل إصلاح الأخطاء والتحديثات والتحسينات المستمرة لضمان استقرار منتجك.',
  },
  {
    q: 'ما هي طريقة التواصل ومتابعة المشروع؟',
    a: 'نخصص لك قناة تواصل مباشرة وتقارير دورية عن تقدم العمل، مع اجتماعات أسبوعية لمراجعة المراحل والملاحظات.',
  },
  {
    q: 'هل تعملون بمشاريع للشركات الناشئة؟',
    a: 'بالتأكيد. لدينا باقات مخصصة للشركات الناشئة تشمل بناء نسخة أولية (MVP) بسرعة وكفاءة لاختبار الفكرة في السوق.',
  },
  {
    q: 'هل يمكنكم التكامل مع أنظمة موجودة لدينا؟',
    a: 'نعم، لدينا خبرة في التكامل مع مختلف الأنظمة والخدمات الخارجية عبر واجهات البرمجة (APIs) وضمان عمل كل شيء بسلاسة.',
  },
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const features: Feature[] = [
  {
    icon: Zap,
    title: 'أداء فائق',
    desc: 'نبني تطبيقات سريعة الاستجابة تتحمل أحمالاً عالية دون تأخير.',
  },
  {
    icon: ShieldCheck,
    title: 'أمان مضمون',
    desc: 'نطبّق أعلى معايير الأمان لحماية بياناتك وبيانات عملائك.',
  },
  {
    icon: Target,
    title: 'دقة في التسليم',
    desc: 'نلتزم بالمواعيد المتفق عليها ونسلّم في الوقت المحدد دائماً.',
  },
  {
    icon: Lightbulb,
    title: 'حلول مبتكرة',
    desc: 'نفكر معك بشكل إبداعي لنقدم حلولاً تتفوق على المنافسين.',
  },
  {
    icon: Wrench,
    title: 'دعم مستمر',
    desc: 'لا نتركك بعد الإطلاق — دعم وتحسينات مستمرة لضمان نجاحك.',
  },
  {
    icon: HeartHandshake,
    title: 'شراكة لا مجرد عمل',
    desc: 'نتعامل مع كل مشروع كأنه مشروعنا الخاص، ونهتم بكل تفصيلة.',
  },
];

export type TeamMember = {
  name: string;
  role: string;
  initials: string;
  gradient: string;
};

export const team: TeamMember[] = [
  { name: 'محمد العبدالله', role: 'المؤسس والمدير التنفيذي', initials: 'مع', gradient: 'from-accent-500 to-accent-700' },
  { name: 'ليان الحربي', role: 'مديرة التصميم', initials: 'لح', gradient: 'from-mint-400 to-accent-500' },
  { name: 'عبدالرحمن السالم', role: 'مدير هندسة البرمجيات', initials: 'عس', gradient: 'from-accent-600 to-mint-500' },
  { name: 'نورة القحطاني', role: 'مديرة المشاريع', initials: 'نق', gradient: 'from-accent-400 to-accent-600' },
];
