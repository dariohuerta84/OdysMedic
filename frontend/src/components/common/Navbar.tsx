import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Flame,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  BookOpen,
  Home,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTabId = 'dashboard' | 'simulator' | 'library' | 'landing' | 'diagnostic';

export interface NavbarProps {
  activeTab: NavTabId | string;
  onSelectTab: (tab: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAuth,
  className = '',
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToLandingSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (activeTab !== 'landing') {
      onSelectTab('landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 140);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    onSelectTab('landing');
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return 'MD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const authenticatedNavItems = [
    { id: 'landing', label: 'Inicio', icon: Home },
    { id: 'dashboard', label: 'Ruta Clinica', icon: Compass },
    { id: 'simulator', label: 'Simulador', icon: Activity },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
  ];

  const publicSectionLinks = [
    { label: 'Metodo OCRI-HLR', type: 'section' as const, target: 'quienes-somos' },
    { label: 'Ruta progresiva', type: 'section' as const, target: 'como-funciona' },
    { label: 'Unidades clinicas', type: 'section' as const, target: 'mundos-clinicos' },
    { label: 'Biblioteca', type: 'tab' as const, target: 'library' },
    { label: 'Comunidad', type: 'section' as const, target: 'testimonios' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navegacion Principal"
      className={`sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF9F6]/92 border-b border-[#DEDBD2] navbar-scroll-refine ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Editorial Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none py-1 transition-opacity hover:opacity-85"
          >
            <Activity className="w-5 h-5 text-[#0E6F65] stroke-[2]" />
            <span className="font-serif font-bold text-xl tracking-tight text-[#0D1F26]">
              OdyssMedic
            </span>
          </button>

          {/* Desktop Navigation */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-6">
              {authenticatedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 py-1.5 text-sm border-b-2 transition-colors ${
                      isActive
                        ? 'border-[#0E6F65] text-[#0D1F26] font-semibold'
                        : 'border-transparent text-[#3D525A] hover:text-[#0D1F26] hover:border-[#DEDBD2]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#0E6F65]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-7">
              {publicSectionLinks.map((link) => {
                const isLibraryActive = link.type === 'tab' && activeTab === 'library';
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() =>
                      link.type === 'tab'
                        ? handleNavClick(link.target)
                        : scrollToLandingSection(link.target)
                    }
                    className={`text-sm py-1 border-b-2 transition-colors ${
                      isLibraryActive
                        ? 'border-[#0E6F65] text-[#0D1F26] font-semibold'
                        : 'border-transparent text-[#3D525A] hover:text-[#0E6F65] font-medium'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Section: Monospace Telemetry + Account */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {!user.diagnostic_completed && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('diagnostic')}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#9A6B1F]/40 bg-[#FBF5E8] text-[#9A6B1F] hover:bg-[#F5EBD2] transition-colors text-xs font-medium"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Calibracion pendiente</span>
                  </button>
                )}

                <div className="flex items-center divide-x divide-[#DEDBD2] border border-[#DEDBD2] bg-white/80 telemetry-mono text-xs">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#3D525A]"
                    title={`Racha clinica: ${user.streak_days || 0} dias`}
                  >
                    <Flame className="w-3.5 h-3.5 text-[#9A6B1F]" />
                    <span>{user.streak_days ?? 0}d</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#0E6F65] font-medium"
                    title="Experiencia Clinica Acumulada"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{user.experience_points ?? user.xp ?? 0} XP</span>
                  </div>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    aria-expanded={isProfileDropdownOpen}
                    className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 bg-white hover:bg-[#F3F1EC] border border-[#DEDBD2] transition-colors text-left"
                  >
                    <div className="w-7 h-7 bg-[#0D1F26] flex items-center justify-center text-[#FAF9F6] font-mono text-[11px] font-semibold">
                      {getUserInitials(user.full_name)}
                    </div>
                    <span className="text-xs font-medium text-[#0D1F26] max-w-[130px] truncate">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64767E]" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#FAF9F6] border border-[#DEDBD2] shadow-md p-2 z-50 animate-scale-in origin-top-right">
                      <div className="p-3 border-b border-[#DEDBD2] space-y-1">
                        <p className="font-serif text-sm font-bold text-[#0D1F26] truncate">
                          {user.full_name || 'Estudiante OdyssMedic'}
                        </p>
                        <p className="font-mono text-[11px] text-[#64767E] truncate">
                          {user.email}
                        </p>
                        <p className="text-[11px] text-[#0E6F65] font-medium pt-1 truncate">
                          {user.academic_year || user.stage || 'Medicina Humana'}
                          {user.university ? ` · ${user.university}` : ''}
                        </p>
                      </div>

                      <div className="p-1 pt-1.5 space-y-1">
                        {!user.diagnostic_completed && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleNavClick('diagnostic');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#9A6B1F] bg-[#FBF5E8] hover:bg-[#F4E9CE] transition-colors text-left font-medium"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                            <span>Rendir evaluacion inicial</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#A6262E] hover:bg-[#FBF0F0] transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar sesion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAuth?.('login')}
                  className="text-sm font-medium text-[#3D525A] hover:text-[#0D1F26] transition-colors px-2 py-1.5"
                >
                  Iniciar sesion
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth?.('register')}
                  className="px-4 py-2 bg-[#0E6F65] hover:bg-[#0A564E] transition-colors text-[#FAF9F6] text-sm font-medium"
                >
                  Crear cuenta
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Alternar menu de navegacion"
              aria-expanded={isMobileMenuOpen}
              className="p-2 border border-[#DEDBD2] text-[#3D525A] hover:text-[#0D1F26] hover:bg-[#F3F1EC] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#DEDBD2] bg-[#FAF9F6] px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated && user ? (
            <>
              <div className="divide-y divide-[#DEDBD2]/70">
                {authenticatedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-2 py-3 text-sm transition-colors text-left ${
                        isActive ? 'text-[#0E6F65] font-semibold' : 'text-[#3D525A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#DEDBD2] space-y-2.5">
                <div className="p-3 bg-[#F3F1EC] border border-[#DEDBD2] space-y-1">
                  <p className="font-serif text-sm font-bold text-[#0D1F26]">
                    {user.full_name || user.email}
                  </p>
                  <p className="font-mono text-xs text-[#3D525A]">
                    {user.streak_days ?? 0}d racha · {user.experience_points ?? user.xp ?? 0} XP
                  </p>
                </div>

                {!user.diagnostic_completed && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('diagnostic')}
                    className="w-full py-2.5 bg-[#FBF5E8] border border-[#9A6B1F]/40 text-[#9A6B1F] text-xs font-medium"
                  >
                    Rendir evaluacion inicial
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-[#FBF0F0] border border-[#A6262E]/30 text-[#A6262E] text-xs font-medium"
                >
                  Cerrar sesion
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="divide-y divide-[#DEDBD2]/70">
                {publicSectionLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() =>
                      link.type === 'tab'
                        ? handleNavClick(link.target)
                        : scrollToLandingSection(link.target)
                    }
                    className="w-full px-2 py-3 text-sm text-[#0D1F26] text-left font-medium"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-[#DEDBD2] grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth?.('login');
                  }}
                  className="py-2.5 border border-[#DEDBD2] text-[#0D1F26] text-sm font-medium"
                >
                  Iniciar sesion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth?.('register');
                  }}
                  className="py-2.5 bg-[#0E6F65] text-[#FAF9F6] text-sm font-medium"
                >
                  Crear cuenta
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
