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
  Hospital,
  BatteryCharging,
  XCircle,
} from 'lucide-react';

export interface LandingPageProps {
  onStartDemo: () => void;
  onExploreWorlds: () => void;
}

interface StudentTimeRealityPanel {
  id: string;
  stepNumber: number;
  badge: string;
  iconType: 'hospital' | 'battery' | 'sparkles';
  title: string;
  subtitle: string;
  highlightMetric: string;
  highlightLabel: string;
  hospitalRealitySummary: string;
  frictionPoints: string[];
  odyssmedicContrast: {
    approachTitle: string;
    description: string;
    keyBenefit: string;
    timeInvested: string;
  };
}

const STUDENT_TIME_PANELS: StudentTimeRealityPanel[] = [
  {
    id: 'guardias-sobrecarga',
    stepNumber: 1,
    badge: 'Fase 1 : La Realidad en Sala',
    iconType: 'hospital',
    title: 'Guardias de 24 a 36 Horas y Sobrecarga Asistencial',
    subtitle: 'El tiempo fisico y la fatiga cognitiva impiden abrir libros extensos',
    highlightMetric: '36 hrs',
    highlightLabel: 'Turnos hospitalarios continuos de pie',
    hospitalRealitySummary:
      'Durante el internado y la formacion clinica, el estudiante enfrenta hasta 30 pacientes por guardia: evoluciones clinicas, notas de ingreso, altas y toma de vias. Al terminar, el agotamiento psicomotor hace imposible concentrarse en lecturas pasivas de 400 paginas.',
    frictionPoints: [
      'Jornadas extendidas con privacion aguda de sueno y sobrecarga documental.',
      'Perdida del 60% en la capacidad de retencion lectora tras un turno de guardia.',
      'Inviabilidad de cumplir horarios rigidos de academias comerciales presenciales.',
    ],
    odyssmedicContrast: {
      approachTitle: 'Micro-Entrenamiento Clinico de 5 Minutos',
      description:
        'Casos clinicos fraccionados en microestaciones que puedes resolver en la sala de descanso o camino al hospital sin abrir libros pesados.',
      keyBenefit: 'Practica guiada sin exigir bloques de 4 horas continuas.',
      timeInvested: '3 a 5 min por caso',
    },
  },
  {
    id: 'bancos-ineficientes',
    stepNumber: 2,
    badge: 'Fase 2 : La Inercia Tradicional',
    iconType: 'battery',
    title: 'El Colapso de los Bancos de Preguntas Pasivos',
    subtitle: 'Memorizar claves aisladas genera saturacion mental y olvido acelerado',
    highlightMetric: '70%',
    highlightLabel: 'Perdida de retencion tras 48 horas sin refuerzo espaciado',
    hospitalRealitySummary:
      'Los bancos tradicionales acumulan cientos de preguntas desactualizadas donde el alumno memoriza la alternativa correcta sin entender la fisiopatologia ni el triaje. Ante un caso atipico o una pregunta formulada de manera distinta en el examen real, la duda reaparece.',
    frictionPoints: [
      'Simulacros interminables de 100 preguntas que causan desmotivacion y fatiga visual.',
      'Retroalimentacion superficial: solo indica si acertaste o erraste sin diagnostico de causa.',
      'Reiteracion de errores en puntos ciegos no identificados a tiempo.',
    ],
    odyssmedicContrast: {
      approachTitle: 'Diagnostico de Causa Raiz OCRI',
      description:
        'El motor clasifica cada desvio en una de 4 brechas: Triaje, Razonamiento Diagnostico, Laboratorio o Manejo Terapeutico, explicando el error con evidencia.',
      keyBenefit: 'Perlas clinicas de 60 segundos con guias KDIGO, ADA y AHA/ASA indexadas.',
      timeInvested: '60 seg por perla',
    },
  },
  {
    id: 'solucion-adaptativa',
    stepNumber: 3,
    badge: 'Fase 3 : La Respuesta OdyssMedic',
    iconType: 'sparkles',
    title: 'Micro-Aprendizaje Adaptativo con Repeticion Espaciada',
    subtitle: 'Consolidacion de largo plazo ajustada exactamente a tus minutos disponibles',
    highlightMetric: '100%',
    highlightLabel: 'Enfocado en tus brechas clinicas personales',
    hospitalRealitySummary:
      'OdyssMedic no te pide cambiar tu rutina hospitalaria. Utiliza algoritmos de repeticion espaciada (D7 / D21) para reevaluar tus brechas clinicas en el momento optimo de consolidacion neuronal, garantizando que el concepto quede grabado antes del examen.',
    frictionPoints: [
      'Elimina la sensacion de culpa por no tener 4 horas libres al dia.',
      'No pierdes tiempo seleccionando que estudiar: el sistema prioriza tus puntos debiles.',
      'Visualiza en tiempo real si estas Apto para tu examen antes de rendirlo.',
    ],
    odyssmedicContrast: {
      approachTitle: 'Prescripcion Neural Automatizada D7 / D21',
      description:
        'Si cometes un desvio en una emergencia endocrina o nefrologica, el motor calendariza una variante clinica a los 7 y 21 dias para fijar la conducta correcta.',
      keyBenefit: 'Llega al examen y al pase de visita con seguridad y reflejos clinicos entrenados.',
      timeInvested: '5 min al dia',
    },
  },
];

