import React, { useState } from 'react';
import { CognitiveGapTag } from '../types/api';
import {
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Compass,
  Smartphone,
  Coins,
  ShieldCheck,
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
    <div className="relative overflow-hidden bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-20">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                           */}
        {/* ========================================================================= */}
        <section className="relative text-center space-y-7 max-w-4xl mx-auto pt-4">
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm tracking-wide shadow-sm transition-all active:scale-[0.98]"
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
                4 Causas Raiz
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
        {/* 2. COMPARISON & VALUE PROPOSITION BENTO GRID                              */}
        {/* ========================================================================= */}
        <section className="space-y-8">
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
        {/* 3. INTERACTIVE DEMONSTRATION PREVIEW (3-STATION STEPPER)                   */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Demostracion Interactiva
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Recorrido de Alta Fidelidad en 3 Estaciones
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
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
                      ? 'bg-sky-50 border-sky-400 text-slate-900 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {station.stationNumber}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-medium truncate">
                      {station.title}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono truncate">
                      {station.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Stepper Card */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            {/* Station Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  {currentPreview.badge} : {currentPreview.subtitle}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                  {currentPreview.title}
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-500">
                Paso {currentPreview.stationNumber} de 3
              </div>
            </div>

            {/* Vignette Scenario */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Caso Clinico - Escenario de Guardia
              </span>
              <p className="text-sm text-slate-800 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {currentPreview.scenario}
              </p>
            </div>

            {/* Vitals & Telemetry */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Telemetria y Parametros Clave
              </span>
              <div className="flex flex-wrap gap-2">
                {currentPreview.vitals.map((vit, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                      vit.critical
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-slate-500 font-medium">{vit.label}:</span>
                    <span className="font-bold">{vit.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Stem Question & Options */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
                Desafio de Razonamiento
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {currentPreview.clinicalQuestion}
              </p>

              <div className="space-y-2">
                {currentPreview.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-xs font-sans flex items-start gap-3 transition-colors ${
                      opt.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span>{opt.text}</span>
                      {opt.isCorrect && (
                        <span className="block mt-1 text-[11px] font-mono text-emerald-700 font-semibold">
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
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Deteccion OCRI: {currentPreview.detectedGap}</span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  {currentPreview.gapDescription}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-800">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Perla Clinica de Guardia</span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  {currentPreview.pearl}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. CALL TO ACTION STRIP                                                   */}
        {/* ========================================================================= */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
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
