import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  BookOpen,
  ExternalLink,
  RefreshCw,
  X,
  Lock,
  ClipboardList,
  Stethoscope,
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { referencesApi } from '../services/api';
import type { MedicalReference } from '../types/api';
import fallbackBooks from '../data/medical_references_fallback.json';

export interface LibraryPageProps {
  onSelectCase: (caseId: string) => void;
  onRequireAuth?: () => void;
}

interface SpecialtyFilterOption {
  id: string;
  label: string;
}

const SPECIALTY_OPTIONS: SpecialtyFilterOption[] = [
  { id: 'todas', label: 'Todas las especialidades' },
  { id: 'medicina_interna', label: 'Medicina Interna' },
  { id: 'nefrologia', label: 'Nefrologia' },
  { id: 'endocrinologia', label: 'Endocrinologia' },
  { id: 'neurologia', label: 'Neurologia' },
  { id: 'reumatologia', label: 'Reumatologia' },
  { id: 'ginecologia_obstetricia', label: 'Gineco-Obstetricia' },
  { id: 'pediatria', label: 'Pediatria' },
  { id: 'cirugia_general', label: 'Cirugia General' },
  { id: 'oftalmologia', label: 'Oftalmologia' },
];

const SPECIALTY_LABELS: Record<string, string> = {
  medicina_interna: 'Medicina Interna',
  nefrologia: 'Nefrologia',
  endocrinologia: 'Endocrinologia',
  neurologia: 'Neurologia',
  reumatologia: 'Reumatologia',
  ginecologia_obstetricia: 'Ginecologia y Obstetricia',
  ginecologia: 'Ginecologia y Obstetricia',
  pediatria: 'Pediatria',
  cirugia_general: 'Cirugia General',
  oftalmologia: 'Oftalmologia',
};

function normalizeSpecialtyKey(raw?: string): string {
  const clean = (raw || '').trim().toLowerCase().replace(/-/g, '_');
  if (clean === 'ginecologia') return 'ginecologia_obstetricia';
  if (clean === 'cirugia') return 'cirugia_general';
  return clean;
}

function buildOfflineReferences(): MedicalReference[] {
  const list: MedicalReference[] = [];
  const books = Array.isArray(fallbackBooks) ? fallbackBooks : [];
  for (const b of books as any[]) {
    const excerpts = Array.isArray(b.excerpts) ? b.excerpts : [];
    for (const e of excerpts) {
      list.push({
        id: e.reference_id || b.book_id,
        reference_id: e.reference_id,
        specialty_id: e.associated_specialty || b.specialty || '',
        associated_specialty: e.associated_specialty || b.specialty || '',
        guideline_source: e.organization_or_publisher || b.authors_or_organization || 'Fuente Clinica',
        organization_or_publisher: e.organization_or_publisher || b.authors_or_organization || '',
        title: e.source_title || b.title || 'Guia de Practica Clinica',
        source_title: e.source_title || b.title || '',
        year: Number(e.year || 2024),
        edition_or_version: e.edition_or_version || b.edition || '',
        section_title: e.section_title || '',
        pmid_doi: e.page_or_doi || b.isbn_or_doi || '',
        page_or_doi: e.page_or_doi || b.isbn_or_doi || '',
        evidence_level: e.evidence_level || '',
        key_takeaway: e.key_recommendation || '',
        key_recommendation: e.key_recommendation || '',
        associated_cases: Array.isArray(e.associated_cases) ? e.associated_cases : [],
        anamnesis_checklist: Array.isArray(e.anamnesis_checklist) ? e.anamnesis_checklist : [],
        physical_exam_signs: Array.isArray(e.physical_exam_signs) ? e.physical_exam_signs : [],
        diagnostic_cutoffs: Array.isArray(e.diagnostic_cutoffs) ? e.diagnostic_cutoffs : [],
        red_flags: Array.isArray(e.red_flags) ? e.red_flags : [],
      });
    }
  }
  return list;
}

const OFFLINE_REFERENCES: MedicalReference[] = buildOfflineReferences();

