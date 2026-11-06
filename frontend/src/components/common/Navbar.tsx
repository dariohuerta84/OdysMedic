import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Flame,
  Zap,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  FileText,
  Home,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LevelBadge } from './LevelBadge';

export type NavTabId = 'dashboard' | 'simulator' | 'library' | 'landing' | 'diagnostic';

export interface NavbarProps {
  activeTab: NavTabId | string;
  onSelectTab: (tab: string) => void;
  onOpenAuth?: () => void;
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

  // Close profile dropdown when clicking outside
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

  // Close mobile menu on ESC
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

  const navItems = [
    {
      id: 'landing',
      label: 'Vision UPCH',
      icon: Home,
    },
    {
      id: 'dashboard',
      label: 'Mundos Clinicos',
      icon: Compass,
    },
    {
      id: 'simulator',
      label: 'Simulador',
      icon: Activity,
    },
    {
      id: 'library',
      label: 'Guias Medicas',
      icon: FileText,
    },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout();
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return 'MD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const roleLabelMap: Record<string, string> = {
    student: 'Estudiante de Medicina',
    intern: 'Interno Medico',
    resident: 'Medico Residente',
    specialist: 'Medico Especialista',
  };

  return (
    <nav
      role="navigation"
      aria-label="Navegacion Principal"
      className={`sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-200 shadow-xs ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-1 transition-transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  OdyssMedic
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-sky-100 text-sky-800 border border-sky-200">
                  UPCH 2026
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: Diagnostic Alert, Telemetry or Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Diagnostic Requirement Warning Pill */}
                {!user.diagnostic_completed && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('diagnostic')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors text-xs font-medium animate-pulse"
                    title="Examen de autoevaluacion obligatorio para desbloquear tu nivelacion"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Autoevaluacion Requerida</span>
                  </button>
                )}

                {/* Racha de Guardia */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs"
                  title={`Racha de Guardia: ${user.streak_days || 0} dias consecutivos`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold">{user.streak_days || 0}d</span>
                </div>

                {/* XP Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-mono text-xs"
                  title="Puntos de Experiencia Clinica"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-bold">
                    {user.experience_points ?? user.xp ?? 0} XP
                  </span>
                </div>

                {/* Competency Level */}
                <LevelBadge
                  level={user.current_level || 'Nivel 1'}
                  size="sm"
                  showSubtext
                />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    aria-expanded={isProfileDropdownOpen}
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-left shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-800 text-xs font-mono font-bold">
                      {getUserInitials(user.full_name)}
                    </div>
                    <span className="text-xs font-medium text-slate-800 max-w-[120px] truncate">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {user.full_name || 'Medico OdyssMedic'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {user.email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700">
                            {roleLabelMap[user.role] || user.role}
                          </span>
                          <span className="text-[10px] text-sky-700 font-semibold font-mono">
                            {user.university || 'UPCH'}
                          </span>
                        </div>
                      </div>

                      <div className="p-1">
                        {!user.diagnostic_completed && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleNavClick('diagnostic');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors text-left mb-1"
                          >
                            <ClipboardCheck className="w-4 h-4 text-amber-600" />
                            <span>Dar Autoevaluacion</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 transition-colors text-white text-xs font-semibold tracking-wide shadow-xs"
              >
                Iniciar Sesion / Demo UPCH
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px]">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>{user.streak_days || 0}d</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Alternar menu de navegacion"
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Telemetry or Auth in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      {user.full_name || user.email}
                    </span>
                    <LevelBadge
                      level={user.current_level || 'Nivel 1'}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                    <span className="flex items-center gap-1 text-amber-700">
                      <Flame className="w-3.5 h-3.5" />
                      {user.streak_days || 0}d de Guardia
                    </span>
                    <span className="flex items-center gap-1 text-sky-700">
                      <Zap className="w-3.5 h-3.5" />
                      {user.experience_points ?? user.xp ?? 0} XP
                    </span>
                  </div>
                </div>

                {!user.diagnostic_completed && (
                  <button
                    type="button"
                    onClick={() => handleNavClick('diagnostic')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4 text-amber-600" />
                    <span>Realizar Autoevaluacion Inicial</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesion</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth?.();
                }}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 transition-colors text-white text-xs font-semibold tracking-wide shadow-xs"
              >
                Iniciar Sesion / Demo UPCH
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
