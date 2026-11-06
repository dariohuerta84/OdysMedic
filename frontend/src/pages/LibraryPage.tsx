import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  Play,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import { referencesApi } from '../services/api';
import type { MedicalReference } from '../types/api';

export interface LibraryPageProps {
  onSelectCase: (caseId: string) => void;
}

interface SpecialtyFilterOption {
  id: string;
  label: string;
}

const SPECIALTY_OPTIONS: SpecialtyFilterOption[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'nefrologia', label: 'Nefrologia' },
  { id: 'endocrinologia', label: 'Endocrinologia' },
  { id: 'neurologia', label: 'Neurologia' },
  { id: 'reumatologia', label: 'Reumatologia' },
  { id: 'ginecologia_obstetricia', label: 'Ginecologia y Obstetricia' },
  { id: 'oftalmologia', label: 'Oftalmologia' },
];

/**
 * High-fidelity offline fallback dataset mirroring canonical medical_references.json
 */
const OFFLINE_REFERENCES: MedicalReference[] = [
  {
    id: 'ref-kdigo-ahus-001',
    reference_id: 'ref-kdigo-ahus-001',
    guideline_source: 'KDIGO 2024',
    title: 'KDIGO 2024 Clinical Practice Guideline for the Management of Acute Kidney Injury and aHUS',
    source_title: 'KDIGO 2024 Clinical Practice Guideline for the Management of Acute Kidney Injury and aHUS',
    organization_or_publisher: 'Kidney Disease: Improving Global Outcomes (KDIGO)',
    year: 2024,
    edition_or_version: '2024 Guideline Update',
    section_title: 'Diagnostic Evaluation and Initial Targeted Therapy of Thrombotic Microangiopathies and aHUS',
    specialty_id: 'nefrologia',
    associated_specialty: 'nefrologia',
    pmid_doi: 'doi:10.1016/j.kisu.2024.01.002',
    page_or_doi: 'doi:10.1016/j.kisu.2024.01.002',
    evidence_level: 'Grade 1A',
    key_takeaway:
      'In patients presenting with microangiopathic hemolytic anemia, severe thrombocytopenia, and acute kidney injury, initiate prompt evaluation for ADAMTS13 activity and complement dysregulation. Prompt initiation of terminal complement C5 inhibition (eculizumab/ravulizumab) is strongly recommended once thrombotic thrombocytopenic purpura (TTP) is excluded.',
    key_recommendation:
      'In patients presenting with microangiopathic hemolytic anemia, severe thrombocytopenia, and acute kidney injury, initiate prompt evaluation for ADAMTS13 activity and complement dysregulation. Prompt initiation of terminal complement C5 inhibition (eculizumab/ravulizumab) is strongly recommended once thrombotic thrombocytopenic purpura (TTP) is excluded.',
    associated_cases: ['s13256-019-2334-y', 'case-nefro-001'],
  },
  {
    id: 'ref-kdigo-aki-002',
    reference_id: 'ref-kdigo-aki-002',
    guideline_source: 'KDIGO 2024',
    title: 'KDIGO 2024 Clinical Practice Guideline for the Management of Acute Kidney Injury and aHUS',
    source_title: 'KDIGO 2024 Clinical Practice Guideline for the Management of Acute Kidney Injury and aHUS',
    organization_or_publisher: 'Kidney Disease: Improving Global Outcomes (KDIGO)',
    year: 2024,
    edition_or_version: '2024 Guideline Update',
    section_title: 'Drug-Associated Acute Kidney Injury and Nephrotoxicity Management',
    specialty_id: 'nefrologia',
    associated_specialty: 'nefrologia',
    pmid_doi: 'doi:10.1016/j.kisu.2024.01.003',
    page_or_doi: 'doi:10.1016/j.kisu.2024.01.003',
    evidence_level: 'Grade 1B',
    key_takeaway:
      'Discontinue potential nephrotoxic and renally cleared metabolic stressors immediately upon recognition of acute kidney injury or severe metabolic decompensation.',
    key_recommendation:
      'Discontinue potential nephrotoxic and renally cleared metabolic stressors immediately upon recognition of acute kidney injury or severe metabolic decompensation.',
    associated_cases: ['s13256-022-03392-w', 'case-nefro-001'],
  },
  {
    id: 'ref-ada-hyperglycemia-001',
    reference_id: 'ref-ada-hyperglycemia-001',
    guideline_source: 'ADA 2024',
    title: 'ADA Standards of Care in Diabetes 2024',
    source_title: 'ADA Standards of Care in Diabetes 2024',
    organization_or_publisher: 'American Diabetes Association',
    year: 2024,
    edition_or_version: 'Standards of Care 2024',
    section_title: 'Hospital Care, Secondary Diabetes, and Drug-Induced Severe Hyperglycemia',
    specialty_id: 'endocrinologia',
    associated_specialty: 'endocrinologia',
    pmid_doi: 'doi:10.2337/dc24-S016',
    page_or_doi: 'doi:10.2337/dc24-S016',
    evidence_level: 'Grade A',
    key_takeaway:
      'Patients receiving oncologic chemotherapy (such as capecitabine or checkpoint inhibitors) who develop acute symptomatic hyperglycemia and severe electrolyte derangements (hypokalemia, hypomagnesemia) require temporary drug suspension, continuous intravenous insulin titration, and vigorous potassium repletion prior to resumption.',
    key_recommendation:
      'Patients receiving oncologic chemotherapy (such as capecitabine or checkpoint inhibitors) who develop acute symptomatic hyperglycemia and severe electrolyte derangements (hypokalemia, hypomagnesemia) require temporary drug suspension, continuous intravenous insulin titration, and vigorous potassium repletion prior to resumption.',
    associated_cases: ['s13256-022-03392-w', 'case-endo-002'],
  },
  {
    id: 'ref-aha-pba-001',
    reference_id: 'ref-aha-pba-001',
    guideline_source: 'AHA/ASA 2023',
    title: 'AHA/ASA Guidelines for the Management of Stroke and Pseudobulbar Affect 2023',
    source_title: 'AHA/ASA Guidelines for the Management of Stroke and Pseudobulbar Affect 2023',
    organization_or_publisher: 'American Heart Association / American Stroke Association',
    year: 2023,
    edition_or_version: '2023 Stroke Rehabilitation Guidelines',
    section_title: 'Post-Stroke Emotional Incontinence and Pseudobulbar Affect (PBA)',
    specialty_id: 'neurologia',
    associated_specialty: 'neurologia',
    pmid_doi: 'doi:10.1161/STR.0000000000000438',
    page_or_doi: 'doi:10.1161/STR.0000000000000438',
    evidence_level: 'Class I, Level A',
    key_takeaway:
      'Pseudobulbar affect (PBA) characterized by involuntary, uncontrollable crying or laughing disproportionate to mood after pontine, cerebellar, or hemispheric stroke should be differentiated from post-stroke depression. Treatment with dextromethorphan/quinidine or selective serotonin reuptake inhibitors (SSRIs) such as citalopram/sertraline is recommended to alleviate affective lability and improve quality of life.',
    key_recommendation:
      'Pseudobulbar affect (PBA) characterized by involuntary, uncontrollable crying or laughing disproportionate to mood after pontine, cerebellar, or hemispheric stroke should be differentiated from post-stroke depression. Treatment with dextromethorphan/quinidine or selective serotonin reuptake inhibitors (SSRIs) such as citalopram/sertraline is recommended to alleviate affective lability and improve quality of life.',
    associated_cases: ['s13256-023-04294-1', 's13256-025-05577-5', 'case-neuro-003'],
  },
  {
    id: 'ref-aha-stroke-rehab-002',
    reference_id: 'ref-aha-stroke-rehab-002',
    guideline_source: 'AHA/ASA 2023',
    title: 'AHA/ASA Guidelines for the Management of Stroke and Pseudobulbar Affect 2023',
    source_title: 'AHA/ASA Guidelines for the Management of Stroke and Pseudobulbar Affect 2023',
    organization_or_publisher: 'American Heart Association / American Stroke Association',
    year: 2023,
    edition_or_version: '2023 Stroke Rehabilitation Guidelines',
    section_title: 'Long-term Motor and Cognitive Rehabilitation Following Hemorrhagic Stroke',
    specialty_id: 'neurologia',
    associated_specialty: 'neurologia',
    pmid_doi: 'doi:10.1161/STR.0000000000000439',
    page_or_doi: 'doi:10.1161/STR.0000000000000439',
    evidence_level: 'Class I, Level B',
    key_takeaway:
      'Long-term motor recovery and spasticity management post-hemorrhagic stroke requires multi-disciplinary physical rehabilitation, blood pressure optimization (target < 130/80 mmHg), neurocognitive training, and structured functional assessment.',
    key_recommendation:
      'Long-term motor recovery and spasticity management post-hemorrhagic stroke requires multi-disciplinary physical rehabilitation, blood pressure optimization (target < 130/80 mmHg), neurocognitive training, and structured functional assessment.',
    associated_cases: ['s13256-025-05577-5', 'case-neuro-003'],
  },
  {
    id: 'ref-eular-npsle-001',
    reference_id: 'ref-eular-npsle-001',
    guideline_source: 'EULAR 2023',
    title: 'EULAR/ACR 2023 Recommendations for the Management of Neuropsychiatric Systemic Lupus Erythematosus',
    source_title: 'EULAR/ACR 2023 Recommendations for the Management of Neuropsychiatric Systemic Lupus Erythematosus',
    organization_or_publisher: 'EULAR / ACR Taskforce',
    year: 2023,
    edition_or_version: '2023 Recommendations Update',
    section_title: 'Diagnosis and Treatment of Inflammatory and Thrombotic Central NPSLE',
    specialty_id: 'reumatologia',
    associated_specialty: 'reumatologia',
    pmid_doi: 'doi:10.1136/annrheumdis-2023-224762',
    page_or_doi: 'doi:10.1136/annrheumdis-2023-224762',
    evidence_level: 'Grade 1A',
    key_takeaway:
      'In young patients presenting with acute motor/speech deficits, dysarthria, and systemic autoimmune signs, prompt neuroimaging and lumbar puncture are mandatory to rule out central infections and ischemia. For inflammatory NPSLE, aggressive pulsed intravenous methylprednisolone followed by high-potency immunosuppression (intravenous cyclophosphamide or rituximab) combined with hydroxychloroquine is recommended.',
    key_recommendation:
      'In young patients presenting with acute motor/speech deficits, dysarthria, and systemic autoimmune signs, prompt neuroimaging and lumbar puncture are mandatory to rule out central infections and ischemia. For inflammatory NPSLE, aggressive pulsed intravenous methylprednisolone followed by high-potency immunosuppression (intravenous cyclophosphamide or rituximab) combined with hydroxychloroquine is recommended.',
    associated_cases: ['s13256-026-05974-4'],
  },
  {
    id: 'ref-acog-hypopara-001',
    reference_id: 'ref-acog-hypopara-001',
    guideline_source: 'ACOG / Endocrine Society 2023',
    title: 'Endocrine Society / ACOG Guidelines for Hypoparathyroidism in Pregnancy',
    source_title: 'Endocrine Society / ACOG Guidelines for Hypoparathyroidism in Pregnancy',
    organization_or_publisher: 'Endocrine Society & ACOG',
    year: 2023,
    edition_or_version: 'Clinical Practice Guideline',
    section_title: 'Third Trimester Maternal and Fetal Calcium Regulation in 22q11.2 Microdeletion / Primary Hypoparathyroidism',
    specialty_id: 'ginecologia_obstetricia',
    associated_specialty: 'ginecologia_obstetricia',
    pmid_doi: 'doi:10.1210/clinem/dgad261',
    page_or_doi: 'doi:10.1210/clinem/dgad261',
    evidence_level: 'Level B',
    key_takeaway:
      'In pregnant patients with primary hypoparathyroidism (including 22q11.2 deletion syndrome), maintain maternal albumin-corrected calcium in the low-to-normal range (8.5-9.0 mg/dL) using oral calcium carbonate and active vitamin D (calcitriol). Avoid maternal hypercalcemia to prevent fetal parathyroid suppression and neonatal tetany, and closely monitor urinary calcium excretion.',
    key_recommendation:
      'In pregnant patients with primary hypoparathyroidism (including 22q11.2 deletion syndrome), maintain maternal albumin-corrected calcium in the low-to-normal range (8.5-9.0 mg/dL) using oral calcium carbonate and active vitamin D (calcitriol). Avoid maternal hypercalcemia to prevent fetal parathyroid suppression and neonatal tetany, and closely monitor urinary calcium excretion.',
    associated_cases: ['s13256-025-05650-z'],
  },
  {
    id: 'ref-aao-uveal-001',
    reference_id: 'ref-aao-uveal-001',
    guideline_source: 'AAO 2024',
    title: 'AAO Preferred Practice Pattern for Uveal Diseases',
    source_title: 'AAO Preferred Practice Pattern for Uveal Diseases',
    organization_or_publisher: 'American Academy of Ophthalmology',
    year: 2024,
    edition_or_version: '2024 Guidelines',
    section_title: 'Management of Idiopathic Uveal Effusion Syndrome and Secondary Ocular Hypertension',
    specialty_id: 'oftalmologia',
    associated_specialty: 'oftalmologia',
    pmid_doi: 'doi:10.1016/j.ophtha.2023.11.014',
    page_or_doi: 'doi:10.1016/j.ophtha.2023.11.014',
    evidence_level: 'Level IIb',
    key_takeaway:
      'Uveal effusion syndrome (UES) must be differentiated from angle-closure glaucoma and Vogt-Koyanagi-Harada disease using B-scan ultrasonography, ultrasound biomicroscopy (UBM), and optical coherence tomography (OCT). Primary medical management includes topical hypotensive agents and high-dose systemic/topical corticosteroids, with surgical scleral decompression or sclerectomy reserved for refractory exudative retinal detachment.',
    key_recommendation:
      'Uveal effusion syndrome (UES) must be differentiated from angle-closure glaucoma and Vogt-Koyanagi-Harada disease using B-scan ultrasonography, ultrasound biomicroscopy (UBM), and optical coherence tomography (OCT). Primary medical management includes topical hypotensive agents and high-dose systemic/topical corticosteroids, with surgical scleral decompression or sclerectomy reserved for refractory exudative retinal detachment.',
    associated_cases: ['s13256-024-04496-1'],
  },
  {
    id: 'ref-figo-gtn-001',
    reference_id: 'ref-figo-gtn-001',
    guideline_source: 'FIGO 2024',
    title: 'FIGO 2024 Guidelines for the Diagnosis and Management of Gestational Trophoblastic Disease',
    source_title: 'FIGO 2024 Guidelines for the Diagnosis and Management of Gestational Trophoblastic Disease',
    organization_or_publisher: 'International Federation of Gynecology and Obstetrics (FIGO)',
    year: 2024,
    edition_or_version: '2024 Guideline Update',
    section_title: 'Metastatic Gestational Trophoblastic Neoplasia and Pulmonary Choriocarcinoma',
    specialty_id: 'ginecologia_obstetricia',
    associated_specialty: 'ginecologia_obstetricia',
    pmid_doi: 'doi:10.1002/ijgo.15280',
    page_or_doi: 'doi:10.1002/ijgo.15280',
    evidence_level: 'Level 1A',
    key_takeaway:
      'In women with abnormal vaginal bleeding, hemoptysis, and pulmonary nodules following a molar or non-molar pregnancy, elevated quantitative serum beta-hCG confirms the diagnosis of metastatic choriocarcinoma without requiring biopsy, which is contraindicated due to severe bleeding risk. Prompt FIGO/WHO prognostic scoring determines whether single-agent (methotrexate) or multi-agent (EMA-CO) chemotherapy is indicated.',
    key_recommendation:
      'In women with abnormal vaginal bleeding, hemoptysis, and pulmonary nodules following a molar or non-molar pregnancy, elevated quantitative serum beta-hCG confirms the diagnosis of metastatic choriocarcinoma without requiring biopsy, which is contraindicated due to severe bleeding risk. Prompt FIGO/WHO prognostic scoring determines whether single-agent (methotrexate) or multi-agent (EMA-CO) chemotherapy is indicated.',
    associated_cases: ['s13256-024-04987-9'],
  },
];

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
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(clean)}`;
}

function getSpecialtyBadgeStyle(specialtyId?: string): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  const norm = (specialtyId || '').toLowerCase().replace('-', '_');
  if (norm.includes('nefro')) {
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      label: 'Nefrologia',
    };
  }
  if (norm.includes('endo')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      label: 'Endocrinologia',
    };
  }
  if (norm.includes('neuro')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      label: 'Neurologia',
    };
  }
  if (norm.includes('reuma')) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      label: 'Reumatologia',
    };
  }
  if (norm.includes('gineco') || norm.includes('obstet')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      label: 'Ginecologia y Obstetricia',
    };
  }
  if (norm.includes('oftalmo')) {
    return {
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-200',
      label: 'Oftalmologia',
    };
  }
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-200',
    label: specialtyId || 'Clinica Medica',
  };
}

function getFallbackCaseForSpecialty(specialtyId?: string): string {
  const norm = (specialtyId || '').toLowerCase();
  if (norm.includes('nefro')) return 's13256-019-2334-y';
  if (norm.includes('endo')) return 's13256-022-03392-w';
  if (norm.includes('neuro')) return 's13256-023-04294-1';
  if (norm.includes('reuma')) return 's13256-026-05974-4';
  if (norm.includes('gineco')) return 's13256-025-05650-z';
  if (norm.includes('oftalmo')) return 's13256-024-04496-1';
  return 's13256-019-2334-y';
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ onSelectCase }) => {
  const [references, setReferences] = useState<MedicalReference[]>(OFFLINE_REFERENCES);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('todas');

  // Load references from API with offline fallback
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const data = await referencesApi.getAll();
        if (isMounted) {
          if (data && data.length > 0) {
            setReferences(data);
            setIsOfflineFallback(false);
          } else {
            setReferences(OFFLINE_REFERENCES);
            setIsOfflineFallback(true);
          }
        }
      } catch (err) {
        console.warn('[LibraryPage] API no disponible, usando repositorio local offline.', err);
        if (isMounted) {
          setReferences(OFFLINE_REFERENCES);
          setIsOfflineFallback(true);
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

  // Filter references by specialty and live search query
  const filteredReferences = useMemo(() => {
    return references.filter((item) => {
      // 1. Specialty filter
      if (selectedSpecialty !== 'todas') {
        const itemSpec = (item.associated_specialty || item.specialty_id || '').toLowerCase();
        const normSelected = selectedSpecialty.toLowerCase();
        if (!itemSpec.includes(normSelected) && !normSelected.includes(itemSpec)) {
          return false;
        }
      }

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const titleMatch = (item.title || item.source_title || '').toLowerCase().includes(q);
      const sectionMatch = (item.section_title || '').toLowerCase().includes(q);
      const sourceMatch = (item.guideline_source || item.organization_or_publisher || '').toLowerCase().includes(q);
      const yearMatch = String(item.year || '').includes(q);
      const takeawayMatch = (item.key_takeaway || item.key_recommendation || '').toLowerCase().includes(q);
      const doiMatch = (item.pmid_doi || item.page_or_doi || '').toLowerCase().includes(q);

      return titleMatch || sectionMatch || sourceMatch || yearMatch || takeawayMatch || doiMatch;
    });
  }, [references, selectedSpecialty, searchQuery]);

  const handleTrainCase = (ref: MedicalReference) => {
    const candidateCase =
      (ref.associated_cases && ref.associated_cases.length > 0 && ref.associated_cases[0]) ||
      getFallbackCaseForSpecialty(ref.associated_specialty || ref.specialty_id);
    onSelectCase(candidateCase);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header and Context Banner */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                Evidencia Indexada UPCH 2026
              </span>
              {isOfflineFallback && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-300">
                  Modo Offline Local
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-sky-600" />
              <span>Biblioteca de Guias Clinicas Internacionales</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
              Evidencia medica canonica (KDIGO, ADA, AHA/ASA, EULAR, FIGO, AAO) con recomendaciones
              terapeuticas graduadas para fundamentar cada decision durante la guardia de emergencia.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-right shadow-xs">
              <span className="block text-[10px] font-mono uppercase text-slate-500 font-semibold">
                Total Guias
              </span>
              <span className="text-lg font-bold font-mono text-sky-700">
                {references.length}
              </span>
            </div>
          </div>
        </div>

        {/* Specialty Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1 mr-1" />
          {SPECIALTY_OPTIONS.map((opt) => {
            const isSelected = selectedSpecialty === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedSpecialty(opt.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-xs'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por titulo, palabra clave, fuente (KDIGO, ADA, AHA), seccion o ano..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
              aria-label="Limpiar busqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Counter and Indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1">
          <span>
            Mostrando {filteredReferences.length} de {references.length} guias registradas
          </span>
          {searchQuery && (
            <span className="text-sky-700 font-semibold">
              Filtro activo: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
      </div>

      {/* Grid of Clinical Guideline Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-6 bg-slate-100 rounded w-4/5" />
              <div className="h-16 bg-slate-50 rounded" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredReferences.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">
            No se encontraron guias clinicas
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            No hay referencias que coincidan con &quot;{searchQuery}&quot; en la especialidad seleccionada.
            Intenta con otros terminos o restablece los filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('todas');
            }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Filtros</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReferences.map((ref) => {
            const specialtyBadge = getSpecialtyBadgeStyle(
              ref.associated_specialty || ref.specialty_id
            );
            const citationUrl = resolveCitationUrl(
              ref.pmid_doi || ref.page_or_doi,
              ref.title || ref.source_title
            );
            const takeaway = ref.key_takeaway || ref.key_recommendation || '';
            const title = ref.title || ref.source_title || 'Guia de Practica Clinica';
            const source = ref.guideline_source || ref.organization_or_publisher || 'Evidencia Internacional';
            const doi = ref.pmid_doi || ref.page_or_doi || '';

            return (
              <article
                key={ref.id || ref.reference_id}
                className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all hover:shadow-md group shadow-xs"
              >
                <div className="space-y-4">
                  {/* Top Badges: Source, Year, Specialty */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      {source}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${specialtyBadge.bg} ${specialtyBadge.text} ${specialtyBadge.border}`}
                      >
                        {specialtyBadge.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{ref.year}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Section */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                      {title}
                    </h2>
                    {ref.section_title && (
                      <p className="mt-1 text-xs text-slate-500 font-mono flex items-center gap-1.5">
                        <Layers className="w-3 h-3 shrink-0 text-sky-600" />
                        <span className="truncate">{ref.section_title}</span>
                      </p>
                    )}
                  </div>

                  {/* Evidence Level Badge */}
                  {ref.evidence_level && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-[10px] font-mono font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Nivel de Evidencia: {ref.evidence_level}</span>
                    </div>
                  )}

                  {/* Key Clinical Recommendation Takeaway */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-sky-800">
                      <Sparkles className="w-3 h-3 text-sky-600" />
                      <span>Recomendacion Terapeutica Clave</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-5">
                      {takeaway}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {doi ? (
                      <a
                        href={citationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-700 hover:text-sky-900 hover:underline truncate max-w-[200px]"
                        title={doi}
                      >
                        <span className="truncate">{doi}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <a
                        href={citationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-sky-700 hover:underline"
                      >
                        <span>PubMed / DOI</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    )}

                    {ref.edition_or_version && (
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                        {ref.edition_or_version}
                      </span>
                    )}
                  </div>

                  {/* Entrenar Caso Basado en esta Guia Button */}
                  <button
                    type="button"
                    onClick={() => handleTrainCase(ref)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold tracking-wide transition-all active:scale-[0.98] shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
                    <span>Entrenar Caso Basado en esta Guia</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