interface TimeOption {
  minutes: number;
  label: string;
  outputDescription: string;
  badge: string;
}

const TIME_OPTIONS: TimeOption[] = [
  {
    minutes: 5,
    label: '5 Minutos Libres',
    badge: 'Pausa de Guardia',
    outputDescription:
      '1 Desafio Clinico Enfocado + 1 Diagnostico de Causa Raiz OCRI + 1 Perla Clinica de 60 segundos.',
  },
  {
    minutes: 15,
    label: '15 Minutos Libres',
    badge: 'Post-Almuerzo o Trayecto',
    outputDescription:
      '3 Estaciones Clinicas Secuenciales (Triaje, Diagnostico y Manejo) + Calibracion de Radar de Competencias.',
  },
  {
    minutes: 30,
    label: '30 Minutos Libres',
    badge: 'Sesion de Descanso',
    outputDescription:
      'Caso Multidisciplinario Completo + Despeje de Cola de Repeticion Espaciada D7/D21 + Revision de Guias.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onExploreWorlds,
}) => {
  const [activePanelIndex, setActivePanelIndex] = useState<number>(0);
  const [selectedTimeMinutes, setSelectedTimeMinutes] = useState<number>(5);

  const activePanel = STUDENT_TIME_PANELS[activePanelIndex];
  const selectedTimeOption =
    TIME_OPTIONS.find((t) => t.minutes === selectedTimeMinutes) || TIME_OPTIONS[0];

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
        {/* 2. THE TIME SCARCITY REALITY: INTERACTIVE PANELS                           */}
        {/* ========================================================================= */}
        <section className="space-y-8" aria-label="Por que los alumnos no tienen tiempo para estudiar">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              La Realidad Clinica del Estudiante
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Por Que los Alumnos No Tienen Tiempo para Rendir Correctamente sus Examenes
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              La preparacion medica tradicional exige sentarse 4 horas seguidas a memorizar manuales.
              En un entorno de internado con guardias de 36 horas, esta inercia genera frustracion y bajo rendimiento.
            </p>
          </div>

          {/* Step Selector Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-4xl mx-auto">
            {STUDENT_TIME_PANELS.map((panel, idx) => {
              const isActive = activePanelIndex === idx;
              const IconComponent =
                panel.iconType === 'hospital'
                  ? Hospital
                  : panel.iconType === 'battery'
                    ? BatteryCharging
                    : Sparkles;

              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setActivePanelIndex(idx)}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-white border-sky-400 ring-2 ring-sky-100 shadow-sm'
                      : 'bg-white/70 border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-[11px] font-mono text-sky-700 font-semibold uppercase tracking-wider">
                      Paso {panel.stepNumber} de 3
                    </span>
                    <span className={`block text-xs sm:text-sm font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {panel.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Interactive Panel Card */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 animate-fade-in">
            {/* Header: Title, Badge and Key Stat */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  {activePanel.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activePanel.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  {activePanel.subtitle}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[140px]">
                <span className="block text-2xl font-extrabold font-mono text-sky-700">
                  {activePanel.highlightMetric}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block leading-tight">
                  {activePanel.highlightLabel}
                </span>
              </div>
            </div>

            {/* Context Summary */}
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              {activePanel.hospitalRealitySummary}
            </p>

            {/* Side-by-Side Contrast: Obstacle vs OdyssMedic Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Left Column: The Real Obstacle */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-800 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>El Obstaculo en la Practica Hospitalaria</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {activePanel.frictionPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: OdyssMedic Precision Solution */}
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-800 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{activePanel.odyssmedicContrast.approachTitle}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activePanel.odyssmedicContrast.description}
                  </p>
                  <p className="text-xs font-medium text-sky-900 pt-1">
                    {activePanel.odyssmedicContrast.keyBenefit}
                  </p>
                </div>
                <div className="pt-3 border-t border-sky-200/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Inversion de tiempo:</span>
                  <span className="font-bold text-sky-800">
                    {activePanel.odyssmedicContrast.timeInvested}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Interactive Tool: "Que Puedes Lograr Segun tus Minutos Libres" */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Comprueba lo que Puedes Lograr con tu Tiempo Real:</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Selecciona tus minutos disponibles
                </span>
              </div>

              {/* Time Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {TIME_OPTIONS.map((opt) => {
                  const isTimeActive = selectedTimeMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => setSelectedTimeMinutes(opt.minutes)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isTimeActive
                          ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isTimeActive ? 'text-sky-900' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                          {opt.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Result Pill */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                  {selectedTimeMinutes}m
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Sesion Prescrita por el Motor OCRI ({selectedTimeOption.label}):
                  </span>
                  <span className="text-xs text-slate-600 font-sans">
                    {selectedTimeOption.outputDescription}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. COMPARISON & VALUE PROPOSITION BENTO GRID                              */}
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
        {/* 4. CALL TO ACTION STRIP                                                   */}
        {/* ========================================================================= */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
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
