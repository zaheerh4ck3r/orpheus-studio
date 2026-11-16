import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { extractQueryParam, useRouter } from './lib/router';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';

export default function App() {
  const { route, search, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const preselectedService = extractQueryParam(search, 'service');

  const renderPage = () => {
    switch (route.id) {
      case 'services':
        return <ServicesPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage initialService={preselectedService} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-obsidian">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-obsidian focus:text-parchment focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest"
      >
        Skip to main content
      </a>

      <Header
        activeRoute={route.id}
        onNavigate={navigate}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <MobileNavigation
        isOpen={mobileMenuOpen}
        activeRoute={route.id}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={navigate}
      />

      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.id}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer activeRoute={route.id} onNavigate={navigate} />
    </div>
  );
}
