import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
  Compass,
  Smartphone,
  Coins,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface LandingPageProps {
  onStartDemo: () => void;
  onExploreWorlds: () => void;
}

/**
 * Animated Row 1: Hospital Shifts vs Micro-cases
 */
const ProblemSolutionRow1: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15, triggerOnce: false });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch transition-all duration-700"
    >
      {/* Left: The Problem (Pegado a la izquierda) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl bg-rose-50/60 border-2 border-rose-200/80 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
              Obstaculo #1 : La Sobrecarga Hospitalaria
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-700">
              36 hrs
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            Guardias de 36 Horas: El Agotamiento que Impide Abrir Libros
          </h3>

          {/* Visual Hospital Timeline */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">
              Cronograma Real de la Guardia:
            </span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-white border border-rose-200 text-slate-700">
                <span className="font-bold block text-rose-700">08:00</span>
                <span>Pase Visita</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-rose-200 text-slate-700">
                <span className="font-bold block text-rose-700">14:00</span>
                <span>Historias</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-rose-200 text-slate-700">
                <span className="font-bold block text-rose-700">22:00</span>
                <span>Emergencias</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-rose-200 text-slate-700">
                <span className="font-bold block text-rose-700">06:00</span>
                <span>Trauma Shock</span>
              </div>
            </div>
          </div>

          {/* Visual Energy Meter */}
          <div className="p-3.5 rounded-2xl bg-white border border-rose-200 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-medium">Energia cognitiva tras el turno:</span>
              <span className="font-bold text-rose-700">8% (Fatiga Extrema)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: isVisible ? '8%' : '0%' }} />
            </div>
          </div>
        </div>

        <p className="text-xs text-rose-950 font-medium leading-relaxed pt-2 border-t border-rose-200/60">
          Tras 30 horas de pie en el hospital, sentarse a estudiar 4 horas al dia es biologicamente imposible.
        </p>
      </div>

      {/* Right: The OdyssMedic Solution (Pegado a la derecha) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl bg-sky-50/70 border-2 border-sky-300/80 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-700 ease-out delay-150 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
              Solucion OdyssMedic : Micro-Precision
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-700">
              5 min
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            Simulacion Clinica Adaptativa en las Pausas de Guardia
          </h3>

          {/* Visual Mobile Case Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-sky-200 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-sky-800">Caso Nefrologia KDIGO 2024</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Estacion 1 : Triaje
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                PA 85/55 mmHg
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                FC 118 lpm
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                SatO2 95%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Expansion con cristaloides y monitorizacion de diuresis horaria</span>
            </div>
          </div>

          {/* Visual Feasibility Meter */}
          <div className="p-3.5 rounded-2xl bg-white border border-sky-200 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-medium">Viabilidad en guardia hospitalaria:</span>
              <span className="font-bold text-sky-800">100% (3 a 5 min desde el celular)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all duration-1000" style={{ width: isVisible ? '100%' : '0%' }} />
            </div>
          </div>
        </div>

        <p className="text-xs text-sky-950 font-medium leading-relaxed pt-2 border-t border-sky-200/60">
          Entrena casos de alta complejidad en pausas reales del turno sin alterar tu horario asistencial.
        </p>
      </div>
    </div>
  );
};

/**
 * Animated Row 2: Passive MCQ Banks vs OCRI Root Cause Engine
 */
