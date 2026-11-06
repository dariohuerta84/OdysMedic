import React, { useState } from 'react';
import { CognitiveGapTag } from '../types/api';
import {
  ArrowRight,
  Zap,
  Brain,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Compass,
  TrendingUp,
  Smartphone,
  Coins,
} from 'lucide-react';

export interface LandingPageProps {
  onStartDemo: () => void;
  onExploreWorlds: () => void;
}

interface PreviewStation {
  stationNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  scenario: string;
  vitals: { label: string; value: string; critical: boolean }[];
  clinicalQuestion: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  detectedGap: CognitiveGapTag;
  gapDescription: string;
  pearl: string;
}

const PREVIEW_STATIONS: PreviewStation[] = [
  {
    stationNumber: 1,
    title: 'Triaje y Severidad',
    subtitle: 'Deteccion Temprana de Inestabilidad',
    badge: 'Estacion 1',
    scenario:
      'Mujer de 24 anos ingresa a la guardia de emergencia por astenia severa, ictericia escleral marcada y petequias en extremidades inferiores.',
    vitals: [
      { label: 'PA', value: '85/55 mmHg', critical: true },
      { label: 'FC', value: '118 lpm', critical: true },
      { label: 'FR', value: '22 rpm', critical: false },
      { label: 'SatO2', value: '95%', critical: false },
      { label: 'Glasgow', value: '14/15', critical: false },
    ],
    clinicalQuestion:
      'Cual es la conducta inmediata prioritaria durante el triaje en el box de reanimacion?',
    options: [
      {
        id: 'opt-1',
        text: 'Canalizar dos vias perifericas gruesas, expandir con cristaloides y monitorizar gasto urinario.',
        isCorrect: true,
      },
      {
        id: 'opt-2',
        text: 'Indicar reposo en camilla general y esperar hemograma de rutina.',
        isCorrect: false,
      },
    ],
    detectedGap: 'GAP_TRIAGE_SEVERITY',
    gapDescription:
      'La subestimacion del shock distributivo inicial incrementa la mortalidad en las primeras 6 horas.',
    pearl:
      'Perla Clinica: Ante trombocitopenia aguda con anemia e hipotension, prioriza la resucitacion volemica antes de movilizar al paciente a salas de imagen.',
  },
  {
    stationNumber: 2,
    title: 'Razonamiento Diagnostico',
    subtitle: 'Correlacion Fisiopatologica',
    badge: 'Estacion 2',
    scenario:
      'El laboratorio de urgencia confirma trombocitopenia severa (22,000 /uL), LDH 920 U/L, esquistocitos 3.2% en frotis y falla renal aguda (Creatinina 3.8 mg/dL).',
    vitals: [
      { label: 'Plaquetas', value: '22,000 /uL', critical: true },
      { label: 'Creatinina', value: '3.8 mg/dL', critical: true },
      { label: 'LDH', value: '920 U/L', critical: true },
      { label: 'Esquistocitos', value: '3.2%', critical: true },
    ],
    clinicalQuestion:
      'Que entidad sindromica debe sospecharse prioritariamente antes de confirmar ADAMTS13?',
    options: [
      {
        id: 'opt-3',
        text: 'Microangiopatia trombotica: descartar Purpura Trombocitopenica Trombotica (PTT) vs SHU atipico.',
        isCorrect: true,
      },
      {
        id: 'opt-4',
        text: 'Purpura trombocitopenica idiopatica aislada sin compromiso microvascular.',
        isCorrect: false,
      },
    ],
    detectedGap: 'GAP_DIAGNOSTIC_REASONING',
    gapDescription:
      'Omitir la presencia de esquistocitos retrasa el diagnostico de microangiopatia trombotica sistemica.',
    pearl:
      'Perla Clinica: La triada de anemia hemolitica microangiopatica, trombocitopenia y lesion renal aguda exige descarte inmediato de PTT y activacion del panel de complemento.',
  },
  {
    stationNumber: 3,
    title: 'Manejo y Guias Internacionales',
    subtitle: 'Terapeutica Dirigida Basada en Evidencia',
    badge: 'Estacion 3',
    scenario:
      'Se descarta deficit severo de ADAMTS13 (> 10%) con prueba rapida y se confirma desregulacion de la via alternativa del complemento.',
    vitals: [
      { label: 'Guia', value: 'KDIGO 2024', critical: false },
      { label: 'Nivel', value: 'Grade 1A', critical: false },
      { label: 'Objetivo', value: 'Preservacion Renal', critical: false },
    ],
    clinicalQuestion:
      'Cual es la intervencion terapeutica definitiva segun la guia KDIGO 2024?',
    options: [
      {
        id: 'opt-5',
        text: 'Iniciar bloqueo de la fraccion C5 del complemento con eculizumab / ravulizumab dentro de las primeras 24-48 horas.',
        isCorrect: true,
      },
      {
        id: 'opt-6',
        text: 'Transfundir concentrado de plaquetas profilactico de forma rutinaria.',
        isCorrect: false,
      },
    ],
    detectedGap: 'GAP_INITIAL_MANAGEMENT',
    gapDescription:
      'La transfusion de plaquetas en microangiopatias tromboticas activas puede precipitar trombosis microvascular masiva.',
    pearl:
      'Perla Clinica: Segun KDIGO 2024, la transfusion de plaquetas esta contraindicada en microangiopatica trombotica salvo hemorragia con riesgo vital inminente.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onExploreWorlds,
}) => {
  const [activePreviewStation, setActivePreviewStation] = useState<number>(1);

  const currentPreview =
    PREVIEW_STATIONS.find((s) => s.stationNumber === activePreviewStation) ||
    PREVIEW_STATIONS[0];

  return (
    <div className="relative overflow-hidden selection:bg-clinical-teal selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-clinical-teal/20 rounded-full blur-[128px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-clinical-cyan/15 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-24">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section className="relative text-center space-y-8 max-w-4xl mx-auto pt-6">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-clinical-teal/40 text-clinical-teal-light text-xs font-mono tracking-wide shadow-lg">
            <span className="w-2 h-2 rounded-full bg-clinical-teal animate-pulse" />
            <span>BioIncubadora Cayetano | Proyectos de Ingenieria 2 - UPCH</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            El Simulador Clinico que Transforma el{' '}
            <span className="bg-gradient-to-r from-clinical-teal-light via-clinical-cyan to-teal-400 bg-clip-text text-transparent">
              Razonamiento Medico
            </span>{' '}
            Frente al Burnout de Guardia
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Entrenamiento adaptativo de alta fidelidad para internos y estudiantes peruanos.
            Diagnostica tus brechas cognitivas (OCRI) y consolida conceptos clave con perlas
            de 60 segundos y guias internacionales.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-clinical-teal to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-teal-950/40 hover:shadow-teal-900/60 transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Acceso Medico Demo UPCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreWorlds}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-gray-200 hover:text-white border border-white/10 hover:border-clinical-cyan/40 font-semibold text-sm transition-all active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-clinical-cyan" />
              <span>Explorar Simulador y Mundos Clinicos</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 max-w-3xl mx-auto">
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-clinical-cyan">
                4 Causas Raiz
              </span>
              <span className="text-xs text-gray-400">Taxonomia OCRI</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-white">
                D7 / D21
              </span>
              <span className="text-xs text-gray-400">Repeticion Espaciada</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-clinical-teal-light">
                60 Segundos
              </span>
              <span className="text-xs text-gray-400">Microperlas de Guardia</span>
            </div>
            <div className="p-3 text-center">
              <span className="block text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                100% Indexado
              </span>
              <span className="text-xs text-gray-400">KDIGO, ADA, AHA/ASA</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. COMPARISON & VALUE PROPOSITION BENTO GRID                              */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-clinical-teal/15 text-clinical-teal-light border border-clinical-teal/30">
              Arquitectura Cognitiva Diferencial
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Disenado para la Realidad Hospitalaria y el Pase de Visita
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Supera la memorizacion pasiva. OdyssMedic correlaciona el desempeno en el turno
              con el diagnostico de brechas especificas para elevar tu rango de competencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mas alla de los bancos estaticos */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0C0F1D] border border-white/10 hover:border-clinical-cyan/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-clinical-cyan/15 border border-clinical-cyan/30 flex items-center justify-center text-clinical-cyan">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-clinical-cyan transition-colors">
                  Mas alla de los bancos estaticos
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  No te limitamos a un simple &quot;Correcto o Incorrecto&quot;. Identificamos
                  la causa raiz del error clinico en 4 dimensiones criticas:
                </p>
                <ul className="text-xs text-gray-400 space-y-1.5 font-mono">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Triaje de Severidad</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Razonamiento Diagnostico</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Interpretacion de Laboratorio</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Manejo Inicial de Guardia</span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-clinical-teal-light">
                Motor Diagnostico OCRI Integrado
              </div>
            </div>

            {/* Card 2: Repaso Espaciado D7/D21 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0C0F1D] border border-white/10 hover:border-teal-400/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  Repaso Espaciado D7/D21
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Algoritmo basado en la curva del olvido de Ebbinghaus adaptado a la practica medica.
                  Cuando fallas una estacion, OdyssMedic agenda un refuerzo tactico a los 7 y 21 dias
                  con variaciones clinicas para consolidar memoria a largo plazo.
                </p>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-300 font-mono">
                  Ideal para el pase de visita hospitalario y la preparacion ENAM / EsSalud.
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-teal-400">
                Prescripcion Adaptativa Automatizada
              </div>
            </div>

            {/* Card 3: Accesibilidad Inmediata en Sala */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0C0F1D] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Accesibilidad Inmediata en Sala
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Optimizado para el ritmo frenetico de turnos de 12 y 24 horas. Interfaz responsive
                  ultraligera disenada tanto para smartphones en el bolsillo del mandil como para
                  laptops en sala de residentes, sin descargas pesadas ni configuracion previa.
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Casos completables en menos de 5 minutos</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-amber-400">
                Web App Responsive de Cero Friccion
              </div>
            </div>

            {/* Card 4: Accesible y Cost-Effective */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0C0F1D] border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Accesible y Cost-Effective
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Frente a cursos y bancos comerciales tradicionales que superan los USD 300 anuales,
                  OdyssMedic propone un modelo equitativo desde S/ 28 al mes, accesible a cualquier
                  estudiante o interno peruano con tecnologia de vanguardia UPCH.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono font-semibold">
                  S/ 28/mes vs USD 300+ en academias
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                Democratizacion del Razonamiento Clinico
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE DEMONSTRATION PREVIEW (3-STATION STEPPER)                   */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-clinical-cyan/15 text-clinical-cyan border border-clinical-cyan/30">
              Demostracion Interactiva
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Recorrido de Alta Fidelidad en 3 Estaciones
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Experimenta como OdyssMedic descompone un caso clinico complejo en tres estaciones
              cognitivas secuenciales con retroalimentacion inmediata.
            </p>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto">
            {PREVIEW_STATIONS.map((station) => {
              const isActive = activePreviewStation === station.stationNumber;
              return (
                <button
                  key={station.stationNumber}
                  type="button"
                  onClick={() => setActivePreviewStation(station.stationNumber)}
                  className={`w-full sm:w-1/3 flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-clinical-teal/20 border-clinical-teal text-white shadow-lg shadow-teal-950/30 font-semibold'
                      : 'bg-slate-900/80 border-white/10 text-gray-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-clinical-teal text-white'
                        : 'bg-slate-800 text-gray-400'
                    }`}
                  >
                    {station.stationNumber}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-medium truncate">
                      {station.title}
                    </span>
                    <span className="block text-[10px] text-gray-500 font-mono truncate">
                      {station.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Stepper Card */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#11162B] to-[#0A0D18] border border-white/10 shadow-2xl space-y-6">
            {/* Station Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-clinical-cyan/20 text-clinical-cyan border border-clinical-cyan/40">
                  {currentPreview.badge} : {currentPreview.subtitle}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">
                  {currentPreview.title}
                </h3>
              </div>
              <div className="text-xs font-mono text-gray-400">
                Paso {currentPreview.stationNumber} de 3
              </div>
            </div>

            {/* Vignette Scenario */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
                Caso Clinico - Escenario de Guardia
              </span>
              <p className="text-sm text-gray-200 leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-white/5">
                {currentPreview.scenario}
              </p>
            </div>

            {/* Vitals & Telemetry */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
                Telemetria y Parametros Clave
              </span>
              <div className="flex flex-wrap gap-2">
                {currentPreview.vitals.map((vit, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                      vit.critical
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-slate-800/80 border-white/10 text-gray-300'
                    }`}
                  >
                    <span className="text-gray-400 font-medium">{vit.label}:</span>
                    <span className="font-bold">{vit.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Stem Question & Options */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-clinical-cyan font-semibold">
                Desafio de Razonamiento
              </span>
              <p className="text-sm font-semibold text-white">
                {currentPreview.clinicalQuestion}
              </p>

              <div className="space-y-2">
                {currentPreview.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-xs font-sans flex items-start gap-3 transition-colors ${
                      opt.isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-900/60 border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="block mt-1 text-[11px] font-mono text-emerald-400">
                          Respuesta Correcta Fundamentada
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cognitive Gap Feedback & 60-Second Pearl */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Deteccion OCRI: {currentPreview.detectedGap}</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {currentPreview.gapDescription}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-300">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Perla Clinica de Guardia</span>
                </div>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {currentPreview.pearl}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. CALL TO ACTION STRIP                                                   */}
        {/* ========================================================================= */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-[#10192A] to-slate-900 border border-clinical-teal/30 space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Listo para entrenar tu razonamiento clinico?
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Unete a la comunidad de internos y residentes de Cayetano Heredia que estan dominando
              la guardia con medicina de precision y aprendizaje adaptativo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-clinical-teal hover:bg-teal-600 text-white font-bold text-sm shadow-xl shadow-teal-950/40 transition-all active:scale-[0.98]"
            >
              <span>Comenzar Entrenamiento Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onExploreWorlds}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 border border-white/10 font-semibold text-sm transition-all"
            >
              <span>Ver Casos y Especialidades</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. ACADEMIC & INSTITUTIONAL FOOTER                                        */}
        {/* ========================================================================= */}
        <footer className="pt-12 border-t border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-400 font-sans">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold block">
                Proyecto de Investigacion Aplicada
              </span>
              <p className="text-white font-semibold text-sm">OdyssMedic Precision Engine</p>
              <p className="text-gray-400">
                Proyectos de Ingenieria 2 - BioIncubadora Cayetano
              </p>
              <p className="text-gray-400">
                Universidad Peruana Cayetano Heredia (UPCH) 2026
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold block">
                Equipo de Desarrollo
              </span>
              <p className="text-gray-300">
                <span className="text-white font-medium">Autores:</span> Dario Huerta Cruz & Elvis Deiwis Pilco Cruz
              </p>
              <p className="text-gray-300">
                <span className="text-white font-medium">Evaluador y Docente:</span> Mag. Noe Bazan
              </p>
              <p className="text-gray-400">Facultad de Ciencias e Ingenieria - UPCH</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-semibold block">
                Fundamentacion Academica
              </span>
              <p className="text-gray-400 leading-relaxed">
                Plataforma de simulacion clinica adaptativa basada en la integracion de RAG
                con guias de practica clinica de referencia y modelado del proceso de razonamiento
                diagnostico en medicina de emergencia.
              </p>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-white/5 text-[11px] font-mono text-gray-500">
            ODYSSMEDIC PRECISION ENGINE (C) 2026 - UNIVERSIDAD PERUANA CAYETANO HEREDIA. TODOS LOS DERECHOS RESERVADOS.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
