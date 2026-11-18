import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { PageTransitionOverlay } from './components/PageTransitionOverlay';
import { ReadingProgressBar } from './components/ReadingProgressBar';
import { StudioChat } from './components/StudioChat';
import { extractQueryParam, useRouter } from './lib/router';
import { ThemeProvider } from './lib/theme';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { Studio3DPage } from './pages/Studio3DPage';

export default function App() {
  const { route, search, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const preselectedService = extractQueryParam(search, 'service');

  const renderPage = () => {
    switch (route.id) {
      case 'services':
        return <ServicesPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'studio':
        return <Studio3DPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage initialService={preselectedService} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-canvas text-ink">
        {mapsQuotaExceeded ? (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        ) : null}

        <ReadingProgressBar routeKey={route.id} />
        <PageTransitionOverlay routeKey={route.id} />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-btn focus:text-btn-ink focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest"
        >
          Skip to main content
        </a>

        <Header
          activeRoute={route.id}
          onNavigate={navigate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenConcierge={() => setChatOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <MobileNavigation
          isOpen={mobileMenuOpen}
          activeRoute={route.id}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={navigate}
          onOpenConcierge={() => setChatOpen(true)}
        />

        <main id="main-content" className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={route.id}
              data-testid="route-transition-stage"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.992, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.996 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {route.id !== 'studio' ? (
          <Footer activeRoute={route.id} onNavigate={navigate} />
        ) : null}

        {route.id !== 'studio' && !chatOpen ? (
          <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">
            <BackToTop routeKey={route.id} />
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              data-testid="floating-concierge-button"
              aria-label="Ask Orpheus Studio Concierge"
              className="editorial-btn-hover inline-flex items-center gap-2 bg-btn text-btn-ink border border-ink/20 px-4 py-3 text-xs font-sans font-medium uppercase tracking-[0.16em] shadow-lg hover:bg-accent hover:text-parchment hover:border-accent cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ask Studio</span>
            </button>
          </div>
        ) : null}

        <StudioChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onNavigate={navigate}
        />
      </div>
    </ThemeProvider>
  );
}
