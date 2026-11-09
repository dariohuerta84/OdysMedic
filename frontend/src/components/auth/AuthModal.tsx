import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  Mail,
  KeyRound,
  User as UserIcon,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  GraduationCap,
  Calendar,
  Target,
  Stethoscope,
  BookOpen,
  Heart,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { OnboardingTrack } from '../../types/api';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onboardingTrack?: OnboardingTrack;
  onAuthSuccess?: (destination: 'diagnostic' | 'dashboard') => void;
}

const UNIVERSITIES = [
  'Universidad Nacional Mayor de San Marcos (UNMSM)',
  'Universidad Peruana Cayetano Heredia (UPCH)',
  'Universidad de San Martin de Porres (USMP)',
  'Universidad Cientifica del Sur (UCSUR)',
  'Universidad Peruana de Ciencias Aplicadas (UPC)',
  'Universidad Ricardo Palma (URP)',
  'Universidad Nacional de Trujillo (UNT)',
  'Universidad Nacional de San Agustin (UNSA)',
  'Universidad de Piura (UDEP)',
  'Otra universidad de Medicina',
];

const CAREERS = [
  'Medicina Humana',
  'Internado Medico',
  'Medico Cirujano Titulado',
];

const ACADEMIC_YEARS = [
  'Ciencias Basicas (1er a 3er ano)',
  'Ciencias Clinicas (4to a 5to ano)',
  'Pre-Internado (6to ano)',
  'Internado Medico (7mo ano)',
  'SERUMS / Medico General',
  'Preparacion Residentado Medico',
];

const PRIMARY_GOALS = [
  {
    id: 'preparar_enam',
    title: 'Preparar ENAM',
    desc: 'Practica con enfoque en el examen nacional.',
    icon: Activity,
  },
  {
    id: 'rendir_rotaciones',
    title: 'Rendir mejor en rotaciones',
    desc: 'Fortalece tu desempeno en la practica clinica.',
    icon: Stethoscope,
  },
  {
    id: 'reforzar_medicina_interna',
    title: 'Reforzar Medicina Interna',
    desc: 'Profundiza en casos y temas de medicina interna.',
    icon: BookOpen,
  },
];

const INITIAL_WORLDS = [
  { id: 'medicina_interna', label: 'Medicina Interna' },
  { id: 'pediatria', label: 'Pediatria' },
  { id: 'ginecologia_obstetricia', label: 'Gineco-Obstetricia' },
  { id: 'cirugia_general', label: 'Cirugia' },
  { id: 'medicina_familiar', label: 'Medicina Familiar' },
];