const ProblemSolutionRow2: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15, triggerOnce: false });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch transition-all duration-700"
    >
      {/* Left: The Problem (Pegado a la izquierda) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl bg-amber-50/60 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
              Obstaculo #2 : La Trampa del Banco Pasivo
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-700">
              70% Olvido
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            Memorizar Claves sin Entender la Causa Raiz del Error
          </h3>

          {/* Visual Ebbinghaus Decline */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-medium">Retencion a las 48 horas (Ebbinghaus):</span>
              <span className="font-bold text-amber-800">Solo 30% retenido</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: isVisible ? '30%' : '0%' }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
              <span>Dia 0 : 100%</span>
              <span>Dia 1 : 55%</span>
              <span className="text-amber-800 font-bold">Dia 2 : 30%</span>
            </div>
          </div>

          {/* Problem Checklist */}
          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-amber-200/70">
              <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Simulacros de 100 preguntas que solo indican clave correcta sin analisis.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-amber-200/70">
              <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>El alumno duda ante casos clinicos con parametros modificados en el examen.</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-amber-950 font-medium leading-relaxed pt-2 border-t border-amber-200/60">
          Memorizar mecanicamente letras no genera reflejos clinicos ni salva vidas en la guardia.
        </p>
      </div>

      {/* Right: The OdyssMedic Solution (Pegado a la derecha) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl bg-sky-50/70 border-2 border-sky-300/80 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-700 ease-out delay-150 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
              Solucion OdyssMedic : Motor OCRI
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-700">
              4 Brechas
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            Diagnostico de Causa Raiz con Microperla de 60 Segundos
          </h3>

          {/* Visual 4-Gap Taxonomy Radar Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-sky-200 space-y-2.5 shadow-xs">
            <span className="text-[11px] font-mono uppercase text-sky-800 font-bold block">
              Deteccion Inmediata de la Causa del Desvio:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between">
                <span>Triaje Vital</span>
                <span className="text-emerald-600 font-bold">OK</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between font-bold">
                <span>Razonamiento</span>
                <span className="text-amber-700">Brecha</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between">
                <span>Laboratorio</span>
                <span className="text-emerald-600 font-bold">OK</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between">
                <span>Manejo</span>
                <span className="text-emerald-600 font-bold">OK</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-900 font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Perla clinica KDIGO indexada para subsanar la brecha en 60 segundos.</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-sky-950 font-medium leading-relaxed pt-2 border-t border-sky-200/60">
          No solo sabes si fallaste: entiendes exactamente por que fallaste y como corregirlo para siempre.
        </p>
      </div>
    </div>
  );
};

/**
 * Animated Row 3: Blind Guessing vs Spaced Repetition D7 / D21
 */
const ProblemSolutionRow3: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15, triggerOnce: false });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch transition-all duration-700"
    >
      {/* Left: The Problem (Pegado a la izquierda) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl bg-rose-50/60 border-2 border-rose-200/80 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
              Obstaculo #3 : El Descontrol del Rendimiento
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-700">
              0 Certeza
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            Llegar al Examen de Titulacion sin Saber si Estas Realmente Apto
          </h3>

          {/* Visual Traditional Uncertainty Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-rose-200 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-medium">Certeza de aprobacion en ENAM:</span>
              <span className="font-bold text-rose-700">Baja (Riesgo de reprobar)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: isVisible ? '25%' : '0%' }} />
            </div>
            <p className="text-[11px] text-slate-600 font-mono">
              Los estudiantes rinden examenes con dudas recurrentes en emergencias tiempo-dependientes (ACV, CAD, Shock).
            </p>
          </div>
        </div>

        <p className="text-xs text-rose-950 font-medium leading-relaxed pt-2 border-t border-rose-200/60">
          La falta de seguimiento objetivo de brechas incrementa la ansiedad y la probabilidad de repetir el internado.
        </p>
      </div>

      {/* Right: The OdyssMedic Solution (Pegado a la derecha) */}
      <div
        className={`p-6 sm:p-7 rounded-3xl bg-emerald-50/70 border-2 border-emerald-300/80 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-700 ease-out delay-150 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Solucion OdyssMedic : Repeticion D7 / D21
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
              94% Exito
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
            Consolidacion Neural a Largo Plazo y Certificacion de Aptitud
          </h3>

          {/* Visual Neural Calendar Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-2.5 shadow-xs">
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <span className="block font-bold text-slate-900">Dia 1</span>
                <span>Desvio Detectado</span>
              </div>
              <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-bold">
                <span className="block text-sky-900">Dia 7</span>
                <span>Refuerzo D7</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold">
                <span className="block text-emerald-800">Dia 21</span>
                <span>Consolidacion</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
              <span>Estado Basal Ganado:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px]">
                Apto para el Examen
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-emerald-950 font-medium leading-relaxed pt-2 border-t border-emerald-200/60">
          Llega a tu examen de internado con certeza matematica y reflejos clinicos comprobados en guardia.
        </p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onExploreWorlds,
}) => {
  const [selectedMetricTab, setSelectedMetricTab] = useState<'tiempo' | 'retencion' | 'causa'>('tiempo');
  const bentoSection = useScrollReveal({ threshold: 0.1, triggerOnce: false });
  const ctaSection = useScrollReveal({ threshold: 0.15, triggerOnce: false });

  return (
    <div className="relative overflow-hidden bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-24">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section className="relative text-center space-y-7 max-w-4xl mx-auto pt-4 animate-fade-in-up">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sky-200 text-sky-800 text-xs font-mono font-semibold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>BioIncubadora Cayetano | Proyectos de Ingenieria 2 - UPCH</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            El Simulador Clinico que Transforma el{' '}
            <span className="text-sky-600">
              Razonamiento Medico
            </span>{' '}
            Frente al Turno Hospitalario
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Entrenamiento adaptativo de precision para internos y estudiantes de medicina.
            Diagnostica tus brechas cognitivas (OCRI) y consolida conceptos clinicos clave con
            microperlas de 60 segundos y guias de practica clinica internacionales.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm tracking-wide shadow-xs transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Acceso Medico Demo UPCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreWorlds}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 font-semibold text-sm transition-all shadow-xs active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-sky-600" />
              <span>Explorar Casos y Especialidades</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200 max-w-3xl mx-auto">
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-sky-700">
                4 Brechas
              </span>
              <span className="text-xs text-slate-500 font-medium">Taxonomia OCRI</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-slate-900">
                D7 / D21
              </span>
              <span className="text-xs text-slate-500 font-medium">Repeticion Espaciada</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-sky-700">
                60 Segundos
              </span>
              <span className="text-xs text-slate-500 font-medium">Microperlas de Guardia</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-emerald-700">
                100% Indexado
              </span>
              <span className="text-xs text-slate-500 font-medium">KDIGO, ADA, AHA/ASA</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SCROLL-ANIMATED SPLIT COMPARISON: PROBLEMATICA VS SOLUCION              */}
        {/* Left Side: Hospital Reality | Right Side: OdyssMedic Precision            */}
        {/* ========================================================================= */}
        <section className="space-y-12" aria-label="Problematica hospitalaria vs Solucion OdyssMedic">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase font-bold bg-sky-50 text-sky-800 border border-sky-200 tracking-wider">
              El Dilema Clinico : Tiempo vs Rendimiento
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Por Que los Alumnos No Tienen Tiempo para sus Examenes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Visualiza en tiempo real como la inercia del modelo tradicional colapsa durante la guardia
              y como la micro-precision adaptativa de OdyssMedic resuelve la falta de tiempo.
            </p>
          </div>

          {/* Visual Column Headers */}
          <div className="hidden lg:grid grid-cols-2 gap-10 max-w-5xl mx-auto text-xs font-mono font-bold uppercase tracking-wider">
            <div className="p-3 rounded-2xl bg-rose-100/60 border border-rose-300 text-rose-800 flex items-center justify-between shadow-xs">
              <span>Columna Izquierda: La Crisis del Tiempo Hospitalario</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-sky-100/60 border border-sky-300 text-sky-800 flex items-center justify-between shadow-xs">
              <span>Columna Derecha: La Transformacion OdyssMedic</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            </div>
          </div>

          {/* 3 Animated Rows with Scroll-Reveal Entrance and Exit */}
          <div className="space-y-8 max-w-5xl mx-auto">
            <ProblemSolutionRow1 />
            <ProblemSolutionRow2 />
            <ProblemSolutionRow3 />
          </div>

          {/* Visual Interactive Comparison Board */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-700 font-bold block">
                  Cuadro Comparativo Interactivo
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  Selecciona la dimension de comparacion:
                </h4>
              </div>

              {/* Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedMetricTab('tiempo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedMetricTab === 'tiempo'
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tiempo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMetricTab('retencion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedMetricTab === 'retencion'
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Retencion
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMetricTab('causa')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedMetricTab === 'causa'
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Diagnostico Error
                </button>
              </div>
            </div>

            {/* Scoreboard Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <span className="font-bold text-rose-800 uppercase block">Modelo Tradicional</span>
                <span className="text-xl sm:text-2xl font-black text-rose-900 block font-mono">
                  {selectedMetricTab === 'tiempo'
                    ? '4 Horas Diarias'
                    : selectedMetricTab === 'retencion'
                      ? '30% a 48 Horas'
                      : 'Cero Diagnostico'}
                </span>
                <p className="text-slate-600 font-sans text-xs">
                  {selectedMetricTab === 'tiempo'
                    ? 'Exige bloques continuos imposibles de encajar tras una guardia de 30 horas.'
                    : selectedMetricTab === 'retencion'
                      ? 'La memorizacion pasiva de claves se degrada aceleradamente segun la curva del olvido.'
                      : 'Solo indica acierto o fallo, sin explicar si el error fue de triaje, dosis o examen auxiliar.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-300 space-y-2">
                <span className="font-bold text-sky-800 uppercase block">Motor OdyssMedic</span>
                <span className="text-xl sm:text-2xl font-black text-sky-900 block font-mono">
                  {selectedMetricTab === 'tiempo'
                    ? '3 a 5 Minutos'
                    : selectedMetricTab === 'retencion'
                      ? '94% con D7 / D21'
                      : 'Causa Raiz OCRI'}
                </span>
                <p className="text-slate-600 font-sans text-xs">
                  {selectedMetricTab === 'tiempo'
                    ? 'Micro-estaciones de precision en el celular durante pausas reales de sala de guardia.'
                    : selectedMetricTab === 'retencion'
                      ? 'Algoritmo de repeticion espaciada que refuerza exactamente antes de que el concepto se olvide.'
                      : 'Clasificacion inmediata en las 4 causas raiz clinicas con perla basada en guias KDIGO/ADA.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. COMPARISON & VALUE PROPOSITION BENTO GRID (Scroll-Reveal Animated)     */}
        {/* ========================================================================= */}
        <section
          ref={bentoSection.ref}
          className={`space-y-8 transition-all duration-700 ease-out ${
            bentoSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Arquitectura Cognitiva Diferencial
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Disenado para el Pase de Visita y la Guardia Medica
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Supera la memorizacion pasiva. OdyssMedic correlaciona tus decisiones en el turno
              con el diagnostico de brechas cognitivas para elevar tu rango de competencia.
            </p>
          </div>

          {/* Bento Grid (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Diagnostico de Brecha Cognitiva */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  Deteccion de Brechas OCRI
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  No es solo acertar o fallar. El motor clasifica tus desviaciones en 4 causas raiz:
                  Triaje de Severidad, Razonamiento Diagnostico, Interpretacion de Laboratorio y Manejo Inicial.
                </p>
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-800 font-mono font-medium">
                  Taxonomia adaptativa basada en analisis de incidentes clinicos.
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-sky-700 font-semibold">
                Calibracion Basada en Evidencia
              </div>
            </div>

            {/* Card 2: Repeticion Espaciada Neural */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  Repeticion Espaciada D7 / D21
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Cuando fallas una estacion, OdyssMedic agenda un refuerzo tactico a los 7 y 21 dias
                  con variaciones clinicas para consolidar memoria de largo plazo segun la curva de Ebbinghaus.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
                  Ideal para el pase de visita hospitalario y la preparacion ENAM.
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-sky-700 font-semibold">
                Prescripcion Adaptativa Automatizada
              </div>
            </div>

            {/* Card 3: Accesibilidad Inmediata en Sala */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Accesibilidad en Movil
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Optimizado para el ritmo de turnos de 12 y 24 horas. Interfaz responsive ultraligera
                  disenada para smartphones en el bolsillo del mandil y laptops en sala de residentes.
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Casos completables en menos de 5 minutos</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-700 font-semibold">
                Web App Responsive de Cero Friccion
              </div>
            </div>

            {/* Card 4: Accesible y Cost-Effective */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Accesible y Equitativo
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Frente a academias comerciales que superan los USD 300 anuales, OdyssMedic propone un
                  modelo accesible a cualquier estudiante o interno con tecnologia de vanguardia UPCH.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono font-semibold">
                  Modelo equitativo para internos peruanos
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700 font-semibold">
                Democratizacion del Razonamiento Clinico
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. CALL TO ACTION STRIP (Scroll-Reveal Animated)                           */}
        {/* ========================================================================= */}
        <section
          ref={ctaSection.ref}
          className={`text-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 transition-all duration-700 ease-out ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Listo para calibrar tu razonamiento clinico?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unete a la comunidad de internos y residentes de Cayetano Heredia que entrenan
              con medicina de precision y aprendizaje adaptativo de alto rendimiento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Comenzar Entrenamiento Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onExploreWorlds}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm transition-all"
            >
              <span>Ver Casos y Especialidades</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. ACADEMIC & INSTITUTIONAL FOOTER                                        */}
        {/* ========================================================================= */}
        <footer className="pt-10 border-t border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-sans">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Proyecto de Investigacion Aplicada
              </span>
              <p className="text-slate-900 font-bold text-sm">OdyssMedic Precision Engine</p>
              <p className="text-slate-500">
                Proyectos de Ingenieria 2 - BioIncubadora Cayetano
              </p>
              <p className="text-slate-500">
                Universidad Peruana Cayetano Heredia (UPCH) 2026
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Equipo de Desarrollo
              </span>
              <p className="text-slate-600">
                <span className="text-slate-900 font-medium">Autores:</span> Dario Huerta Cruz & Elvis Deiwis Pilco Cruz
              </p>
              <p className="text-slate-600">
                <span className="text-slate-900 font-medium">Evaluador y Docente:</span> Mag. Noe Bazan
              </p>
              <p className="text-slate-500">Facultad de Ciencias e Ingenieria - UPCH</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Fundamentacion Academica
              </span>
              <p className="text-slate-500 leading-relaxed">
                Plataforma de simulacion clinica adaptativa basada en la integracion de RAG
                con guias de practica clinica de referencia y modelado del proceso de razonamiento
                diagnostico en medicina de emergencia.
              </p>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-slate-200 text-[11px] font-mono text-slate-400">
            ODYSSMEDIC PRECISION ENGINE (C) 2026 - UNIVERSIDAD PERUANA CAYETANO HEREDIA. TODOS LOS DERECHOS RESERVADOS.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
