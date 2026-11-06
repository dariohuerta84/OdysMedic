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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LevelBadge } from './LevelBadge';

export type NavTabId = 'dashboard' | 'simulator' | 'library' | 'landing';

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
      className={`sticky top-0 z-40 w-full backdrop-blur-md bg-[#090A0F]/85 border-b border-white/10 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-1 focus:ring-clinical-teal rounded-lg p-1 transition-transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-clinical-teal/20 border border-clinical-teal/50 flex items-center justify-center text-teal-400 shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  OdyssMedic
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-clinical-teal/20 text-teal-300 border border-clinical-teal/40">
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
                        ? 'bg-clinical-teal/20 text-teal-300 border border-clinical-teal/40 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: Telemetry or Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Racha de Guardia */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs"
                  title={`Racha de Guardia: ${user.streak_days || 0} dias consecutivos`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">{user.streak_days || 0}d</span>
                </div>

                {/* XP Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-xs"
                  title="Puntos de Experiencia Clinica"
                >
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
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
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-clinical-teal/30 border border-clinical-teal/50 flex items-center justify-center text-teal-300 text-xs font-mono font-bold">
                      {getUserInitials(user.full_name)}
                    </div>
                    <span className="text-xs font-medium text-gray-200 max-w-[120px] truncate">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0E1117] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-3 border-b border-white/10">
                        <p className="text-xs font-semibold text-white truncate">
                          {user.full_name || 'Medico OdyssMedic'}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate font-mono">
                          {user.email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300">
                            {roleLabelMap[user.role] || user.role}
                          </span>
                          <span className="text-[10px] text-teal-400 font-mono">
                            {user.university || 'UPCH'}
                          </span>
                        </div>
                      </div>

                      <div className="p-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors text-left"
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
                className="px-4 py-1.5 rounded-lg bg-clinical-teal hover:bg-clinical-teal-hover transition-colors text-white text-xs font-semibold tracking-wide shadow-md shadow-clinical-teal/20"
              >
                Iniciar Sesion / Demo UPCH
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{user.streak_days || 0}d</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Alternar menu de navegacion"
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
        <div className="md:hidden border-t border-white/10 bg-[#0E1117] px-4 pt-3 pb-6 space-y-3">
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
                      ? 'bg-clinical-teal/20 text-teal-300 border border-clinical-teal/40'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Telemetry or Auth in Mobile Drawer */}
          <div className="pt-3 border-t border-white/10">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {user.full_name || user.email}
                    </span>
                    <LevelBadge
                      level={user.current_level || 'Nivel 1'}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Flame className="w-3.5 h-3.5" />
                      {user.streak_days || 0}d de Guardia
                    </span>
                    <span className="flex items-center gap-1 text-teal-300">
                      <Zap className="w-3.5 h-3.5" />
                      {user.experience_points ?? user.xp ?? 0} XP
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition-colors"
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
                className="w-full py-2.5 rounded-lg bg-clinical-teal hover:bg-clinical-teal-hover transition-colors text-white text-xs font-semibold tracking-wide shadow-md"
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