const INTEREST_AREAS = [
  { id: 'cardiologia', label: 'Cardiologia', icon: Heart },
  { id: 'infectologia', label: 'Infectologia', icon: ShieldAlert },
  { id: 'urgencias', label: 'Urgencias', icon: Activity },
  { id: 'interpretacion_ecg', label: 'Interpretacion de ECG', icon: Activity },
  { id: 'endocrinologia', label: 'Endocrinologia', icon: Target },
  { id: 'neumologia', label: 'Neumologia', icon: Stethoscope },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onboardingTrack = 'ruta',
  onAuthSuccess,
}) => {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Datos academicos
  const [university, setUniversity] = useState('');
  const [career, setCareer] = useState('Medicina Humana');
  const [academicYear, setAcademicYear] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('preparar_enam');

  // Step 3: Preferencias iniciales
  const [initialWorld, setInitialWorld] = useState('medicina_interna');
  const [interestAreas, setInterestAreas] = useState<string[]>(['cardiologia']);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialMode);
      setStep(1);
      setError(null);
      if (onboardingTrack === 'desde_cero') {
        setAcademicYear('Ciencias Basicas (1er a 3er ano)');
      }
    }
  }, [isOpen, initialMode, onboardingTrack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || typeof document === 'undefined') {
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
    return 'No se pudo completar la solicitud. Verifica tus datos e intentalo nuevamente.';
  };

  const toggleInterest = (id: string) => {
    setInterestAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const validateStep1 = (): boolean => {
    if (!fullName.trim()) {
      setError('Ingresa tu nombre completo para continuar.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo electronico valido.');
      return false;
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!university) {
      setError('Selecciona tu universidad.');
      return false;
    }
    if (!career) {
      setError('Selecciona tu carrera.');
      return false;
    }
    if (!academicYear) {
      setError('Selecciona tu ano o etapa academica.');
      return false;
    }
    if (!primaryGoal) {
      setError('Elige tu objetivo principal.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      if (onAuthSuccess) {
        onAuthSuccess('dashboard');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRegistration = async (destination: 'diagnostic' | 'dashboard') => {
    if (!privacyAccepted) {
      setError('Debes aceptar la Politica de privacidad y el tratamiento de datos personales.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        university: university || 'Universidad Nacional Mayor de San Marcos (UNMSM)',
        career: career || 'Medicina Humana',
        academic_year: academicYear || 'Internado Medico (7mo ano)',
        primary_goal: primaryGoal || 'preparar_enam',
        initial_world: initialWorld || 'medicina_interna',
        interest_areas: interestAreas,
        onboarding_track: onboardingTrack,
        privacy_accepted: privacyAccepted,
      });
      if (onAuthSuccess) {
        onAuthSuccess(destination);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalDialog = (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B252E]/45 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`bg-[#FDFCFA] border border-[#DCE5E3] rounded-2xl w-full relative shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden transition-all ${
          tab === 'register' && step > 1 ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        {/* Pinned Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E7EEEC] bg-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#0E6F65]">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                OdyssMedic
              </span>
            </div>
            <h2
              id="auth-modal-title"
              className="font-serif text-xl sm:text-2xl font-bold text-[#0B252E]"
            >
              {tab === 'login'
                ? 'Bienvenido de vuelta'
                : onboardingTrack === 'desde_cero'
                  ? 'Construye tu base clinica paso a paso'
                  : 'Personaliza tu ruta clinica'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-[#6E828A] hover:text-[#0B252E] hover:bg-[#F2F7F6] transition-colors disabled:opacity-50"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#F2F7F6] p-1 border border-[#DCE5E3]">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                tab === 'login'
                  ? 'bg-white text-[#0B252E] shadow-2xs font-semibold'
                  : 'text-[#5C737C] hover:text-[#0B252E]'
              }`}
            >
              Ingresar a mi cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                tab === 'register'
                  ? 'bg-white text-[#0B252E] shadow-2xs font-semibold'
                  : 'text-[#5C737C] hover:text-[#0B252E]'
              }`}
            >
              Crear cuenta nueva
            </button>
          </div>

          {/* Stepper Indicator (Calm 3 Steps for Registration) */}
          {tab === 'register' && (
            <div className="flex items-center justify-between gap-2 px-1">
              {[
                { num: 1 as const, label: 'Cuenta personal' },
                { num: 2 as const, label: 'Datos academicos' },
                { num: 3 as const, label: 'Preferencias iniciales' },
              ].map((s, idx) => {
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'bg-[#0E6F65] text-white'
                            : isDone
                              ? 'bg-[#D9EFEA] text-[#0E6F65]'
                              : 'bg-[#EAECEB] text-[#6E828A]'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span
                        className={`text-xs hidden sm:inline ${
                          isCurrent
                            ? 'font-semibold text-[#0B252E]'
                            : 'text-[#6E828A]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-px ${
                          step > s.num ? 'bg-[#0E6F65]/50' : 'bg-[#DCE5E3]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="border border-[#EBCACA] bg-[#FBF1F1] text-[#8E3538] text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B44B4E]" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* LOGIN VIEW                                                        */}
          {/* ================================================================= */}
          {tab === 'login' && (
            <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[#2C424B] mb-1.5"
                >
                  Correo electronico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E828A]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@universidad.edu.pe"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-sm text-[#0B252E] placeholder-[#94A6AC] focus:outline-none focus:border-[#0E6F65]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#2C424B] mb-1.5"
                >
                  Contrasena
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E828A]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contrasena"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-sm text-[#0B252E] placeholder-[#94A6AC] focus:outline-none focus:border-[#0E6F65]"
                  />
                </div>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* REGISTER STEP 1: CUENTA PERSONAL                                  */}
          {/* ================================================================= */}
          {tab === 'register' && step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B252E]">
                  1. Tus credenciales de acceso
                </h3>
                <p className="text-xs sm:text-sm text-[#5C737C]">
                  Crea tu perfil personal para guardar tu progreso clinico de manera privada.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-semibold text-[#2C424B] mb-1.5"
                >
                  Nombre completo <span className="text-[#B44B4E]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E828A]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Camila Paredes"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-sm text-[#0B252E] placeholder-[#94A6AC] focus:outline-none focus:border-[#0E6F65]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[#2C424B] mb-1.5"
                >
                  Correo electronico <span className="text-[#B44B4E]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E828A]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@universidad.edu.pe"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-sm text-[#0B252E] placeholder-[#94A6AC] focus:outline-none focus:border-[#0E6F65]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-[#2C424B] mb-1.5"
                >
                  Contrasena <span className="text-[#B44B4E]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E828A]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-sm text-[#0B252E] placeholder-[#94A6AC] focus:outline-none focus:border-[#0E6F65]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* REGISTER STEP 2: DATOS ACADEMICOS                                 */}
          {/* ================================================================= */}
          {tab === 'register' && step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF4F2] text-[#0E6F65] font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0B252E]">
                    Datos academicos
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C737C]">
                    Cuentanos sobre tu formacion actual para adaptar mejor los contenidos.
                  </p>
                </div>
              </div>

              {/* 3 Selects Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0B252E] mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0E6F65]" />
                    <span>
                      Universidad <span className="text-[#B44B4E]">*</span>
                    </span>
                  </label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-xs sm:text-sm text-[#0B252E] focus:outline-none focus:border-[#0E6F65]"
                  >
                    <option value="">Selecciona tu universidad</option>
                    {UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0B252E] mb-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#0E6F65]" />
                    <span>
                      Carrera <span className="text-[#B44B4E]">*</span>
                    </span>
                  </label>
                  <select
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-xs sm:text-sm text-[#0B252E] focus:outline-none focus:border-[#0E6F65]"
                  >
                    {CAREERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0B252E] mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0E6F65]" />
                    <span>
                      Ano o etapa academica <span className="text-[#B44B4E]">*</span>
                    </span>
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#CFDAD8] rounded-xl text-xs sm:text-sm text-[#0B252E] focus:outline-none focus:border-[#0E6F65]"
                  >
                    <option value="">Selecciona tu ano</option>
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objetivo Principal Cards */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#0B252E]">
                  <Target className="w-3.5 h-3.5 text-[#0E6F65]" />
                  <span>
                    Objetivo principal <span className="text-[#B44B4E]">*</span>
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRIMARY_GOALS.map((g) => {
                    const Icon = g.icon;
                    const selected = primaryGoal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setPrimaryGoal(g.id)}
                        className={`relative p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          selected
                            ? 'bg-[#EAF4F2] border-[#0E6F65] shadow-2xs'
                            : 'bg-white border-[#DCE5E3] hover:border-[#9EC6BF]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-[#D5E4E1] flex items-center justify-center text-[#0E6F65] shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="pr-4">
                          <span className="block text-xs font-bold text-[#0B252E] leading-snug">
                            {g.title}
                          </span>
                          <span className="block text-[11px] text-[#5C737C] leading-snug mt-0.5">
                            {g.desc}
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#0E6F65] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* REGISTER STEP 3: PREFERENCIAS INICIALES                           */}
          {/* ================================================================= */}
          {tab === 'register' && step === 3 && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF4F2] text-[#0E6F65] font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0B252E]">
                    Preferencias iniciales
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5C737C]">
                    Selecciona tus areas de interes para personalizar tu ruta (puedes elegir varias).
                  </p>
                </div>
              </div>

              {/* Mundo clinico inicial */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0B252E]">
                  Mundo clinico inicial <span className="text-[#B44B4E]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {INITIAL_WORLDS.map((w) => {
                    const selected = initialWorld === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setInitialWorld(w.id)}
                        className={`relative px-3 py-3 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 ${
                          selected
                            ? 'bg-[#EAF4F2] border-[#0E6F65] text-[#0E6F65] font-semibold'
                            : 'bg-white border-[#DCE5E3] text-[#2C424B] hover:border-[#9EC6BF]'
                        }`}
                      >
                        <span className="text-xs leading-tight">{w.label}</span>
                        {selected && (
                          <span className="w-4 h-4 rounded-full bg-[#0E6F65] text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Areas de interes (opcional) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0B252E]">
                  Areas de interes (opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_AREAS.map((area) => {
                    const Icon = area.icon;
                    const active = interestAreas.includes(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleInterest(area.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs transition-colors ${
                          active
                            ? 'bg-[#EAF4F2] border-[#0E6F65] text-[#0E6F65] font-semibold'
                            : 'bg-white border-[#DCE5E3] text-[#354B54] hover:bg-[#F2F7F6]'
                        }`}
                      >
                        <span>{area.label}</span>
                        <Icon className="w-3.5 h-3.5 text-[#0E6F65]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy & Security Box */}
              <div className="rounded-xl bg-[#EAF4F2] border border-[#CFE3DF] p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <label className="sm:col-span-7 flex items-start gap-2.5 cursor-pointer text-xs text-[#0B252E]">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#0E6F65] text-[#0E6F65] focus:ring-[#0E6F65]"
                  />
                  <span className="leading-snug">
                    Acepto la{' '}
                    <span className="underline font-semibold text-[#0E6F65]">
                      Politica de privacidad
                    </span>{' '}
                    y el tratamiento de mis datos personales.{' '}
                    <span className="text-[#B44B4E]">*</span>
                  </span>
                </label>

                <div className="sm:col-span-5 sm:border-l sm:border-[#BBD5D0] sm:pl-3.5 flex items-start gap-2 text-[11px] text-[#35544F]">
                  <Lock className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-semibold block text-[#0E6F65]">
                      Tus datos estan seguros.
                    </span>
                    <span>
                      Solo se usaran para personalizar tu ruta y comunicarnos contigo sobre tu progreso.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Sticky Action Footer */}
        <div className="px-6 py-4 border-t border-[#E7EEEC] bg-white shrink-0">
          {tab === 'login' ? (
            <button
              type="submit"
              form="login-form"
              disabled={isSubmitting}
              className="w-full py-3 px-5 bg-[#0E6F65] hover:bg-[#0A564E] transition-colors rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : step === 1 ? (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continuar a datos academicos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : step === 2 ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#DCE5E3] text-[#354B54] hover:bg-[#F2F7F6] text-xs sm:text-sm font-medium inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <span>Continuar a preferencias</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#DCE5E3] text-[#354B54] hover:bg-[#F2F7F6] text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitRegistration('dashboard')}
                  className="text-xs sm:text-sm font-semibold text-[#0E6F65] hover:text-[#0A564E] underline underline-offset-4 disabled:opacity-50"
                >
                  Omitir por ahora
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submitRegistration('diagnostic')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando tu ruta...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar a evaluacion diagnostica</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalDialog, document.body);
};

export default AuthModal;
