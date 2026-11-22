import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTabId } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import type { OnboardingTrack } from './types/api';
import {
  DashboardPage,
  SimulatorPage,
  LibraryPage,
  LandingPage,
  DiagnosticExamPage,
} from './pages';

const PROTECTED_TABS = new Set(['dashboard', 'simulator', 'diagnostic']);

function runViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(
        update
      );
      return;
    }
  }
  update();
}

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabId | string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [onboardingTrack, setOnboardingTrack] = useState<OnboardingTrack>('ruta');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<number | undefined>(undefined);

  // Enforce mandatory registration gate for Mundo Clinico, Simulator and Diagnostic
  useEffect(() => {
    if (!isLoading && !isAuthenticated && PROTECTED_TABS.has(activeTab)) {
      setActiveTab('landing');
    }
  }, [isLoading, isAuthenticated, activeTab]);

  // Fallback scroll progress variable for browsers without native animation-timeline: scroll()
  useEffect(() => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return;
    if (CSS.supports && CSS.supports('animation-timeline: scroll()')) return;

    let rafId = 0;
    const updateProgress = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      doc.style.setProperty('--scroll-progress', String(ratio));
      rafId = 0;
    };
    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const openAuthModal = (
    mode: 'login' | 'register' = 'login',
    track: OnboardingTrack = 'ruta'
  ) => {
    setAuthModalMode(mode);
    setOnboardingTrack(track);
    setIsAuthModalOpen(true);
  };

  const handleNavigateTab = (targetTab: string) => {
    if (!isAuthenticated && PROTECTED_TABS.has(targetTab)) {
      openAuthModal('register', 'ruta');
      return;
    }
    runViewTransition(() => {
      if (targetTab !== 'simulator') {
        setSelectedStation(undefined);
      }
      setActiveTab(targetTab);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSpecialty = (specialtyId: string) => {
    if (!isAuthenticated) {
      openAuthModal('register', 'ruta');
      return;
    }
    let nextCase = 's13256-019-2334-y';
    if (specialtyId === 'endocrinologia') nextCase = 's13256-022-03392-w';
    else if (specialtyId === 'neurologia') nextCase = 's13256-023-04294-1';
    else if (specialtyId === 'oftalmologia') nextCase = 's13256-024-04496-1';
    else if (specialtyId === 'ginecologia_obstetricia') nextCase = 's13256-025-05650-z';
    else if (specialtyId === 'reumatologia') nextCase = 's13256-026-05974-4';

    runViewTransition(() => {
      setSelectedCase(nextCase);
      setSelectedStation(1);
      setActiveTab('simulator');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCase = (caseId: string, stationNumber?: number) => {
    if (!isAuthenticated) {
      openAuthModal('register', 'ruta');
      return;
    }
    runViewTransition(() => {
      setSelectedCase(caseId);
      setSelectedStation(stationNumber);
      setActiveTab('simulator');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartRoute = () => {
    if (isAuthenticated) {
      runViewTransition(() => {
        if (user && !user.diagnostic_completed) {
          setActiveTab('diagnostic');
        } else {
          setActiveTab('dashboard');
        }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    openAuthModal('register', 'ruta');
  };

  const handleAuthSuccess = (destination: 'diagnostic' | 'dashboard') => {
    setIsAuthModalOpen(false);
    runViewTransition(() => {
      setActiveTab(destination);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1F26] flex flex-col justify-between">
      <div className="scroll-progress-hairline" aria-hidden="true" />
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        onOpenAuth={(mode = 'login') => openAuthModal(mode, 'ruta')}
      />

      {/* Important: no persistent CSS transform on main so fixed modals align to viewport */}
      <main className="flex-1 relative z-10">
        {activeTab === 'landing' ? (
          <LandingPage
            onStartRoute={handleStartRoute}
            onOpenLibrary={() => handleNavigateTab('library')}
          />
        ) : activeTab === 'dashboard' && isAuthenticated ? (
          <DashboardPage
            onSelectSpecialty={handleSelectSpecialty}
            onSelectCase={handleSelectCase}
            onStartDiagnostic={() => handleNavigateTab('diagnostic')}
          />
        ) : activeTab === 'diagnostic' && isAuthenticated ? (
          <DiagnosticExamPage
            onComplete={() => handleNavigateTab('dashboard')}
          />
        ) : activeTab === 'simulator' && isAuthenticated ? (
          <SimulatorPage
            initialCaseId={selectedCase || undefined}
            initialStationNumber={selectedStation}
            onBackToDashboard={() => handleNavigateTab('dashboard')}
          />
        ) : activeTab === 'library' ? (
          <LibraryPage
            onSelectCase={(cid) => handleSelectCase(cid, 1)}
            onRequireAuth={() => openAuthModal('register', 'ruta')}
          />
        ) : null}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onboardingTrack={onboardingTrack}
        onAuthSuccess={handleAuthSuccess}
      />

      {activeTab !== 'landing' && (
        <footer className="border-t border-[#DEDBD2] py-6 px-4 text-center bg-[#FAF9F6] relative z-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#64767E]">
            OdyssMedic · Motor OCRI-HLR · Razonamiento Clinico Basado en Evidencia
          </p>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
