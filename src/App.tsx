import { ThemeProvider } from '@/context/ThemeContext';
import { LangProvider } from '@/context/LangContext';
import AdminApp from '@/admin/AdminApp';
import { SiteContentProvider } from '@/context/SiteContentContext';
import { DesignProvider } from '@/context/DesignContext';
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

export default function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminApp />;

  return (
    <ThemeProvider>
      <LangProvider>
        <SiteContentProvider>
          <DesignProvider>
          <div className="min-h-screen bg-ink-50 pb-12 transition-colors duration-300 dark:bg-ink-950">
            <Navbar />
            <main>
              <Hero />
              <HeroAd />
              <CustomAdSlots location="after-hero" />
              <Marquee />
              <Services />
              <CustomAdSlots location="after-services" />
              <Features />
              <Process />
              <Work />
              <CustomAdSlots location="after-work" />
              <Team />
              <CustomAdSlots location="after-team" />
              <Testimonials />
              <CustomAdSlots location="after-testimonials" />
              <Cta />
              <Faq />
              <CustomAdSlots location="before-contact" />
              <Contact />
              <CustomAdSlots location="after-contact" />
              <Reviews />
            </main>
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