function resolveCitationUrl(refId?: string, title?: string): string {
  if (!refId && !title) return 'https://pubmed.ncbi.nlm.nih.gov/';
  if (!refId) {
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title || '')}`;
  }
  const clean = refId.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.toLowerCase().startsWith('doi:') || clean.startsWith('10.')) {
    const doi = clean.replace(/^doi:\s*/i, '');
    return `https://doi.org/${doi}`;
  }
  const pmidMatch = clean.match(/PMID:?\s*(\d+)/i) || clean.match(/^(\d+)$/);
  if (pmidMatch) {
    return `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`;
  }
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title || clean)}`;
}

function getFallbackCaseForSpecialty(specialtyId?: string): string {
  const norm = normalizeSpecialtyKey(specialtyId);
  if (norm === 'nefrologia') return 'case-nefro-001';
  if (norm === 'endocrinologia') return 'case-endo-002';
  if (norm === 'neurologia') return 'case-neuro-003';
  if (norm === 'reumatologia') return 's13256-026-05974-4';
  if (norm === 'ginecologia_obstetricia') return 's13256-025-05650-z';
  if (norm === 'oftalmologia') return 's13256-024-04496-1';
  return 'case-nefro-001';
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectCase,
  onRequireAuth,
}) => {
  const { isAuthenticated } = useAuth();
  const [references, setReferences] = useState<MedicalReference[]>(OFFLINE_REFERENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('todas');
  const [activeSheetRef, setActiveSheetRef] = useState<MedicalReference | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const data = await referencesApi.getAll();
        if (isMounted) {
          if (data && data.length > 0) {
            setReferences(data);
          } else {
            setReferences(OFFLINE_REFERENCES);
          }
        }
      } catch {
        if (isMounted) {
          setReferences(OFFLINE_REFERENCES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeSheetRef) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveSheetRef(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeSheetRef]);

  const countsBySpecialty = useMemo(() => {
    const counts: Record<string, number> = { todas: references.length };
    for (const item of references) {
      const key = normalizeSpecialtyKey(item.associated_specialty || item.specialty_id);
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  }, [references]);

  const filteredReferences = useMemo(() => {
    return references.filter((item) => {
      if (selectedSpecialty !== 'todas') {
        const itemSpec = normalizeSpecialtyKey(item.associated_specialty || item.specialty_id);
        const normSelected = normalizeSpecialtyKey(selectedSpecialty);
        if (itemSpec !== normSelected) {
          return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const haystack = [
        item.title,
        item.source_title,
        item.section_title,
        item.guideline_source,
        item.organization_or_publisher,
        String(item.year || ''),
        item.key_takeaway,
        item.key_recommendation,
        ...(item.anamnesis_checklist || []),
        ...(item.physical_exam_signs || []),
        ...(item.diagnostic_cutoffs || []),
        ...(item.red_flags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [references, selectedSpecialty, searchQuery]);

  const handleExamAction = (ref: MedicalReference) => {
    if (!isAuthenticated) {
      setActiveSheetRef(null);
      onRequireAuth?.();
      return;
    }

    const candidateCase =
      (ref.associated_cases && ref.associated_cases.length > 0 && ref.associated_cases[0]) ||
      getFallbackCaseForSpecialty(ref.associated_specialty || ref.specialty_id);
    setActiveSheetRef(null);
    onSelectCase(candidateCase);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header (Natural classic typography, zero boxy badges) */}
      <header className="space-y-6 border-b border-[#E2ECE9] pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0E6F65]">
              Compendio bibliografico y semiologico
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B252E] leading-tight">
              Biblioteca Clinica y Recoleccion de Datos
            </h1>
            <p className="text-sm sm:text-base text-[#4A5D64] leading-relaxed">
              Consulta guias internacionales y tratados de referencia organizados por especialidad.
              Cada fuente integra listas estructuradas de anamnesis dirigida, hallazgos del examen
              fisico, puntos de corte diagnosticos y signos de alarma para la practica clinica.
            </p>
          </div>

          <div className="flex items-baseline gap-6 text-left lg:text-right shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#EDF2F0]">
            <div>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-[#6B7D83]">
                Fuentes indexadas
              </span>
              <span className="font-serif text-3xl font-semibold text-[#0B252E]">
                {references.length}
              </span>
            </div>
            <div className="h-8 w-px bg-[#DCE5E3]" />
            <div>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-[#6B7D83]">
                Especialidades
              </span>
              <span className="font-serif text-3xl font-semibold text-[#0E6F65]">
                9
              </span>
            </div>
          </div>
        </div>

        {/* Unauthenticated Gate Notice: Reading allowed, Exams strictly require registration */}
        {!isAuthenticated && (
          <div className="p-4 sm:px-6 rounded-2xl bg-[#ECF6F4]/85 border border-[#CFE7E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#0B252E] leading-relaxed">
                <strong className="font-semibold">Lectura abierta, evaluacion protegida:</strong>{' '}
                puedes revisar libremente todas las fuentes y fichas de recoleccion de datos
                clinicos. Para rendir examenes o evaluar casos clinicos se requiere iniciar sesion
                o registrarse.
              </p>
            </div>
            {onRequireAuth && (
              <button
                type="button"
                onClick={onRequireAuth}
                className="shrink-0 px-5 py-2 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs font-medium transition-colors"
              >
                Registrarme para evaluar
              </button>
            )}
          </div>
        )}

        {/* Specialty Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {SPECIALTY_OPTIONS.map((opt) => {
            const isSelected = selectedSpecialty === opt.id;
            const count = countsBySpecialty[opt.id] ?? 0;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedSpecialty(opt.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#0E6F65] text-white shadow-2xs'
                    : 'bg-white text-[#4A5D64] hover:text-[#0B252E] hover:bg-[#F2F7F6] border border-[#DCE5E3]'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`ml-1.5 text-[11px] ${
                    isSelected ? 'text-white/80' : 'text-[#6B7D83]'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B7D83]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por patologia, signo semiologico, anamnesis, punto de corte o tratado (Harrison, KDIGO, Williams, Sabiston, Nelson)..."
              className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-[#DCE5E3] text-xs sm:text-sm text-[#0B252E] placeholder-[#8A9BA1] focus:outline-none focus:border-[#0E6F65] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B7D83] hover:text-[#0B252E]"
                aria-label="Limpiar busqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <span className="text-xs text-[#6B7D83] shrink-0">
            Mostrando {filteredReferences.length} de {references.length} fuentes clinicas
          </span>
        </div>
      </header>

      {/* Grid of Sources & Data-Collection Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-[#DCE5E3] space-y-4"
            >
              <div className="h-3 bg-[#F2F7F6] rounded w-1/3" />
              <div className="h-6 bg-[#F2F7F6] rounded w-4/5" />
              <div className="h-24 bg-[#F7FAF9] rounded-2xl" />
              <div className="h-10 bg-[#F2F7F6] rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : filteredReferences.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#DCE5E3] space-y-3">
          <BookOpen className="w-9 h-9 text-[#6B7D83] mx-auto" />
          <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
            No se encontraron fuentes para esta busqueda
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5D64] max-w-md mx-auto">
            Prueba con otro termino semiologico o restablece el filtro de especialidad.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('todas');
            }}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-full bg-[#ECF6F4] text-[#0E6F65] hover:bg-[#DFEFEA] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Ver todas las fuentes</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReferences.map((ref) => {
            const specKey = normalizeSpecialtyKey(ref.associated_specialty || ref.specialty_id);
            const specLabel = SPECIALTY_LABELS[specKey] || ref.associated_specialty || 'Clinica Medica';
            const citationUrl = resolveCitationUrl(
              ref.pmid_doi || ref.page_or_doi,
              ref.title || ref.source_title
            );
            const takeaway = ref.key_takeaway || ref.key_recommendation || '';
            const title = ref.title || ref.source_title || 'Guia de Practica Clinica';
            const publisher =
              ref.organization_or_publisher || ref.guideline_source || 'Consenso Internacional';

            const anamnesisList = ref.anamnesis_checklist || [];
            const examSignsList = ref.physical_exam_signs || [];
            const cutoffsList = ref.diagnostic_cutoffs || [];
            const redFlagsList = ref.red_flags || [];

            return (
              <article
                key={ref.id || ref.reference_id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-[#DCE5E3] hover:border-[#A9CEC7] transition-all"
              >
                <div className="space-y-4">
                  {/* Natural Classic Editorial Meta Line (No harsh rectangles) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7D83]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="uppercase tracking-[0.15em] font-semibold text-[#0E6F65]">
                        {specLabel}
                      </span>
                      <span>·</span>
                      <span>{ref.year}</span>
                      {ref.evidence_level && (
                        <>
                          <span>·</span>
                          <span className="text-[#4A5D64]">
                            Evidencia {ref.evidence_level}
                          </span>
                        </>
                      )}
                    </div>

                    <a
                      href={citationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#0E6F65] hover:underline"
                    >
                      <span>Fuente externa</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Book / Guideline Title & Section */}
                  <div className="space-y-1">
                    <p className="text-xs text-[#6B7D83]">{publisher}</p>
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#0B252E] leading-snug">
                      {title}
                    </h2>
                    {ref.section_title && (
                      <p className="text-xs sm:text-sm font-medium text-[#344850]">
                        Capitulo / Seccion: {ref.section_title}
                      </p>
                    )}
                  </div>

                  {/* Key Recommendation Quote */}
                  <div className="border-l-2 border-[#0E6F65] pl-4 py-1 space-y-1">
                    <span className="text-[11px] uppercase tracking-[0.13em] font-semibold text-[#0E6F65] block">
                      Directriz clinica central
                    </span>
                    <p className="text-xs sm:text-sm text-[#344850] leading-relaxed">
                      {takeaway}
                    </p>
                  </div>

                  {/* Structured Data Collection Preview */}
                  <div className="p-4 rounded-2xl bg-[#F7FAF9] border border-[#E7EEEC] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0B252E] flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-[#0E6F65]" />
                        <span>Protocolo de recoleccion de datos</span>
                      </span>
                      <span className="text-[11px] text-[#6B7D83]">
                        {anamnesisList.length +
                          examSignsList.length +
                          cutoffsList.length +
                          redFlagsList.length}{' '}
                        criterios clinicos
                      </span>
                    </div>

                    {anamnesisList.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-[#4A5D64]">
                          Anamnesis dirigida esencial:
                        </p>
                        <ul className="space-y-1 text-xs text-[#344850]">
                          {anamnesisList.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0E6F65] mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {cutoffsList.length > 0 && (
                      <div className="pt-2 border-t border-[#E2ECE9] space-y-1">
                        <p className="text-[11px] font-semibold text-[#4A5D64]">
                          Punto de corte clave:
                        </p>
                        <p className="text-xs text-[#0B252E] leading-relaxed">
                          {cutoffsList[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Open Full Data Collection Sheet + Protected Exam Action */}
                <div className="pt-5 mt-5 border-t border-[#EDF2F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveSheetRef(ref)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#ECF6F4] hover:bg-[#DFEFEA] text-[#0E6F65] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver ficha de recoleccion completa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExamAction(ref)}
                    className={`flex-1 py-2.5 px-4 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                      isAuthenticated
                        ? 'bg-[#0E6F65] hover:bg-[#0A564E] text-white'
                        : 'bg-white border border-[#DCE5E3] hover:border-[#0E6F65] text-[#4A5D64] hover:text-[#0E6F65]'
                    }`}
                    title={
                      isAuthenticated
                        ? 'Evaluar razonamiento en estacion clinica vinculada'
                        : 'El acceso a examenes requiere registro previo'
                    }
                  >
                    {isAuthenticated ? (
                      <>
                        <span>Evaluar estacion vinculada</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Registrarse para evaluar</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Clinical Data Collection Sheet Modal (via createPortal) */}
      {activeSheetRef &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-sheet-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveSheetRef(null);
              }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-[#0B252E]/55 backdrop-blur-[2px]"
          >
            <div className="relative w-full max-w-3xl max-h-[88dvh] flex flex-col overflow-hidden rounded-3xl bg-[#FDFCFA] border border-[#DCE5E3] shadow-2xl text-left animate-scale-in">
              {/* Pinned Header */}
              <header className="shrink-0 px-6 py-5 border-b border-[#E2ECE9] bg-white flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7D83]">
                    <span className="uppercase tracking-[0.15em] font-semibold text-[#0E6F65]">
                      {SPECIALTY_LABELS[
                        normalizeSpecialtyKey(
                          activeSheetRef.associated_specialty || activeSheetRef.specialty_id
                        )
                      ] || 'Especialidad Clinica'}
                    </span>
                    <span>·</span>
                    <span>{activeSheetRef.year}</span>
                    {activeSheetRef.edition_or_version && (
                      <>
                        <span>·</span>
                        <span>{activeSheetRef.edition_or_version}</span>
                      </>
                    )}
                  </div>
                  <h2
                    id="library-sheet-title"
                    className="font-serif text-xl sm:text-2xl font-semibold text-[#0B252E] leading-snug"
                  >
                    {activeSheetRef.title || activeSheetRef.source_title}
                  </h2>
                  {activeSheetRef.section_title && (
                    <p className="text-xs sm:text-sm text-[#4A5D64]">
                      {activeSheetRef.section_title}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSheetRef(null)}
                  aria-label="Cerrar ficha clinica"
                  className="shrink-0 p-2 rounded-full bg-[#F2F7F6] hover:bg-[#E4EEEC] text-[#4A5D64] hover:text-[#0B252E] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </header>

              {/* Scrollable Body with the 4 Pillars of Clinical Data Collection */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Key Recommendation */}
                <section className="p-4 sm:p-5 rounded-2xl bg-[#ECF6F4]/70 border border-[#CFE7E2] space-y-1.5">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0E6F65] block">
                    Sintesis terapeutica y diagnostica ({activeSheetRef.evidence_level || 'Consenso'})
                  </span>
                  <p className="text-xs sm:text-sm text-[#0B252E] leading-relaxed">
                    {activeSheetRef.key_recommendation || activeSheetRef.key_takeaway}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Anamnesis Dirigida */}
                  <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECE9] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#0E6F65]">
                      <ClipboardList className="w-4 h-4 shrink-0" />
                      <span>1. Anamnesis dirigida (Datos a recolectar)</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#344850]">
                      {(activeSheetRef.anamnesis_checklist || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* 2. Signos de Examen Fisico */}
                  <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2ECE9] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#0E6F65]">
                      <Stethoscope className="w-4 h-4 shrink-0" />
                      <span>2. Examen fisico dirigido</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#344850]">
                      {(activeSheetRef.physical_exam_signs || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0E6F65] shrink-0 mt-2" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* 3. Puntos de Corte y Escalas */}
                  <section className="p-4 sm:p-5 rounded-2xl bg-[#FDF7E7]/65 border border-[#EFE0B9] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#8A6116]">
                      <Activity className="w-4 h-4 shrink-0" />
                      <span>3. Puntos de corte y criterios auxiliares</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#344850]">
                      {(activeSheetRef.diagnostic_cutoffs || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A6116] shrink-0 mt-2" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* 4. Signos de Alarma */}
                  <section className="p-4 sm:p-5 rounded-2xl bg-[#FBF1F1]/75 border border-[#EED7D7] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#9E3F42]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>4. Signos de alarma y derivacion critica</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#344850]">
                      {(activeSheetRef.red_flags || []).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9E3F42] shrink-0 mt-2" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>

              {/* Pinned Sticky Footer */}
              <footer className="shrink-0 px-6 py-4 border-t border-[#E2ECE9] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={resolveCitationUrl(
                    activeSheetRef.pmid_doi || activeSheetRef.page_or_doi,
                    activeSheetRef.title || activeSheetRef.source_title
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#0E6F65] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>
                    Referencia: {activeSheetRef.page_or_doi || activeSheetRef.pmid_doi || 'PubMed'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveSheetRef(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-[#DCE5E3] text-xs font-medium text-[#4A5D64] hover:bg-[#F2F7F6] transition-colors"
                  >
                    Cerrar ficha
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExamAction(activeSheetRef)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    {isAuthenticated ? (
                      <>
                        <span>Practicar estacion vinculada</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Registrarme para rendir evaluacion</span>
                      </>
                    )}
                  </button>
                </div>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default LibraryPage;
