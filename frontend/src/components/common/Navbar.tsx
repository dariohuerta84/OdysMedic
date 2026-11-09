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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
      }, 120);
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
    { id: 'dashboard', label: 'Mundo Clinico', icon: Compass },
    { id: 'simulator', label: 'Simulador', icon: Activity },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
  ];

  const publicSectionLinks = [
    { label: 'Quienes somos', type: 'section' as const, target: 'quienes-somos' },
    { label: 'Mundos clinicos', type: 'section' as const, target: 'mundos-clinicos' },
    { label: 'Como funciona', type: 'section' as const, target: 'como-funciona' },
    { label: 'Biblioteca', type: 'tab' as const, target: 'library' },
    { label: 'Testimonios', type: 'section' as const, target: 'testimonios' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navegacion Principal"
      className={`sticky top-0 z-40 w-full backdrop-blur-md bg-[#FDFCFA]/95 border-b border-[#E3E8E6] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3.5">
          {/* Classic Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none rounded-lg py-1 transition-opacity hover:opacity-90"
          >
            <Activity className="w-5 h-5 text-[#0E6F65] stroke-[2.2]" />
            <span className="font-serif font-bold text-xl tracking-tight text-[#0D4A44]">
              OdyssMedic
            </span>
          </button>

          {/* Desktop Navigation */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2">
              {authenticatedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-colors ${
                      isActive
                        ? 'bg-[#EAF4F2] text-[#0E6F65] font-semibold'
                        : 'text-[#354B54] hover:text-[#0B252E] hover:bg-[#F2F7F6]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
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
                    className={`text-sm transition-colors ${
                      isLibraryActive
                        ? 'text-[#0E6F65] font-semibold underline underline-offset-8 decoration-[#0E6F65]/60'
                        : 'text-[#2C424B] hover:text-[#0E6F65] font-medium'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {!user.diagnostic_completed && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('diagnostic')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF7E7] border border-[#E9D7AC] text-[#7D5817] hover:bg-[#F9EFD3] transition-colors text-xs font-medium"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#A87624]" />
                    <span>Evaluacion Inicial Pendiente</span>
                  </button>
                )}

                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F7F6] text-[#354B54] text-xs font-medium"
                  title={`Racha clinica: ${user.streak_days || 1} dias`}
                >
                  <Flame className="w-3.5 h-3.5 text-[#B9852D]" />
                  <span>{user.streak_days || 1}d</span>
                </div>

                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4F2] text-[#0E6F65] text-xs font-medium"
                  title="Experiencia Clinica Acumulada"
                >
                  <Award className="w-3.5 h-3.5 text-[#0E6F65]" />
                  <span>{user.experience_points ?? user.xp ?? 0} pts</span>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    aria-expanded={isProfileDropdownOpen}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white hover:bg-[#F2F7F6] border border-[#DCE5E3] transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0E6F65] flex items-center justify-center text-white text-xs font-semibold">
                      {getUserInitials(user.full_name)}
                    </div>
                    <span className="text-xs font-medium text-[#0B252E] max-w-[130px] truncate">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6E828A]" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#DCE5E3] shadow-lg p-2 z-50">
                      <div className="p-3 border-b border-[#EDF2F1] space-y-1">
                        <p className="font-serif text-sm font-bold text-[#0B252E] truncate">
                          {user.full_name || 'Estudiante OdyssMedic'}
                        </p>
                        <p className="text-xs text-[#6E828A] truncate">
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
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#7D5817] bg-[#FDF7E7] hover:bg-[#F9EFD3] transition-colors text-left font-medium"
                          >
                            <ClipboardCheck className="w-4 h-4 text-[#A87624]" />
                            <span>Rendir Evaluacion Inicial</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#9E3F42] hover:bg-[#FBF1F1] transition-colors text-left font-medium"
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
              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="px-5 py-2.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] transition-colors text-white text-sm font-medium shadow-2xs"
              >
                Ingresar
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Alternar menu de navegacion"
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-xl text-[#354B54] hover:text-[#0B252E] hover:bg-[#F2F7F6] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3E8E6] bg-[#FDFCFA] px-4 pt-3 pb-6 space-y-3 shadow-md">
          {isAuthenticated && user ? (
            <>
              <div className="space-y-1">
                {authenticatedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-[#EAF4F2] text-[#0E6F65] font-semibold'
                          : 'text-[#354B54] hover:bg-[#F2F7F6]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#E3E8E6] space-y-2.5">
                <div className="p-3 rounded-xl bg-[#F2F7F6] space-y-1">
                  <p className="font-serif text-sm font-bold text-[#0B252E]">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-xs text-[#5C737C]">
                    {user.streak_days || 1} dias de racha · {user.experience_points ?? user.xp ?? 0} pts
                  </p>
                </div>

                {!user.diagnostic_completed && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('diagnostic')}
                    className="w-full py-2.5 rounded-xl bg-[#FDF7E7] border border-[#E9D7AC] text-[#7D5817] text-xs font-medium"
                  >
                    Rendir Evaluacion Inicial
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-[#FBF1F1] text-[#9E3F42] text-xs font-medium"
                >
                  Cerrar sesion
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                {publicSectionLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() =>
                      link.type === 'tab'
                        ? handleNavClick(link.target)
                        : scrollToLandingSection(link.target)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-[#2C424B] hover:bg-[#F2F7F6] text-left font-medium"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-[#E3E8E6]">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth?.('login');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-sm font-medium"
                >
                  Ingresar
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
