import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Mail,
  KeyRound,
  User as UserIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/api';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, loginDemo } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('intern');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting && !isDemoLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, isDemoLoading, onClose]);

  if (!isOpen) {
    return null;
  }

  const formatErrorMessage = (err: any): string => {
    if (err?.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail.map((d: any) => d.msg || JSON.stringify(d)).join(' | ');
      }
      return JSON.stringify(detail);
    }
    if (err?.message) {
      return err.message;
    }
    return 'Error de autenticacion. Verifique sus credenciales.';
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsDemoLoading(true);
    try {
      await loginDemo();
      onClose();
    } catch (err: any) {
      console.error('[AuthModal] Error en inicio de sesion demo:', err);
      setError(formatErrorMessage(err));
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          role,
        });
      }
      onClose();
    } catch (err: any) {
      console.error('[AuthModal] Error en formulario de autenticacion:', err);
      setError(formatErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isDemoLoading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-[#0E1117] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl"
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-clinical-teal/20 border border-clinical-teal/40 flex items-center justify-center text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold text-white tracking-tight">
                OdyssMedic
              </h2>
              <p className="text-xs text-gray-400">
                Portal Clinico de Razonamiento Diagnostico
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isDemoLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* UPCH Demo Quick Access Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting || isDemoLoading}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-clinical-teal/20 via-clinical-teal/10 to-transparent border border-clinical-teal/40 hover:border-clinical-teal hover:bg-clinical-teal/25 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-clinical-teal/30 border border-clinical-teal/50 flex items-center justify-center text-clinical-teal group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                  <span>Acceso Rapido: Medico Demo UPCH</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-clinical-teal/30 text-teal-300 border border-clinical-teal/40">
                    Demo
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  (demo.medico@upch.pe / Interno Cayetano)
                </div>
              </div>
            </div>
            {isDemoLoading ? (
              <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0E1117] px-3 text-[11px] font-mono uppercase tracking-wider text-gray-500">
            o credenciales
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-clinical-teal text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesion
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-clinical-teal text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error Alert Badge */}
        {error && (
          <div className="border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <div>
                <label htmlFor="auth-fullname" className="block text-xs font-medium text-gray-300 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr(a). Mateo Benavides"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-role" className="block text-xs font-medium text-gray-300 mb-1.5">
                  Rol Medico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <select
                    id="auth-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal transition-colors appearance-none"
                  >
                    <option value="student" className="bg-[#0E1117] text-white">
                      Estudiante de Medicina
                    </option>
                    <option value="intern" className="bg-[#0E1117] text-white">
                      Interno Medico
                    </option>
                    <option value="resident" className="bg-[#0E1117] text-white">
                      Medico Residente
                    </option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-gray-300 mb-1.5">
              Correo Electronico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="medico@upch.pe"
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-gray-300 mb-1.5">
              Contrasena
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                type="password"
                required
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Minimo 8 caracteres' : 'Contrasena clinica'}
                className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isDemoLoading}
            className="w-full py-2.5 px-4 bg-clinical-teal hover:bg-clinical-teal-hover transition-colors rounded-xl text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-clinical-teal/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Procesando...</span>
              </>
            ) : tab === 'login' ? (
              <>
                <span>Iniciar Sesion Clinica</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Crear Cuenta Medico</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
