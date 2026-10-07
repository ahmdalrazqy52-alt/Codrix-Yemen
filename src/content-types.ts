import {
  Code2, Smartphone, Cloud, Brain, ShieldCheck, Gauge, Layout, Server,
  Boxes, GitBranch, Workflow, Rocket, Zap, Clock, Users, Trophy,
  HeartHandshake, Target, Lightbulb, Wrench, Star, Sparkles,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Code2, Smartphone, Cloud, Brain, ShieldCheck, Gauge, Layout, Server,
  Boxes, GitBranch, Workflow, Rocket, Zap, Clock, Users, Trophy,
  HeartHandshake, Target, Lightbulb, Wrench, Star, Sparkles,
};

export const iconNames = Object.keys(iconMap);

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Code2;
}

export type SiteSettings = {
  companyName: string;
  englishName: string;
  phone: string;
  address: string;
  email: string;
  contactRecipientEmail: string;
  logoLight: string;
  logoDark: string;
};

export type HomeContent = {
  eyebrow: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export type ServiceItem = { icon: string; title: string; desc: string; points: string[] };
export type ServicesContent = { eyebrow: string; title: string; subtitle: string; items: ServiceItem[] };

export type StatItem = { value: string; label: string };
export type StepItem = { num: string; title: string; desc: string };
export type ProcessContent = { eyebrow: string; title: string; subtitle: string; stats: StatItem[]; steps: StepItem[] };

export type TechItem = { name: string; icon: string };
export type TechContent = { label: string; items: TechItem[] };

export type ProjectItem = { title: string; category: string; desc: string; image: string; tags: string[] };
export type WorkContent = { eyebrow: string; title: string; subtitle: string; projects: ProjectItem[] };

export type FeatureItem = { icon: string; title: string; desc: string };
export type FeaturesContent = { eyebrow: string; title: string; subtitle: string; items: FeatureItem[] };

export type TeamMember = { name: string; role: string; initials: string; gradient: string };
export type TeamContent = { eyebrow: string; title: string; subtitle: string; members: TeamMember[] };

export type TestimonialItem = { name: string; role: string; text: string; initials: string };
export type TestimonialsContent = { eyebrow: string; title: string; subtitle: string; items: TestimonialItem[] };

export type CtaContent = { badge: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };

export type FaqItem = { q: string; a: string };
export type FaqContent = { eyebrow: string; title: string; subtitle: string; items: FaqItem[] };

export type FooterContent = { description: string; socialLinks: { label: string; href: string; iconUrl?: string }[] };

export type AdContent = {
  heroAd: { visible: boolean; image: string; href: string; text: string };
  bottomBar: { visible: boolean; text: string; href: string };
};

export type ReviewsContent = { visible: boolean };

export type SectionName =
  | 'settings' | 'home' | 'services' | 'process' | 'work'
  | 'tech' | 'features' | 'team' | 'testimonials' | 'cta' | 'faq' | 'footer' | 'ads' | 'reviews';

export type AllContent = {
  settings: SiteSettings;
  home: HomeContent;
  services: ServicesContent;
  process: ProcessContent;
  work: WorkContent;
  tech: TechContent;
  features: FeaturesContent;
  team: TeamContent;
  testimonials: TestimonialsContent;
  cta: CtaContent;
  faq: FaqContent;
  footer: FooterContent;
  ads: AdContent;
  reviews: ReviewsContent;
};

export const defaultContent: AllContent = {
  settings: {
    companyName: 'كودركس يمن', englishName: 'CODRIX YEMEN',
    phone: '771143583', address: 'اليمن، صنعاء',
    email: 'hello@coderedux.tech', contactRecipientEmail: 'ahmdalrazqy52@gmail.com',
    logoLight: '/assets/images/InShot_20260929_205902172.png',
    logoDark: '/assets/images/InShot_20260929_205505756.png',
  },
  home: {
    eyebrow: 'شركة تطوير وتقنية',
    title: 'نبني التطبيقات والبرامج التي تُحرّك أعمالك نحو الأمام',
    description: 'نُصمم ونطوّر تطبيقات ومنصات رقمية متكاملة بجودة عالية وأداء فائق، من الفكرة حتى الإطلاق وما بعده.',
    ctaPrimary: 'ابدأ مشروعك معنا', ctaSecondary: 'شاهد أعمالنا',
  },
  services: {
    eyebrow: 'ماذا نقدم', title: 'خدمات تقنية متكاملة',
    subtitle: 'من التخطيط إلى الإطلاق، نغطّي كل ما تحتاجه لإنشاء منتج رقمي ناجح.',
    items: [
      { icon: 'Code2', title: 'تطوير الويب', desc: 'مواقع ومنصات ويب حديثة سريعة وقابلة للتطوير، مبنية بأحدث التقنيات.', points: ['واجهات تفاعلية', 'لوحات تحكم', 'متاجر إلكترونية'] },
      { icon: 'Smartphone', title: 'تطبيقات الجوال', desc: 'تطبيقات iOS و Android بتجربة استخدام سلسة وأداء عالٍ.', points: ['تصميم أصلي', 'إشعارات فورية', 'عمل دون اتصال'] },
      { icon: 'Brain', title: 'الذكاء الاصطناعي', desc: 'حلول ذكاء اصطناعي وتعلّم آلي تُضيف قيمة حقيقية لمنتجك.', points: ['نماذج تنبؤية', 'معالجة لغة', 'أتمتة ذكية'] },
      { icon: 'Cloud', title: 'الحوسبة السحابية', desc: 'بنية تحتية سحابية موثوقة وقابلة للتوسع حسب نمو أعمالك.', points: ['توسّع تلقائي', 'نسخ احتياطي', 'مراقبة 24/7'] },
      { icon: 'Layout', title: 'تصميم تجربة المستخدم', desc: 'تصاميم أنيقة تركز على المستخدم وتحوّل الزوار إلى عملاء.', points: ['واجهات UI/UX', 'اختبار قابلية', 'هوية بصرية'] },
      { icon: 'ShieldCheck', title: 'الأمن السيبراني', desc: 'تدقيق وحماية الأنظمة من الثغرات وفق أعلى المعايير.', points: ['تدقيق أمني', 'اختبار اختراق', 'حماية البيانات'] },
    ],
  },
  process: {
    eyebrow: 'آلية العمل', title: 'كيف نُنجز مشاريعنا',
    subtitle: 'منهجية واضحة من أربع مراحل تضمن وصول منتجك بأفضل صورة ممكنة.',
    stats: [
      { value: '+120', label: 'مشروع منجز' }, { value: '+45', label: 'عميل حول العالم' },
      { value: '8', label: 'سنوات خبرة' }, { value: '99.9%', label: 'نسبة التشغيل' },
    ],
    steps: [
      { num: '01', title: 'الاكتشاف والتخطيط', desc: 'نفهم أهدافك ومتطلباتك بعمق، ونضع خريطة طريق واضحة للمشروع.' },
      { num: '02', title: 'التصميم والنموذج الأولي', desc: 'نصمم تجربة المستخدم والواجهات، ونعرض نماذج أولية للمراجعة.' },
      { num: '03', title: 'التطوير والبناء', desc: 'نبني المنتج بكود نظيف وقابل للتوسع مع اختبارات مستمرة.' },
      { num: '04', title: 'الإطلاق والدعم', desc: 'نطلق المنتج ونتابعه بالدعم والتحسينات المستمرة بعد الإطلاق.' },
    ],
  },
  work: {
    eyebrow: 'أعمالنا', title: 'مشاريع نفخر بإنجازها',
    subtitle: 'نماذج من المنتجات التي بنيناها لعملائنا بأداء عالٍ وتجربة استخدام مميزة.',
    projects: [
      { title: 'منصة تجارة إلكترونية', category: 'ويب', desc: 'متجر متكامل بنظام دفع ولوحة تحكم للتجار وتحليلات مباشرة.', image: 'https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['React', 'Supabase', 'Payments'] },
      { title: 'تطبيق إدارة الأعمال', category: 'جوال', desc: 'تطبيق جوال لإدارة المهام والمشاريع مع تكامل أدوات سحابية.', image: 'https://images.pexels.com/photos/38639/mockup-psd-ipad-iphone-38639.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['iOS', 'Android', 'Cloud'] },
      { title: 'لوحة تحكم تحليلات', category: 'بيانات', desc: 'لوحة بيانات تفاعلية تعرض مؤشرات الأداء في الوقت الحقيقي.', image: 'https://images.pexels.com/photos/7988745/pexels-photo-7988745.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['Dashboard', 'Charts', 'API'] },
      { title: 'بنية سحابية موزّعة', category: 'بنية تحتية', desc: 'تصميم ونشر بنية سحابية قابلة للتوسع لخدمات عالية الحمل.', image: 'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['Cloud', 'DevOps', 'Scaling'] },
    ],
  },
  tech: {
    label: 'تقنيات نعمل بها',
    items: [
      { name: 'React', icon: 'Code2' }, { name: 'Node.js', icon: 'Server' },
      { name: 'TypeScript', icon: 'Boxes' }, { name: 'Supabase', icon: 'Cloud' },
      { name: 'CI/CD', icon: 'GitBranch' }, { name: 'Automation', icon: 'Workflow' },
      { name: 'Performance', icon: 'Gauge' }, { name: 'DevOps', icon: 'Rocket' },
    ],
  },
  features: {
    eyebrow: 'لماذا نحن', title: 'ما الذي يميّزنا',
    subtitle: 'نقدم أكثر من مجرد كود — نقدم شراكة حقيقية تضمن نجاح منتجك.',
    items: [
      { icon: 'Zap', title: 'أداء فائق', desc: 'نبني تطبيقات سريعة الاستجابة تتحمل أحمالاً عالية دون تأخير.' },
      { icon: 'ShieldCheck', title: 'أمان مضمون', desc: 'نطبّق أعلى معايير الأمان لحماية بياناتك وبيانات عملائك.' },
      { icon: 'Target', title: 'دقة في التسليم', desc: 'نلتزم بالمواعيد المتفق عليها ونسلّم في الوقت المحدد دائماً.' },
      { icon: 'Lightbulb', title: 'حلول مبتكرة', desc: 'نفكر معك بشكل إبداعي لنقدم حلولاً تتفوق على المنافسين.' },
      { icon: 'Wrench', title: 'دعم مستمر', desc: 'لا نتركك بعد الإطلاق — دعم وتحسينات مستمرة لضمان نجاحك.' },
      { icon: 'HeartHandshake', title: 'شراكة لا مجرد عمل', desc: 'نتعامل مع كل مشروع كأنه مشروعنا الخاص، ونهتم بكل تفصيلة.' },
    ],
  },
  team: {
    eyebrow: 'فريقنا', title: 'العقول وراء كودركس يمن',
    subtitle: 'فريق من المبدعين والمهندسين المتخصصين في مجالاتهم، يعمل بشغف لتحقيق رؤيتك.',
    members: [
      { name: 'محمد العبدالله', role: 'المؤسس والمدير التنفيذي', initials: 'مع', gradient: 'from-accent-500 to-accent-700' },
      { name: 'ليان الحربي', role: 'مديرة التصميم', initials: 'لح', gradient: 'from-mint-400 to-accent-500' },
      { name: 'عبدالرحمن السالم', role: 'مدير هندسة البرمجيات', initials: 'عس', gradient: 'from-accent-600 to-mint-500' },
      { name: 'نورة القحطاني', role: 'مديرة المشاريع', initials: 'نق', gradient: 'from-accent-400 to-accent-600' },
    ],
  },
  testimonials: {
    eyebrow: 'آراء العملاء', title: 'ماذا يقولون عنّا',
    subtitle: 'ثقة عملائنا هي محركنا. نفخر بشراكاتنا طويلة الأمد.',
    items: [
      { name: 'أحمد المنصور', role: 'مدير تنفيذي - شركة تقنية', text: 'فريق كودركس يمن حوّل فكرتنا إلى منتج متكامل باحترافية عالية. التواصل ممتاز والتسليم في الموعد.', initials: 'أم' },
      { name: 'سارة العتيبي', role: 'مؤسسة منصة تجارية', text: 'جودة العمل تفوق التوقعات. التطبيق أصبح سريعاً وسهل الاستخدام ومبيعاتنا زادت بشكل ملحوظ.', initials: 'سع' },
      { name: 'خالد الرشيد', role: 'مدير منتج', text: 'تعاملت مع شركات كثيرة لكن كودركس يمن تتميز بالشفافية والاهتمام بأدق التفاصيل.', initials: 'خر' },
    ],
  },
  cta: {
    badge: 'جاهز للانطلاق؟', title: 'لنحوّل فكرتك إلى منتج رقمي يصنع الفرق',
    subtitle: 'تواصل معنا اليوم واحصل على استشارة مجانية وخطة واضحة لمشروعك.',
    ctaPrimary: 'ابدأ مشروعك الآن', ctaSecondary: 'تصفّح خدماتنا',
  },
  faq: {
    eyebrow: 'الأسئلة الشائعة', title: 'إجابات لأكثر ما يُسأل',
    subtitle: 'لم تجد إجابتك؟ تواصل معنا مباشرة وسنرد على كل استفساراتك.',
    items: [
      { q: 'كم تستغرق مدة تنفيذ المشروع؟', a: 'تختلف المدة حسب حجم المشروع وتعقيده. المشاريع الصغيرة تستغرق 2-4 أسابيع، بينما المشاريع المتوسطة والكبيرة من 2 إلى 6 أشهر. نزوّدك بجدول زمني واضح بعد مرحلة التخطيط.' },
      { q: 'هل تقدمون الدعم بعد إطلاق المشروع؟', a: 'نعم، نقدم باقات دعم وصيانة بعد الإطلاق تشمل إصلاح الأخطاء والتحديثات والتحسينات المستمرة لضمان استقرار منتجك.' },
      { q: 'ما هي طريقة التواصل ومتابعة المشروع؟', a: 'نخصص لك قناة تواصل مباشرة وتقارير دورية عن تقدم العمل، مع اجتماعات أسبوعية لمراجعة المراحل والملاحظات.' },
      { q: 'هل تعملون بمشاريع للشركات الناشئة؟', a: 'بالتأكيد. لدينا باقات مخصصة للشركات الناشئة تشمل بناء نسخة أولية (MVP) بسرعة وكفاءة لاختبار الفكرة في السوق.' },
      { q: 'هل يمكنكم التكامل مع أنظمة موجودة لدينا؟', a: 'نعم، لدينا خبرة في التكامل مع مختلف الأنظمة والخدمات الخارجية عبر واجهات البرمجة (APIs) وضمان عمل كل شيء بسلاسة.' },
    ],
  },
  footer: {
    description: 'شركة متخصصة في تطوير التطبيقات والبرامج وبناء الأنظمة التقنية المتكاملة. نحوّل الأفكار إلى منتجات رقمية تعمل.',
    socialLinks: [
      { label: 'GitHub', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'Twitter', href: '#' },
    ],
  },
  ads: {
    heroAd: { visible: false, image: '', href: '#', text: '' },
    bottomBar: { visible: false, text: '', href: '#' },
  },
  reviews: { visible: true },
};

export const defaultContentEn: AllContent = {
  settings: {
    companyName: 'CODRIX YEMEN', englishName: 'CODRIX YEMEN',
    phone: '771143583', address: 'Sana\'a, Yemen',
    email: 'hello@coderedux.tech', contactRecipientEmail: 'ahmdalrazqy52@gmail.com',
    logoLight: '/assets/images/InShot_20260929_205902172.png',
    logoDark: '/assets/images/InShot_20260929_205505756.png',
  },
  home: {
    eyebrow: 'Software & Technology',
    title: 'We build apps and software that drive your business forward',
    description: 'We design and develop integrated digital platforms with high quality and top performance — from idea to launch and beyond.',
    ctaPrimary: 'Start Your Project', ctaSecondary: 'View Our Work',
  },
  services: {
    eyebrow: 'What We Do', title: 'Integrated Tech Services',
    subtitle: 'From planning to launch, we cover everything you need to build a successful digital product.',
    items: [
      { icon: 'Code2', title: 'Web Development', desc: 'Modern, fast, and scalable web platforms built with the latest technologies.', points: ['Interactive UIs', 'Dashboards', 'E-commerce'] },
      { icon: 'Smartphone', title: 'Mobile Apps', desc: 'iOS and Android apps with smooth UX and high performance.', points: ['Native design', 'Push notifications', 'Offline mode'] },
      { icon: 'Brain', title: 'AI Solutions', desc: 'AI and machine learning solutions that add real value to your product.', points: ['Predictive models', 'NLP', 'Smart automation'] },
      { icon: 'Cloud', title: 'Cloud Computing', desc: 'Reliable, scalable cloud infrastructure that grows with your business.', points: ['Auto-scaling', 'Backups', '24/7 monitoring'] },
      { icon: 'Layout', title: 'UX Design', desc: 'Elegant, user-focused designs that turn visitors into customers.', points: ['UI/UX', 'Usability testing', 'Visual identity'] },
      { icon: 'ShieldCheck', title: 'Cybersecurity', desc: 'Audit and protect your systems against vulnerabilities.', points: ['Security audits', 'Penetration testing', 'Data protection'] },
    ],
  },
  process: {
    eyebrow: 'Our Process', title: 'How We Deliver',
    subtitle: 'A clear four-stage methodology that ensures your product ships at its best.',
    stats: [
      { value: '+120', label: 'Projects Delivered' }, { value: '+45', label: 'Global Clients' },
      { value: '8', label: 'Years Experience' }, { value: '99.9%', label: 'Uptime' },
    ],
    steps: [
      { num: '01', title: 'Discovery & Planning', desc: 'We deeply understand your goals and requirements, then craft a clear roadmap.' },
      { num: '02', title: 'Design & Prototyping', desc: 'We design the UX and interfaces, then present prototypes for review.' },
      { num: '03', title: 'Development & Build', desc: 'We build the product with clean, scalable code and continuous testing.' },
      { num: '04', title: 'Launch & Support', desc: 'We launch and follow up with ongoing support and improvements.' },
    ],
  },
  work: {
    eyebrow: 'Our Work', title: 'Projects We\'re Proud Of',
    subtitle: 'Samples of products we built for clients with high performance and great UX.',
    projects: [
      { title: 'E-commerce Platform', category: 'Web', desc: 'A full store with payment system, merchant dashboard, and real-time analytics.', image: 'https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['React', 'Supabase', 'Payments'] },
      { title: 'Business Management App', category: 'Mobile', desc: 'A mobile app for task and project management with cloud tool integrations.', image: 'https://images.pexels.com/photos/38639/mockup-psd-ipad-iphone-38639.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['iOS', 'Android', 'Cloud'] },
      { title: 'Analytics Dashboard', category: 'Data', desc: 'An interactive dashboard showing real-time KPIs and performance metrics.', image: 'https://images.pexels.com/photos/7988745/pexels-photo-7988745.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['Dashboard', 'Charts', 'API'] },
      { title: 'Distributed Cloud Infrastructure', category: 'Infrastructure', desc: 'Designing and deploying scalable cloud infrastructure for high-traffic services.', image: 'https://images.pexels.com/photos/37730211/pexels-photo-37730211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', tags: ['Cloud', 'DevOps', 'Scaling'] },
    ],
  },
  tech: {
    label: 'Technologies We Work With',
    items: [
      { name: 'React', icon: 'Code2' }, { name: 'Node.js', icon: 'Server' },
      { name: 'TypeScript', icon: 'Boxes' }, { name: 'Supabase', icon: 'Cloud' },
      { name: 'CI/CD', icon: 'GitBranch' }, { name: 'Automation', icon: 'Workflow' },
      { name: 'Performance', icon: 'Gauge' }, { name: 'DevOps', icon: 'Rocket' },
    ],
  },
  features: {
    eyebrow: 'Why Us', title: 'What Sets Us Apart',
    subtitle: 'We deliver more than just code — a true partnership that ensures your product succeeds.',
    items: [
      { icon: 'Zap', title: 'Top Performance', desc: 'We build fast, responsive apps that handle high loads without delay.' },
      { icon: 'ShieldCheck', title: 'Guaranteed Security', desc: 'We apply the highest security standards to protect your data and your users.' },
      { icon: 'Target', title: 'On-Time Delivery', desc: 'We commit to agreed deadlines and always deliver on schedule.' },
      { icon: 'Lightbulb', title: 'Innovative Solutions', desc: 'We think creatively with you to deliver solutions that outperform competitors.' },
      { icon: 'Wrench', title: 'Ongoing Support', desc: 'We don\'t leave you after launch — continuous support and improvements.' },
      { icon: 'HeartHandshake', title: 'Partnership, Not Just Work', desc: 'We treat every project as our own and care about every detail.' },
    ],
  },
  team: {
    eyebrow: 'Our Team', title: 'The Minds Behind CODRIX YEMEN',
    subtitle: 'A team of creatives and engineers specialized in their fields, working with passion to realize your vision.',
    members: [
      { name: 'Mohammed Al-Abdullah', role: 'Founder & CEO', initials: 'MA', gradient: 'from-accent-500 to-accent-700' },
      { name: 'Layan Al-Harbi', role: 'Design Director', initials: 'LA', gradient: 'from-mint-400 to-accent-500' },
      { name: 'Abdulrahman Al-Salem', role: 'Engineering Manager', initials: 'AS', gradient: 'from-accent-600 to-mint-500' },
      { name: 'Noura Al-Qahtani', role: 'Project Manager', initials: 'NQ', gradient: 'from-accent-400 to-accent-600' },
    ],
  },
  testimonials: {
    eyebrow: 'Testimonials', title: 'What Clients Say',
    subtitle: 'Our clients\' trust is our engine. We pride ourselves on long-term partnerships.',
    items: [
      { name: 'Ahmed Al-Mansour', role: 'CEO - Tech Company', text: 'The CODRIX YEMEN team turned our idea into a complete product with high professionalism. Communication was excellent and delivery was on time.', initials: 'AM' },
      { name: 'Sarah Al-Otaibi', role: 'Founder, E-commerce Platform', text: 'The quality of work exceeded expectations. The app became fast and easy to use, and our sales increased noticeably.', initials: 'SO' },
      { name: 'Khaled Al-Rashid', role: 'Product Manager', text: 'I\'ve worked with many companies, but CODRIX YEMEN stands out for their transparency and attention to the finest details.', initials: 'KR' },
    ],
  },
  cta: {
    badge: 'Ready to Launch?', title: 'Let\'s Turn Your Idea Into a Digital Product That Makes a Difference',
    subtitle: 'Contact us today for a free consultation and a clear plan for your project.',
    ctaPrimary: 'Start Your Project Now', ctaSecondary: 'Browse Our Services',
  },
  faq: {
    eyebrow: 'FAQ', title: 'Answers to Common Questions',
    subtitle: 'Didn\'t find your answer? Contact us directly and we\'ll respond to all your inquiries.',
    items: [
      { q: 'How long does a project take?', a: 'Duration depends on project size and complexity. Small projects take 2-4 weeks, while medium and large projects take 2 to 6 months. We provide a clear timeline after the planning phase.' },
      { q: 'Do you offer support after launch?', a: 'Yes, we offer post-launch support and maintenance packages including bug fixes, updates, and continuous improvements to ensure your product stays stable.' },
      { q: 'How do you communicate and track the project?', a: 'We provide a direct communication channel and regular progress reports, with weekly meetings to review stages and feedback.' },
      { q: 'Do you work with startups?', a: 'Absolutely. We have tailored packages for startups including building an MVP quickly and efficiently to test the idea in the market.' },
      { q: 'Can you integrate with our existing systems?', a: 'Yes, we have experience integrating with various external systems and services via APIs and ensuring everything works smoothly.' },
    ],
  },
  footer: {
    description: 'A company specialized in app development and building integrated tech systems. We turn ideas into digital products that work.',
    socialLinks: [
      { label: 'GitHub', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'Twitter', href: '#' },
    ],
  },
  ads: {
    heroAd: { visible: false, image: '', href: '#', text: '' },
    bottomBar: { visible: false, text: '', href: '#' },
  },
  reviews: { visible: true },
};
