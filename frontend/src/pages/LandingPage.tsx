import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Lock,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { ScrollParticlesBackdrop } from '../components/common/ScrollParticlesBackdrop';

export interface LandingPageProps {
  onStartRoute: () => void;
  onOpenLibrary: () => void;
}

const PROGRESSIVE_PATH_PREVIEW = [
  {
    code: '01.1',
    title: 'Triaje y reconocimiento hemodinamico',
    tier: 'Nivel 1 · Fundacional',
    status: 'completed' as const,
    metric: 'h = 11.2d · p = 94%',
  },
  {
    code: '01.2',
    title: 'Lectura de microangiopatia y creatinina KDIGO',
    tier: 'Nivel 2 · Intermedio',
    status: 'active' as const,
    metric: 'Goldilocks 78% · En curso',
  },
  {
    code: '01.3',
    title: 'Conducta inicial y soporte renal de urgencia',
    tier: 'Nivel 3 · Avanzado',
    status: 'locked' as const,
    metric: 'Desbloquea tras 01.2',
  },
  {
    code: '01.4',
    title: 'Guardia Integradora · Sello de Unidad',
    tier: 'Consolidacion HLR',
    status: 'locked' as const,
    metric: 'Requiere estaciones 1–3',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRoute,
  onOpenLibrary,
}) => {
  const [selectedComparison, setSelectedComparison] = useState<'tiempo' | 'retencion' | 'causa'>('tiempo');

  const clinicalWorldsOverview = [
    {
      index: '01',
      title: 'Nefrologia y Medio Interno',
      subtitle: 'Injuria renal aguda KDIGO, microangiopatia trombotica (SHUa) y trastornos electroliticos.',
      sources: 'KDIGO 2024 · Brenner & Rector · ERA 2024',
    },
    {
      index: '02',
      title: 'Endocrinologia y Metabolismo',
      subtitle: 'Crisis hiperglucemicas, hipokalemia inducida por farmacos, tormenta tiroidea y crisis adrenal.',
      sources: 'ADA 2024–2025 · ATA 2023 · Endocrine Society',
    },
    {
      index: '03',
      title: 'Neurologia y Reumatologia',
      subtitle: 'Codigo ictus, afecto pseudobulbar, estado epileptico, lupus neuropsiquiatrico y vasculitis.',
      sources: 'AHA/ASA · AES/ESETT · EULAR/ACR 2024',
    },
    {
      index: '04',
      title: 'Gineco-Obstetricia, Pediatria y Cirugia',
      subtitle: 'Claves obstetricas, hipoparatiroidismo gestacional, rehidratacion OMS/MINSA y abdomen agudo.',
      sources: 'ACOG · FIGO 2024 · TG18 · WSES · ATLS 10.a Ed.',
    },
  ];

  const testimonials = [
    {
      quote:
        'En lugar de resolver cientos de preguntas al azar despues del turno, aqui veo en cinco minutos si mi fallo estuvo en el triaje o en interpretar el frotis.',
      author: 'Valeria M.',
      role: 'Interna de Medicina Humana',
    },
    {
      quote:
        'Desbloquear la unidad estacion por estacion obliga a razonar como en guardia: primero estabilizar, luego pedir el examen preciso y recien indicar el esquema.',
      author: 'Rodrigo C.',
      role: 'Estudiante de 6to ano · Preparacion ENAM',
    },
    {
      quote:
        'Las fichas de recoleccion semiologica de la Biblioteca resumen exactamente que preguntar en anamnesis y que signos de alarma vigilar en el pase de visita.',
      author: 'Andrea L.',
      role: 'Medica Serumista',
    },
  ];

  return (
    <div className="relative bg-[#FAF9F6] text-[#0D1F26] overflow-x-clip">
      <ScrollParticlesBackdrop />

      {/* ===================================================================== */}
      {/* 1. EDITORIAL HERO + PROGRESSIVE PATH LEDGER PREVIEW                   */}
      {/* ===================================================================== */}
      <section className="relative z-10 border-b border-[#DEDBD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* Left Column: High-Contrast Editorial Anchor */}
            <div className="lg:col-span-6 space-y-7">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#0E6F65]" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E6F65]">
                  Motor Clinico OCRI-HLR · Evidencia Indexada
                </p>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] text-[#0D1F26]">
                Razonamiento clinico progresivo, calibrado al ritmo de tu guardia.
              </h1>

              <p className="text-base text-[#3D525A] leading-relaxed max-w-[60ch]">
                OdyssMedic diagnostica la causa cognitiva de cada fallo clinico y organiza tu
                preparacion en unidades secuenciales con vida media de memoria personalizada
                (Half-Life Regression) y casos arbitrados reales.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={onStartRoute}
                  className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-[#0E6F65] hover:bg-[#0A564E] text-[#FAF9F6] font-medium text-sm sm:text-base transition-colors"
                >
                  <span>Iniciar ruta clinica</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-[#F3F1EC] text-[#0D1F26] border border-[#DEDBD2] hover:border-[#0D1F26]/40 font-medium text-sm sm:text-base transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#0E6F65]" />
                  <span>Consultar Biblioteca</span>
                </button>
              </div>

              {/* Editorial Telemetry Strip (Unboxed 1px Hairlines) */}
              <div className="pt-8 border-t border-[#DEDBD2] grid grid-cols-3 gap-6">
                <div>
                  <span className="telemetry-mono text-xl sm:text-2xl font-semibold text-[#0D1F26] block">
                    57
                  </span>
                  <span className="text-xs text-[#64767E] leading-snug block mt-1">
                    Fuentes verificadas con DOI/ISBN
                  </span>
                </div>
                <div className="border-l border-[#DEDBD2] pl-5">
                  <span className="telemetry-mono text-xl sm:text-2xl font-semibold text-[#0E6F65] block">
                    5 × 4
                  </span>
                  <span className="text-xs text-[#64767E] leading-snug block mt-1">
                    Unidades y estaciones desbloqueables
                  </span>
                </div>
                <div className="border-l border-[#DEDBD2] pl-5">
                  <span className="telemetry-mono text-xl sm:text-2xl font-semibold text-[#0D1F26] block">
                    &lt; 5 min
                  </span>
                  <span className="text-xs text-[#64767E] leading-snug block mt-1">
                    Por estacion clinica con perla guiada
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Non-Interactive Editorial Specimen of the Progressive Path */}
            <div className="lg:col-span-6 bg-[#F3F1EC]/75 border border-[#DEDBD2] p-6 sm:p-8 space-y-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-[#DEDBD2] pb-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#64767E]">
                    Unidad 01 · Muestra de Ruta Progresiva
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0D1F26] mt-1">
                    Nefrologia y Medio Interno
                  </h2>
                </div>
                <div className="text-right telemetry-mono">
                  <span className="text-xs text-[#0E6F65] font-semibold block">p = 84%</span>
                  <span className="text-[11px] text-[#64767E] block">h = 9.4 dias</span>
                </div>
              </div>

              {/* Vertical Clinical Spine Preview */}
              <div className="relative pl-7 space-y-5">
                <div
                  className="absolute left-[11px] top-3 bottom-3 w-px bg-[#DEDBD2]"
                  aria-hidden="true"
                />
                {PROGRESSIVE_PATH_PREVIEW.map((node) => (
                  <div
                    key={node.code}
                    className="relative flex items-start justify-between gap-4 pb-4 border-b border-[#DEDBD2]/70 last:border-b-0 last:pb-0"
                  >
                    {/* Node Marker on Spine */}
                    <span
                      aria-hidden="true"
                      className={`absolute -left-7 top-0.5 w-6 h-6 flex items-center justify-center border ${
                        node.status === 'completed'
                          ? 'bg-[#0E6F65] border-[#0E6F65] text-[#FAF9F6]'
                          : node.status === 'active'
                            ? 'bg-[#FAF9F6] border-2 border-[#0E6F65] text-[#0E6F65]'
                            : 'bg-[#FAF9F6] border-[#DEDBD2] text-[#64767E]'
                      }`}
                    >
                      {node.status === 'completed' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : node.status === 'active' ? (
                        <Activity className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </span>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="telemetry-mono text-xs text-[#64767E]">{node.code}</span>
                        <span className="text-sm font-semibold text-[#0D1F26]">{node.title}</span>
                      </div>
                      <p className="text-xs text-[#64767E]">{node.tier}</p>
                    </div>

                    <span
                      className={`telemetry-mono text-[11px] shrink-0 ${
                        node.status === 'completed'
                          ? 'text-[#0E6F65]'
                          : node.status === 'active'
                            ? 'text-[#0D1F26] font-semibold'
                            : 'text-[#64767E]'
                      }`}
                    >
                      {node.metric}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#DEDBD2] text-xs text-[#3D525A]">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0E6F65]" />
                  <span>Registrate para calibrar tu radar OCRI y desbloquear tu ruta</span>
                </span>
                <button
                  type="button"
                  onClick={onStartRoute}
                  className="font-mono text-xs font-semibold text-[#0E6F65] hover:text-[#0A564E] shrink-0"
                >
                  Calibrar &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-24">
        {/* ===================================================================== */}
        {/* 2. METODO OCRI-HLR: ASYMMETRIC EDITORIAL CONTRAST                     */}
        {/* ===================================================================== */}
        <section id="quienes-somos" className="space-y-14 scroll-mt-24 scroll-editorial-reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-[#DEDBD2] pb-8">
            <div className="lg:col-span-7 space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E6F65]">
                01 · Fundamentacion Clinica y Cognitiva
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1F26] leading-tight">
                Formacion medica rigurosa cuando el tiempo en guardia es tu recurso mas escaso
              </h2>
            </div>
            <p className="lg:col-span-5 text-sm sm:text-base text-[#3D525A] leading-relaxed">
              Combinamos la regresion de vida media de memoria (Settles &amp; Meeder, ACL 2016),
              dificultad adaptativa IRT y la taxonomia de errores diagnosticos (Croskerry) para
              reemplazar bancos memoristicos pasivos por practica deliberada breve.
            </p>
          </div>

          {/* Contrast Ledger Row 1 */}
          <div id="como-funciona" className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#DEDBD2] border-b border-[#DEDBD2] scroll-mt-24">
            <div className="pb-8 lg:pb-10 lg:pr-10 space-y-5 scroll-editorial-left">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#A6262E]">
                  Realidad hospitalaria
                </span>
                <span className="font-serif text-2xl font-bold text-[#A6262E] telemetry-mono">
                  36h turno
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0D1F26] leading-snug">
                Guardias extensas que vuelven insostenible el estudio lineal
              </h3>
              <p className="text-sm text-[#3D525A] leading-relaxed">
                Tras pase de visita, evoluciones y emergencias nocturnas, abrir bloques pasivos de
                cuatro horas diluye la retencion y no corrige el sesgo de cierre prematuro.
              </p>
              <div className="grid grid-cols-4 border-t border-b border-[#DEDBD2] divide-x divide-[#DEDBD2] text-center py-3">
                {[
                  { hour: '08:00', task: 'Pase' },
                  { hour: '14:00', task: 'Evolucion' },
                  { hour: '22:00', task: 'Guardia' },
                  { hour: '06:00', task: 'Entrega' },
                ].map((slot) => (
                  <div key={slot.hour} className="px-2">
                    <span className="telemetry-mono text-xs font-semibold text-[#A6262E] block">
                      {slot.hour}
                    </span>
                    <span className="text-[11px] text-[#64767E]">{slot.task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 lg:pt-0 lg:pl-10 pb-8 lg:pb-10 space-y-5 scroll-editorial-right">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#0E6F65]">
                  Motor OCRI-HLR
                </span>
                <span className="font-serif text-2xl font-bold text-[#0E6F65] telemetry-mono">
                  p = 2^(-Δ/h)
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0D1F26] leading-snug">
                Estaciones progresivas en tu zona optima de reto
              </h3>
              <p className="text-sm text-[#3D525A] leading-relaxed">
                Cada respuesta actualiza la vida media <span className="telemetry-mono">h</span> de
                tu memoria por especialidad, ajusta el nivel hacia el 78% de exito esperado y agenda
                rescates antes de que olvides el criterio clinico.
              </p>
              <div className="grid grid-cols-3 border-t border-b border-[#DEDBD2] divide-x divide-[#DEDBD2] py-3 telemetry-mono text-xs">
                <div className="pr-3">
                  <span className="text-[#A6262E] font-semibold block">PA 85/55</span>
                  <span className="font-sans text-[11px] text-[#64767E]">Triaje critico</span>
                </div>
                <div className="px-3">
                  <span className="text-[#9A6B1F] font-semibold block">LDH ↑ · Plt 28k</span>
                  <span className="font-sans text-[11px] text-[#64767E]">Laboratorio</span>
                </div>
                <div className="pl-3">
                  <span className="text-[#0E6F65] font-semibold block">D7 / D21 + HLR</span>
                  <span className="font-sans text-[11px] text-[#64767E]">Consolidacion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Comparison Switcher (Editorial Flat Tabs) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DEDBD2] pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#64767E]">
                  Comparativa directa
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0D1F26] mt-0.5">
                  Como cambia tu preparacion diaria
                </h3>
              </div>

              <div className="flex items-center gap-6 text-sm">
                {[
                  { id: 'tiempo' as const, label: 'Tiempo' },
                  { id: 'retencion' as const, label: 'Retencion HLR' },
                  { id: 'causa' as const, label: 'Lectura del error' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedComparison(item.id)}
                    className={`pb-2 border-b-2 transition-colors ${
                      selectedComparison === item.id
                        ? 'border-[#0E6F65] text-[#0D1F26] font-semibold'
                        : 'border-transparent text-[#64767E] hover:text-[#0D1F26]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              key={selectedComparison}
              className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#DEDBD2] bg-[#F3F1EC]/60 border border-[#DEDBD2] animate-fade-in"
            >
              <div className="p-6 sm:p-8 space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A6262E] block">
                  Estudio tradicional fragmentado
                </span>
                <p className="font-serif text-2xl font-bold text-[#0D1F26]">
                  {selectedComparison === 'tiempo'
                    ? 'Bloques rigidos de 3 a 4 horas'
                    : selectedComparison === 'retencion'
                      ? 'Caida brusca en 48 horas sin repaso'
                      : 'Puntaje binario sin causa raiz'}
                </p>
                <p className="text-sm text-[#3D525A] leading-relaxed">
                  {selectedComparison === 'tiempo'
                    ? 'Incompatible con turnos hospitalarios 7x7 y rotaciones clinicas intensivas.'
                    : selectedComparison === 'retencion'
                      ? 'La lectura pasiva sin evocacion activa diluye dosis y criterios de gravedad.'
                      : 'No separa si fallaste en triaje, lectura gasometrica, diagnostico diferencial o terapia.'}
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0E6F65] block">
                  Ruta progresiva OdyssMedic
                </span>
                <p className="font-serif text-2xl font-bold text-[#0E6F65]">
                  {selectedComparison === 'tiempo'
                    ? 'Estaciones de 3 a 5 minutos'
                    : selectedComparison === 'retencion'
                      ? 'Vida media dinamica HLR + ciclos D7/D21'
                      : 'Diagnostico exacto en 4 brechas OCRI'}
                </p>
                <p className="text-sm text-[#3D525A] leading-relaxed">
                  {selectedComparison === 'tiempo'
                    ? 'Desbloqueo gradual desde movil o laptop en pausas reales del hospital.'
                    : selectedComparison === 'retencion'
                      ? 'Calcula probabilidad de recuerdo por unidad y prioriza rescates antes del olvido.'
                      : 'Entrega una perla clinica accionable respaldada por guias KDIGO, ADA, AHA y EULAR.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. UNIDADES CLINICAS LEDGER                                           */}
        {/* ===================================================================== */}
        <section id="mundos-clinicos" className="space-y-10 scroll-mt-24 scroll-editorial-reveal">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DEDBD2] pb-6">
            <div className="space-y-2 max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E6F65]">
                02 · Estructura Curricular
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1F26]">
                Unidades clinicas que se reordenan segun tus brechas reales
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenLibrary}
              className="self-start md:self-auto inline-flex items-center gap-2 text-sm font-medium text-[#0E6F65] hover:text-[#0A564E] underline underline-offset-4 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar 27 guias en Biblioteca abierta</span>
            </button>
          </div>

          <div className="divide-y divide-[#DEDBD2] border-b border-[#DEDBD2]">
            {clinicalWorldsOverview.map((world) => (
              <div
                key={world.index}
                className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-baseline hover:bg-[#F3F1EC]/50 transition-colors px-2 -mx-2"
              >
                <span className="md:col-span-1 telemetry-mono text-xs text-[#64767E]">
                  {world.index}
                </span>
                <h3 className="md:col-span-3 font-serif text-xl font-bold text-[#0D1F26]">
                  {world.title}
                </h3>
                <p className="md:col-span-5 text-sm text-[#3D525A] leading-relaxed">
                  {world.subtitle}
                </p>
                <div className="md:col-span-3 md:text-right space-y-1.5">
                  <p className="font-mono text-[11px] text-[#64767E]">{world.sources}</p>
                  <button
                    type="button"
                    onClick={onStartRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E6F65] hover:text-[#0A564E]"
                  >
                    <span>Desbloquear unidad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. VOCES DE LA COMUNIDAD                                              */}
        {/* ===================================================================== */}
        <section id="testimonios" className="space-y-10 scroll-mt-24 scroll-editorial-reveal">
          <div className="border-b border-[#DEDBD2] pb-5 space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E6F65]">
              03 · Experiencia en Rotacion
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1F26]">
              Claridad clinica en cada etapa de la carrera
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DEDBD2]">
            {testimonials.map((t) => (
              <blockquote
                key={t.author}
                className="py-6 md:py-2 md:px-7 first:md:pl-0 last:md:pr-0 flex flex-col justify-between space-y-6"
              >
                <p className="font-serif italic text-lg text-[#0D1F26] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="pt-4 border-t border-[#DEDBD2]/70">
                  <span className="block text-sm font-semibold text-[#0D1F26]">{t.author}</span>
                  <span className="block font-mono text-[11px] text-[#64767E] mt-0.5">{t.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. FINAL EDITORIAL CTA                                                */}
        {/* ===================================================================== */}
        <section className="border-t-2 border-b border-[#0D1F26] py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center scroll-editorial-reveal">
          <div className="lg:col-span-7 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E6F65]">
              Calibracion inicial en menos de 3 minutos
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1F26] leading-tight">
              Construye seguridad clinica antes de tu proximo examen o guardia
            </h2>
            <p className="text-sm sm:text-base text-[#3D525A] leading-relaxed max-w-[58ch]">
              Crea tu cuenta con persistencia de progreso, rinde la calibracion general o focalizada
              y sigue tu ruta progresiva respaldada por 57 referencias cientificas.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:justify-end gap-3.5">
            <button
              type="button"
              onClick={onStartRoute}
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#0E6F65] hover:bg-[#0A564E] text-[#FAF9F6] font-medium text-sm sm:text-base transition-colors"
            >
              <span>Empieza tu ruta</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#DEDBD2] hover:border-[#0D1F26] text-[#0D1F26] font-medium text-sm sm:text-base transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#0E6F65]" />
              <span>Biblioteca abierta</span>
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 6. EDITORIAL FOOTER                                                   */}
        {/* ===================================================================== */}
        <footer className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#3D525A]">
          <div className="space-y-2">
            <span className="font-serif text-lg font-bold text-[#0D1F26] block">OdyssMedic</span>
            <p className="leading-relaxed text-[#64767E]">
              Entrenamiento clinico adaptativo, taxonomia OCRI de 4 brechas cognitivas, memoria
              Half-Life Regression y consulta bibliografica estructurada para estudiantes de medicina.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0D1F26] block">
              Arquitectura Academica
            </span>
            <ul className="space-y-1.5 text-[#64767E]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0E6F65]" />
                <span>Calibracion diagnostica general o por especialidad</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0E6F65]" />
                <span>Repeticion espaciada HLR + ciclos D7 y D21</span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#0E6F65]" />
                <span>57 referencias cientificas verificadas con DOI/ISBN</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0D1F26] block">
              Equipo y Desarrollo
            </span>
            <p className="text-[#3D525A]">Dario Huerta Cruz &amp; Elvis Deiwis Pilco Cruz</p>
            <p className="text-[#64767E]">Asesoria metodologica: Mag. Noe Bazan</p>
            <p className="font-mono text-[11px] text-[#64767E]">OdyssMedic · UPCH 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
