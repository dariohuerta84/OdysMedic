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

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabId | string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [onboardingTrack, setOnboardingTrack] = useState<OnboardingTrack>('ruta');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // Enforce mandatory registration gate for Mundo Clinico, Simulator and Diagnostic
  useEffect(() => {
    if (!isLoading && !isAuthenticated && PROTECTED_TABS.has(activeTab)) {
      setActiveTab('landing');
    }
  }, [isLoading, isAuthenticated, activeTab]);

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
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSpecialty = (specialtyId: string) => {
    if (!isAuthenticated) {
      openAuthModal('register', 'ruta');
      return;
    }
    if (specialtyId === 'nefrologia') {
      setSelectedCase('s13256-019-2334-y');
    } else if (specialtyId === 'endocrinologia') {
      setSelectedCase('s13256-022-03392-w');
    } else if (specialtyId === 'neurologia') {
      setSelectedCase('s13256-023-04294-1');
    } else if (specialtyId === 'oftalmologia') {
      setSelectedCase('s13256-024-04496-1');
    } else if (specialtyId === 'ginecologia_obstetricia') {
      setSelectedCase('s13256-025-05650-z');
    } else if (specialtyId === 'reumatologia') {
      setSelectedCase('s13256-026-05974-4');
    } else {
      setSelectedCase('s13256-019-2334-y');
    }
    setActiveTab('simulator');
  };

  const handleSelectCase = (caseId: string) => {
    if (!isAuthenticated) {
      openAuthModal('register', 'ruta');
      return;
    }
    setSelectedCase(caseId);
    setActiveTab('simulator');
  };

  const handleStartRoute = () => {
    if (isAuthenticated) {
      if (user && !user.diagnostic_completed) {
        setActiveTab('diagnostic');
      } else {
        setActiveTab('dashboard');
      }
      return;
    }
    openAuthModal('register', 'ruta');
  };

  const handleAuthSuccess = (destination: 'diagnostic' | 'dashboard') => {
    setIsAuthModalOpen(false);
    setActiveTab(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFA] text-[#0B252E] flex flex-col justify-between">
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        onOpenAuth={(mode = 'login') => openAuthModal(mode, 'ruta')}
      />

      {/* Important: no persistent CSS transform on main so fixed modals align to viewport */}
      <main className="flex-1">
        {activeTab === 'landing' ? (
          <LandingPage
            onStartRoute={handleStartRoute}
            onOpenLibrary={() => handleNavigateTab('library')}
          />
        ) : activeTab === 'dashboard' && isAuthenticated ? (
          <DashboardPage
            onSelectSpecialty={handleSelectSpecialty}
            onSelectCase={handleSelectCase}
            onStartDiagnostic={() => setActiveTab('diagnostic')}
          />
        ) : activeTab === 'diagnostic' && isAuthenticated ? (
          <DiagnosticExamPage
            onComplete={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'simulator' && isAuthenticated ? (
          <SimulatorPage
            initialCaseId={selectedCase || undefined}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'library' ? (
          <LibraryPage
            onSelectCase={handleSelectCase}
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
        <footer className="border-t border-[#E3E8E6] py-6 px-4 text-center bg-[#FDFCFA]">
          <p className="text-xs text-[#6E828A] tracking-wide">
            OdyssMedic · Formacion y Razonamiento Clinico Basado en Evidencia
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
