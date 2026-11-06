import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, NavTabId } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardPage } from './pages/DashboardPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId | string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [, setSelectedSpecialty] = useState<string | null>(null);
  const [, setSelectedCase] = useState<string | null>(null);

  const handleSelectSpecialty = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCase(caseId);
  };

  return (
    <div className="min-h-screen bg-clinical-bg text-gray-100 flex flex-col justify-between selection:bg-clinical-teal selection:text-white">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' ? (
          <DashboardPage
            onSelectSpecialty={handleSelectSpecialty}
            onSelectCase={handleSelectCase}
          />
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

      <footer className="border-t border-clinical-border py-6 px-4 text-center">
        <p className="text-xs font-mono text-gray-500">
          ODYSSMEDIC PRECISION ENGINE - BIOINCUBADORA CAYETANO 2026
        </p>
      </footer>
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
