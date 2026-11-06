import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTabId } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import {
  DashboardPage,
  SimulatorPage,
  LibraryPage,
  LandingPage,
} from './pages';

const AppContent: React.FC = () => {
  const { loginDemo, isAuthenticated } = useAuth();
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
      setActiveTab('dashboard');
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
    <div className="min-h-screen bg-clinical-bg text-gray-100 flex flex-col justify-between selection:bg-clinical-teal selection:text-white">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'landing' ? (
          <LandingPage
            onStartDemo={handleStartDemo}
            onExploreWorlds={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardPage
            onSelectSpecialty={handleSelectSpecialty}
            onSelectCase={handleSelectCase}
          />
        ) : activeTab === 'simulator' ? (
          <SimulatorPage
            initialCaseId={selectedCase || undefined}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'library' ? (
          <LibraryPage onSelectCase={handleSelectCase} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400">
            <h2 className="text-xl font-bold text-white mb-2">
              Modulo Clinico en Preparacion
            </h2>
            <p className="text-sm max-w-md mx-auto">
              Esta estacion clinica sera desplegada en las siguientes fases del simulador adaptativo.
            </p>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {activeTab !== 'landing' && (
        <footer className="border-t border-clinical-border py-6 px-4 text-center">
          <p className="text-xs font-mono text-gray-500">
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
