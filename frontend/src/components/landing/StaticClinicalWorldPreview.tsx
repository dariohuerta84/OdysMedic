import React from 'react';
import {
  Activity,
  Home,
  Compass,
  TrendingUp,
  BookOpen,
  BarChart2,
  Bell,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  Brain,
  Target,
  FileText,
  AlertCircle,
  MessageSquare,
  Settings,
  Lock,
} from 'lucide-react';

/**
 * Static, strictly non-interactive visual showcase of Mundo Clinico for the public Landing Page.
 * Mirrors the classic editorial medical aesthetic and pastel cards without allowing unauthenticated interaction.
 */
export const StaticClinicalWorldPreview: React.FC = () => {
  const cycleSteps = [
    { label: 'Evaluacion', icon: FileText, active: true },
    { label: 'Brecha', icon: AlertCircle, active: false },
    { label: 'Feedback', icon: MessageSquare, active: false },
    { label: 'Aprendizaje', icon: BookOpen, active: false },
    { label: 'Practica', icon: Settings, active: false },
    { label: 'Reevaluacion', icon: BarChart2, active: false },
  ];

  return (
    <div className="relative w-full">
      {/* Subtle non-interactive frame */}
      <div
        aria-label="Vista previa ilustrativa de Mundo Clinico (requiere registro para interactuar)"
        className="pointer-events-none select-none rounded-2xl overflow-hidden border border-[#D7E3E0] bg-white shadow-[0_20px_50px_rgba(11,37,46,0.09)]"
      >
        <div className="grid grid-cols-12 min-h-[430px]">
          {/* Left Classic Deep-Teal Sidebar */}
          <div className="col-span-4 sm:col-span-3 bg-[#0A3D38] text-white p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Window dots + Brand */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-2 h-2 rounded-full bg-white/70" />
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="w-2 h-2 rounded-full bg-white/30" />
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#7CD4C6] shrink-0" />
                  <span className="font-serif font-semibold text-sm tracking-tight text-white">
                    OdyssMedic
                  </span>
                </div>
              </div>

              {/* Sidebar menu */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#145C54] text-white font-medium">
                  <Home className="w-3.5 h-3.5 text-[#9CE3D7] shrink-0" />
                  <span className="truncate">Inicio</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/75">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Mundos clinicos</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/75">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Mi progreso</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/75">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Biblioteca</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/75">
                  <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Estadisticas</span>
                </div>
              </div>
            </div>

            {/* Bottom sidebar quote */}
            <div className="pt-4 border-t border-white/15 text-center hidden sm:block">
              <div className="w-6 h-0.5 bg-[#7CD4C6]/60 mx-auto mb-2" />
              <p className="text-[10px] italic text-white/75 leading-snug font-serif">
                &ldquo;Mejores medicos para un manana mas sano.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Main Clinical Canvas */}
          <div className="col-span-8 sm:col-span-9 bg-[#FAFDFC] p-4 sm:p-5 flex flex-col justify-between space-y-4">
            {/* Top Greeting Bar */}
            <div className="flex items-start justify-between gap-2 border-b border-[#E6EFED] pb-3">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0B252E] leading-tight">
                  ¡Hola, Alex!
                </h3>
                <p className="text-[11px] text-[#5C737C]">
                  Tu esfuerzo de hoy construye el medico que seras manana.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                <Bell className="w-3.5 h-3.5 text-[#5C737C]" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#4F6D7A] text-white text-[11px] font-semibold flex items-center justify-center">
                    A
                  </div>
                  <div className="leading-tight">
                    <span className="block text-[11px] font-semibold text-[#0B252E]">Alex R.</span>
                    <span className="block text-[9px] text-[#6E828A]">Estudiante de Medicina</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#6E828A]" />
                </div>
              </div>
            </div>

            {/* Tu Ruta Clinica Card */}
            <div className="rounded-xl bg-white border border-[#E3ECEA] p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#0B252E]">
                  Tu ruta clinica
                </span>
                <span className="text-[10px] font-medium text-[#0E6F65] flex items-center gap-1">
                  Ver ruta completa
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Circular 68% gauge */}
                <div className="flex items-center gap-2.5 sm:border-r sm:border-[#EBF1F0] sm:pr-2">
                  <div className="relative w-12 h-12 shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r="19"
                        fill="none"
                        stroke="#E6F2EF"
                        strokeWidth="4.5"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="19"
                        fill="none"
                        stroke="#199A8B"
                        strokeWidth="4.5"
                        strokeDasharray="119.4"
                        strokeDashoffset="38.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#0B252E]">
                      68%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-[#0B252E]">
                      Progreso global
                    </span>
                    <span className="block text-[10px] text-[#6E828A]">
                      24 de 35 estaciones
                    </span>
                  </div>
                </div>

                {/* Active World */}
                <div className="p-2.5 rounded-lg bg-[#F4F9F8] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#D8E8E4] flex items-center justify-center text-[#0E6F65] shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] text-[#6E828A]">Mundo activo</span>
                    <span className="block text-[11px] font-bold text-[#0B252E] truncate">
                      Medicina Interna
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-[#4A606A] mt-0.5">
                      Cambiar mundo <ChevronDown className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                {/* Next Station */}
                <div className="p-2.5 rounded-lg bg-[#F4F9F8] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#D8E8E4] flex items-center justify-center text-[#0E6F65] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] text-[#6E828A]">Proxima estacion</span>
                    <span className="block text-[11px] font-bold text-[#0B252E] truncate">
                      Dolor toracico
                    </span>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-[#0E6F65] text-white text-[9px] font-medium">
                      Comenzar <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Soft Pastel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Pastel Blush: Brecha detectada */}
              <div className="rounded-xl bg-[#FBF1F1] border border-[#F2D9D9] p-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[#B44B4E] shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold text-[#B44B4E]">
                      Brecha detectada
                    </span>
                    <span className="block text-[11px] font-bold text-[#0B252E] leading-tight">
                      Interpretacion de ECG
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#574344] leading-snug">
                  Has tenido dificultades en la identificacion de patrones de isquemia.
                </p>
              </div>

              {/* Pastel Cream: Tipo de error */}
              <div className="rounded-xl bg-[#FDF7E7] border border-[#EFE2BE] p-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[#A87624] shrink-0">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold text-[#A87624]">
                      Tipo de error
                    </span>
                    <span className="block text-[11px] font-bold text-[#0B252E] leading-tight">
                      Integracion clinico-diagnostica
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#5B503B] leading-snug">
                  Dificultad para integrar datos clinicos con hallazgos complementarios.
                </p>
              </div>

              {/* Pastel Sage-Mint: Siguiente paso */}
              <div className="rounded-xl bg-[#ECF6F4] border border-[#CFE7E2] p-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[#0E6F65] shrink-0">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold text-[#0E6F65]">
                      Siguiente paso
                    </span>
                    <span className="block text-[11px] font-bold text-[#0B252E] leading-tight">
                      Microaprendizaje + nueva practica
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#3B5550] leading-snug">
                  Revisa el contenido clave y luego realiza una nueva estacion adaptativa.
                </p>
              </div>
            </div>

            {/* Bottom 6-Step Adaptive Cycle */}
            <div className="pt-1 hidden sm:grid grid-cols-6 gap-1.5 items-center text-center">
              {cycleSteps.map((st) => {
                const Icon = st.icon;
                return (
                  <div key={st.label} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                        st.active
                          ? 'bg-[#0E6F65] text-white border-[#0E6F65]'
                          : 'bg-white text-[#4A606A] border-[#D7E3E0]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[9px] font-medium ${
                        st.active ? 'text-[#0E6F65] font-semibold' : 'text-[#5C737C]'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle classic caption clarifying static preview */}
      <div className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-[#5C737C]">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#0E6F65] shrink-0" />
          <span>Vista demostrativa del sistema Mundo Clinico (el ingreso interactivo requiere registro)</span>
        </span>
        <span className="font-serif italic text-[#0E6F65] hidden sm:inline">
          Una ruta que evoluciona contigo
        </span>
      </div>
    </div>
  );
};

export default StaticClinicalWorldPreview;
