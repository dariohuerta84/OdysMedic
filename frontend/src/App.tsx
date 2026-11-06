import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTabId } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import {
  DashboardPage,
  SimulatorPage,
  LibraryPage,
  LandingPage,
  DiagnosticExamPage,
} from './pages';

const AppContent: React.FC = () => {
  const { user, loginDemo, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabId | string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const handleSelectSpecialty = (specialtyId: string) => {
    if (specialtyId === 'nefrologia') {
      setSelectedCase('case-nefro-001');
    } else if (specialtyId === 'endocrinologia') {
      setSelectedCase('case-endo-002');
    } else if (specialtyId === 'neurologia') {
      setSelectedCase('case-neuro-003');
    } else {
      setSelectedCase('case-nefro-001');
    }
    setActiveTab('simulator');
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCase(caseId);
    setActiveTab('simulator');
  };

  const handleStartDemo = async () => {
    if (isAuthenticated) {
      if (user && !user.diagnostic_completed) {
        setActiveTab('diagnostic');
      } else {
        setActiveTab('dashboard');
      }
      return;
    }
    try {
      await loginDemo();
      setActiveTab('dashboard');
    } catch {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg text-slate-800 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 pb-12">
        <div key={activeTab} className="animate-fade-in-up">
          {activeTab === 'landing' ? (
            <LandingPage
              onStartDemo={handleStartDemo}
              onExploreWorlds={() => setActiveTab('dashboard')}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardPage
              onSelectSpecialty={handleSelectSpecialty}
              onSelectCase={handleSelectCase}
              onStartDiagnostic={() => setActiveTab('diagnostic')}
            />
          ) : activeTab === 'diagnostic' ? (
            <DiagnosticExamPage
              onComplete={() => setActiveTab('dashboard')}
            />
          ) : activeTab === 'simulator' ? (
            <SimulatorPage
              initialCaseId={selectedCase || undefined}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          ) : activeTab === 'library' ? (
            <LibraryPage onSelectCase={handleSelectCase} />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-slate-500">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Modulo Clinico en Preparacion
              </h2>
              <p className="text-sm max-w-md mx-auto">
                Esta estacion clinica sera desplegada en las siguientes fases del simulador adaptativo.
              </p>
            </div>
          )}
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {activeTab !== 'landing' && (
        <footer className="border-t border-slate-200 py-6 px-4 text-center bg-white">
          <p className="text-xs font-mono text-slate-500">
            ODYSSMEDIC PRECISION ENGINE - BIOINCUBADORA CAYETANO 2026
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
