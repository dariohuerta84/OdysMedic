import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BarChart2,
  Users,
  Stethoscope,
  Clock,
  BookOpen,
  ShieldCheck,
  XCircle,
  Lock,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { StaticClinicalWorldPreview } from '../components/landing/StaticClinicalWorldPreview';

export interface LandingPageProps {
  onStartRoute: () => void;
  onOpenLibrary: () => void;
}

const ComparisonRow1: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15, triggerOnce: false });

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {/* Left: Hospital Shift Overload */}
      <div
        className={`p-7 rounded-2xl bg-[#FBF1F1] border border-[#EED7D7] flex flex-col justify-between space-y-5 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#E8CECE] pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9E3F42]">
              Realidad hospitalaria
            </span>
            <span className="font-serif text-2xl font-bold text-[#8E3538]">36 horas</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B252E] leading-snug">
            Guardias extensas que agotan el tiempo de estudio tradicional
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { hour: '08:00', task: 'Pase de visita' },
              { hour: '14:00', task: 'Evoluciones' },
              { hour: '22:00', task: 'Emergencias' },
              { hour: '06:00', task: 'Entrega guardia' },
            ].map((slot) => (
              <div
                key={slot.hour}
                className="p-2.5 rounded-xl bg-white/85 border border-[#EED7D7]"
              >
                <span className="font-semibold block text-[#9E3F42]">{slot.hour}</span>
                <span className="text-[11px] text-[#574344]">{slot.task}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/90 border border-[#EED7D7] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#574344]">Reserva de atencion al finalizar el turno</span>
              <span className="font-semibold text-[#9E3F42]">8% disponible</span>
            </div>
            <div className="w-full h-2 bg-[#F4E3E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B44B4E] rounded-full transition-all duration-1000"
                style={{ width: isVisible ? '8%' : '0%' }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#574344] leading-relaxed">
          Intentar abrir tratados extensos durante cuatro horas continuas despues de una guardia resulta insostenible.
        </p>
      </div>

      {/* Right: OdyssMedic Calm Micro-Stations */}
      <div
        className={`p-7 rounded-2xl bg-[#ECF6F4] border border-[#CFE7E2] flex flex-col justify-between space-y-5 transition-all duration-700 ease-out delay-150 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#CBE3DE] pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E6F65]">
              Ruta OdyssMedic
            </span>
            <span className="font-serif text-2xl font-bold text-[#0E6F65]">5 minutos</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B252E] leading-snug">
            Estaciones clinicas breves pensadas para tus pausas reales
          </h3>

          <div className="p-4 rounded-xl bg-white/95 border border-[#D5EAE6] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0B252E]">Estacion adaptativa · Nefrologia</span>
              <span className="text-[#0E6F65] font-medium">Triaje hemodinamico</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[#354B54]">
              <span className="px-2.5 py-1 rounded-full bg-[#FBF1F1] text-[#9E3F42] font-medium">
                PA 85/55 mmHg
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#FBF1F1] text-[#9E3F42] font-medium">
                FC 118 lpm
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#F2F7F6] text-[#354B54]">
                SatO2 95%
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#1E5E56] pt-1">
              <CheckCircle2 className="w-4 h-4 text-[#0E6F65] shrink-0" />
              <span>Reanimacion guiada por metas y vigilancia de diuresis horaria</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/95 border border-[#D5EAE6] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#354B54]">Adaptabilidad al ritmo hospitalario</span>
              <span className="font-semibold text-[#0E6F65]">100% realizable</span>
            </div>
            <div className="w-full h-2 bg-[#DCECE9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0E6F65] rounded-full transition-all duration-1000"
                style={{ width: isVisible ? '100%' : '0%' }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#35544F] leading-relaxed">
          Avanzas estacion por estacion con calma, consolidando criterio diagnostico sin saturar tu jornada.
        </p>
      </div>
    </div>
  );
};

const ComparisonRow2: React.FC = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15, triggerOnce: false });

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      {/* Left: Passive Question Banks */}
      <div
        className={`p-7 rounded-2xl bg-[#FDF7E7] border border-[#EFE2BE] flex flex-col justify-between space-y-5 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#E8D8AE] pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A6B1F]">
              Bancos convencionales
            </span>
            <span className="font-serif text-2xl font-bold text-[#8A5E18]">70% olvido</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B252E] leading-snug">
            Memorizar claves aisladas sin comprender el origen del error
          </h3>

          <div className="space-y-2.5 text-xs sm:text-sm text-[#5B503B]">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-[#EFE2BE]">
              <XCircle className="w-4 h-4 text-[#B9852D] shrink-0 mt-0.5" />
              <span>Simulacros extensos que indican la letra correcta sin desglosar el razonamiento clinico.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-[#EFE2BE]">
              <XCircle className="w-4 h-4 text-[#B9852D] shrink-0 mt-0.5" />
              <span>Inseguridad cuando un caso real modifica los signos vitales o antecedentes del paciente.</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B503B] leading-relaxed">
          La repeticion mecanica se diluye en pocos dias si no se corrige el habito diagnostico subyacente.
        </p>
      </div>

      {/* Right: Root-Cause Gap Engine */}
      <div
        className={`p-7 rounded-2xl bg-[#F2F7F6] border border-[#D7E5E2] flex flex-col justify-between space-y-5 transition-all duration-700 ease-out delay-150 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#D2E2DF] pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E6F65]">
              Analisis formativo OCRI
            </span>
            <span className="font-serif text-2xl font-bold text-[#0E6F65]">4 dimensiones</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B252E] leading-snug">
            Deteccion precisa de tu brecha con retroalimentacion fundamentada
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-between">
              <span className="text-[#354B54]">Triaje y severidad</span>
              <span className="font-semibold text-[#0E6F65]">Estable</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FDF7E7] border border-[#E9D7AC] flex items-center justify-between">
              <span className="font-semibold text-[#0B252E]">Integracion diagnostica</span>
              <span className="font-semibold text-[#9A6B1F]">Reforzar</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-between">
              <span className="text-[#354B54]">Examenes auxiliares</span>
              <span className="font-semibold text-[#0E6F65]">Estable</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-between">
              <span className="text-[#354B54]">Conducta inicial</span>
              <span className="font-semibold text-[#0E6F65]">Estable</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#354B54] leading-relaxed">
          Cada respuesta genera una sintesis clinica respaldada por guias internacionales y agenda repaso espaciado a 7 y 21 dias.
        </p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRoute,
  onOpenLibrary,
}) => {
  const [selectedMetricTab, setSelectedMetricTab] = useState<'tiempo' | 'retencion' | 'causa'>('tiempo');
  const worldsReveal = useScrollReveal({ threshold: 0.12, triggerOnce: false });
  const testimonialsReveal = useScrollReveal({ threshold: 0.12, triggerOnce: false });

  const clinicalWorldsOverview = [
    {
      title: 'Medicina Interna',
      subtitle: 'Dolor toracico, sepsis, insuficiencia cardiaca y neumologia clinica.',
      sources: 'ESC · Surviving Sepsis · Harrison 21.a Ed.',
      tone: 'bg-[#ECF6F4] border-[#CFE7E2]',
    },
    {
      title: 'Pediatria',
      subtitle: 'Rehidratacion Plan A/B/C, urgencias respiratorias, Kawasaki y neuroinfeccion.',
      sources: 'OMS/MINSA · AAP · Nelson 22.a Ed.',
      tone: 'bg-[#FDF7E7] border-[#EFE2BE]',
    },
    {
      title: 'Gineco-Obstetricia',
      subtitle: 'Claves obstetricas, preeclampsia severa, hemorragia posparto y patologia trofoblastica.',
      sources: 'ACOG · FIGO · RCOG/CDC',
      tone: 'bg-[#FBF1F1] border-[#EED7D7]',
    },
    {
      title: 'Cirugia y Especialidades',
      subtitle: 'Abdomen agudo, via biliar TG18, trauma ATLS, nefrologia, neurologia y reumatologia.',
      sources: 'TG18 · WSES · ATLS 10.a Ed. · KDIGO',
      tone: 'bg-[#F2F7F6] border-[#D7E5E2]',
    },
  ];

  const testimonials = [
    {
      quote:
        'En lugar de resolver cientos de preguntas al azar cansada despues del hospital, aqui identifico en diez minutos que mi brecha estaba en la interpretacion gasometrica.',
      author: 'Valeria M.',
      role: 'Interna de Medicina Humana',
    },
    {
      quote:
        'La separacion por estaciones clinicas obliga a razonar como frente a un paciente real: primero estabilizar, luego pedir el examen preciso y recien entonces tratar.',
      author: 'Rodrigo C.',
      role: 'Estudiante de 6to ano · Preparacion ENAM',
    },
    {
      quote:
        'Las fichas de recoleccion de datos de la Biblioteca resumen exactamente que preguntar en la anamnesis y que signos de alarma buscar en el pase de visita.',
      author: 'Andrea L.',
      role: 'Medica Serumista',
    },
  ];

  return (
    <div className="bg-[#FDFCFA] text-[#0B252E]">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION (Classic Medical Editorial + Static Mundo Preview)    */}
      {/* ===================================================================== */}
      <section className="relative bg-gradient-to-br from-[#EEF6F4] via-[#F6FAF9] to-[#FDFCFA] border-b border-[#E3ECEA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Typography & Primary Action */}
            <div className="lg:col-span-5 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A656E] animate-fade-in-up">
                Tu potencial clinico, nuestra ruta
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight leading-[1.12] text-[#0B252E] animate-fade-in-up stagger-1">
                <span className="block">Entrena clinicamente.</span>
                <span className="block">Detecta tus brechas.</span>
                <span className="block text-[#0E6F65]">Sigue una ruta hecha para ti.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#4A606A] leading-relaxed animate-fade-in-up stagger-2">
                OdyssMedic convierte tu desempeno en una ruta de aprendizaje personalizada a
                traves de mundos clinicos, con retroalimentacion experta, estaciones adaptativas
                y un enfoque basado en la practica real.
              </p>

              {/* Primary CTA & Open Library Access */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 animate-fade-in-up stagger-3">
                <button
                  type="button"
                  onClick={() => onStartRoute()}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] active:scale-[0.99] text-white font-medium text-sm sm:text-base transition-all duration-200 shadow-xs"
                >
                  <span>Empieza tu ruta</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/90 hover:bg-white text-[#0B252E] border border-[#CFDAD8] hover:border-[#0E6F65]/50 font-medium text-sm sm:text-base transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4 text-[#0E6F65]" />
                  <span>Explorar Biblioteca</span>
                </button>
              </div>

              {/* 3 Calm Trust Pillars */}
              <div className="pt-5 border-t border-[#DCE7E5] grid grid-cols-3 gap-4 text-xs text-[#4A606A] animate-fade-in-up stagger-4">
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
                  <span className="leading-snug">Basado en casos clinicos reales</span>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart2 className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
                  <span className="leading-snug">Se adapta a tu nivel</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
                  <span className="leading-snug">Disenado por medicos para futuros medicos</span>
                </div>
              </div>
            </div>

            {/* Right Column: Static Non-Interactive Showcase of Mundo Clinico */}
            <div className="lg:col-span-7 animate-fade-in-up stagger-2">
              <div className="animate-gentle-float">
                <StaticClinicalWorldPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        {/* ===================================================================== */}
        {/* 2. QUIENES SOMOS & COMO FUNCIONA (Scroll-Reveal Left/Right Panels)    */}
        {/* ===================================================================== */}
        <section id="quienes-somos" className="space-y-12 scroll-mt-24">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E6F65]">
              Quienes somos y por que existimos
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B252E] leading-tight">
              Formacion medica serena cuando el tiempo es tu recurso mas escaso
            </h2>
            <p className="text-sm sm:text-base text-[#4A606A] leading-relaxed">
              Comprendemos la exigencia de las rotaciones hospitalarias. Por eso reemplazamos
              la sobrecarga de estudio pasivo por diagnostico cognitivo preciso y microaprendizaje clinico.
            </p>
          </div>

          <div id="como-funciona" className="space-y-8 scroll-mt-24">
            <ComparisonRow1 />
            <ComparisonRow2 />
          </div>

          {/* Calm Classic Comparison Selector */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E8E6] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDF2F0] pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0E6F65]">
                  Sintesis comparativa
                </p>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B252E]">
                  Explora como cambia tu preparacion diaria
                </h3>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F7F6] border border-[#DCE5E3]">
                {[
                  { id: 'tiempo' as const, label: 'Tiempo requerido' },
                  { id: 'retencion' as const, label: 'Retencion clinica' },
                  { id: 'causa' as const, label: 'Lectura del error' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMetricTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedMetricTab === item.id
                        ? 'bg-white text-[#0B252E] shadow-2xs font-semibold'
                        : 'text-[#5C737C] hover:text-[#0B252E]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div key={selectedMetricTab} className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up">
              <div className="p-5 rounded-xl bg-[#FBF1F1] border border-[#EED7D7] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9E3F42] block">
                  Estudio tradicional fragmentado
                </span>
                <span className="font-serif text-2xl font-bold text-[#0B252E] block">
                  {selectedMetricTab === 'tiempo'
                    ? 'Bloques rigidos de 3 a 4 horas'
                    : selectedMetricTab === 'retencion'
                      ? '30% retenido a las 48 horas'
                      : 'Calificacion sin causa raiz'}
                </span>
                <p className="text-xs sm:text-sm text-[#574344] leading-relaxed">
                  {selectedMetricTab === 'tiempo'
                    ? 'Dificil de sostener con regularidad durante guardias, rotaciones clinicas o internado.'
                    : selectedMetricTab === 'retencion'
                      ? 'La lectura pasiva sin evocacion espaciada pierde solidez frente a casos complejos.'
                      : 'No distingue si fallaste por omitir signos de alarma, interpretar mal un examen o elegir dosis.'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#ECF6F4] border border-[#CFE7E2] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0E6F65] block">
                  Metodo adaptativo OdyssMedic
                </span>
                <span className="font-serif text-2xl font-bold text-[#0E6F65] block">
                  {selectedMetricTab === 'tiempo'
                    ? 'Estaciones de 3 a 5 minutos'
                    : selectedMetricTab === 'retencion'
                      ? 'Consolidacion guiada D7 y D21'
                      : 'Diagnostico de brecha especifica'}
                </span>
                <p className="text-xs sm:text-sm text-[#35544F] leading-relaxed">
                  {selectedMetricTab === 'tiempo'
                    ? 'Avance constante desde laptop o telefono movil respetando tu carga asistencial.'
                    : selectedMetricTab === 'retencion'
                      ? 'Reevaluacion automatica en los intervalos exactos para fijar criterio clinico duradero.'
                      : 'Identifica la brecha exacta y te conecta con guias clinicas multi-fuente verificadas.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. MUNDOS CLINICOS OVERVIEW (Informational; Requires Registration)    */}
        {/* ===================================================================== */}
        <section
          id="mundos-clinicos"
          ref={worldsReveal.ref}
          className={`space-y-10 scroll-mt-24 transition-all duration-700 ${
            worldsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3E8E6] pb-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E6F65]">
                Estructura academica
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B252E]">
                Mundos clinicos diseñados para evolucionar contigo
              </h2>
              <p className="text-sm text-[#4A606A] leading-relaxed">
                Para ingresar e interactuar con tu Mundo Clinico es necesario crear tu cuenta y
                calibrar tu punto de partida con una evaluacion general o por especialidad.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenLibrary}
              className="self-start md:self-auto inline-flex items-center gap-2 text-sm font-semibold text-[#0E6F65] hover:text-[#0A564E] underline underline-offset-4 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Consultar Biblioteca Clinica abierta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicalWorldsOverview.map((world) => (
              <div
                key={world.title}
                className={`p-6 rounded-2xl border ${world.tone} editorial-card-lift flex flex-col justify-between space-y-5`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white/90 border border-[#DCE5E3] flex items-center justify-center text-[#0E6F65]">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0B252E]">
                    {world.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A606A] leading-relaxed">
                    {world.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 space-y-3">
                  <p className="text-[11px] text-[#5C737C] font-medium">
                    Fuentes: {world.sources}
                  </p>
                  <button
                    type="button"
                    onClick={() => onStartRoute()}
                    className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E6F65] hover:text-[#0A564E]"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Registrarse para ingresar</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. TESTIMONIOS                                                        */}
        {/* ===================================================================== */}
        <section
          id="testimonios"
          ref={testimonialsReveal.ref}
          className={`space-y-10 scroll-mt-24 transition-all duration-700 ${
            testimonialsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E6F65]">
              Voces de nuestra comunidad
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B252E]">
              Claridad clinica en cada etapa de la carrera
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E3E8E6] editorial-card-lift flex flex-col justify-between space-y-5"
              >
                <p className="font-serif italic text-base text-[#1E3640] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-4 border-t border-[#EDF2F0]">
                  <span className="block text-sm font-semibold text-[#0B252E]">
                    {t.author}
                  </span>
                  <span className="block text-xs text-[#6E828A]">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. FINAL EDITORIAL CTA                                                */}
        {/* ===================================================================== */}
        <section className="rounded-3xl bg-[#F2F7F6] border border-[#D7E5E2] p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0E6F65]">
              Comienza hoy
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B252E]">
              Construye seguridad clinica antes de tu proximo examen o guardia
            </h2>
            <p className="text-sm sm:text-base text-[#4A606A] leading-relaxed">
              Registrate en menos de un minuto y elige si deseas rendir una evaluacion general
              de todas las especialidades o enfocarte en una sola especialidad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => onStartRoute()}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] active:scale-[0.99] text-white font-medium text-sm sm:text-base transition-all duration-200 shadow-xs"
            >
              <span>Empieza tu ruta</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-[#FDFCFA] text-[#0B252E] border border-[#CFD7D5] hover:border-[#0E6F65]/50 font-medium text-sm sm:text-base transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 text-[#0E6F65]" />
              <span>Revisar Biblioteca Clinica</span>
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 6. CLASSIC FOOTER                                                     */}
        {/* ===================================================================== */}
        <footer className="pt-10 border-t border-[#E3E8E6] grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#5C737C]">
          <div className="space-y-2">
            <span className="font-serif text-lg font-bold text-[#0D4A44] block">
              OdyssMedic
            </span>
            <p className="leading-relaxed">
              Plataforma de entrenamiento clinico adaptativo, deteccion de brechas de razonamiento
              y consulta bibliografica estructurada para estudiantes de medicina y medicos en formacion.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0B252E] block">
              Pilares Metodologicos
            </span>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E6F65]" />
                <span>Evaluacion inicial general o por especialidad</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0E6F65]" />
                <span>Repeticion espaciada en ciclos D7 y D21</span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#0E6F65]" />
                <span>Guias internacionales multi-fuente por especialidad</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0B252E] block">
              Equipo y Desarrollo Academico
            </span>
            <p>Autores: Dario Huerta Cruz &amp; Elvis Deiwis Pilco Cruz</p>
            <p>Asesoria metodologica: Mag. Noe Bazan</p>
            <p className="text-[#6E828A]">Todos los derechos reservados · OdyssMedic</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
