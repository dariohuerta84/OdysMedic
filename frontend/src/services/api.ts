import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthToken,
  User,
  Specialty,
  CaseSummary,
  CaseDetail,
  MCQStation,
  MCQSubmissionRequest,
  MCQEvaluationResult,
  LevelingDashboard,
  MedicalReference,
  LevelingPrescription,
  CompetencyLevel,
  CognitiveGapTag,
  SpecialtyMastery,
  SpacedRepetitionItem,
  DiagnosticQuestion,
  DiagnosticResult,
  DiagnosticExamMode,
  DiagnosticSpecialtyOption,
  RegisterRequest,
} from '../types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: inject JWT Bearer token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('odyssmedic_token')
      : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: graceful logging and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('odyssmedic_token');
      }
      console.warn('[OdyssMedic API] Sesion expirada o no autorizada (401).');
    } else if (!error.response) {
      console.error('[OdyssMedic API] Error de red o servidor no disponible:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication and User Profile API
 */
export const authApi = {
  login: async (email: string, password: string): Promise<AuthToken> => {
    try {
      // Primary: JSON payload matching OdyssMedic FastAPI UserLoginRequest
      const response = await api.post<AuthToken>('/auth/login', {
        email,
        password,
      });
      if (response.data?.access_token && typeof window !== 'undefined') {
        localStorage.setItem('odyssmedic_token', response.data.access_token);
      }
      return response.data;
    } catch (err: any) {
      // Fallback: URLSearchParams / FormData for OAuth2PasswordRequestForm compatibility
      if (err.response?.status === 422) {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const response = await api.post<AuthToken>('/auth/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        if (response.data?.access_token && typeof window !== 'undefined') {
          localStorage.setItem('odyssmedic_token', response.data.access_token);
        }
        return response.data;
      }
      throw err;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthToken> => {
    const response = await api.post<AuthToken>('/auth/register', data);
    if (response.data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('odyssmedic_token', response.data.access_token);
    }
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

/**
 * Specialties Catalog API
 */
export const specialtiesApi = {
  getAll: async (): Promise<Specialty[]> => {
    const response = await api.get<any[]>('/specialties');
    return response.data.map((item) => ({
      id: item.specialty_id || item.id,
      specialty_id: item.specialty_id || item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      is_unlocked: item.is_unlocked ?? true,
      case_count: item.cases_count ?? item.case_count ?? 0,
      cases_count: item.cases_count ?? item.case_count ?? 0,
    }));
  },
  getCatalog: async (): Promise<Specialty[]> => {
    return specialtiesApi.getAll();
  },
};

/**
 * Clinical Cases API
 */
export const casesApi = {
  getBySpecialty: async (specialtyId: string): Promise<CaseSummary[]> => {
    const response = await api.get<any[]>(
      `/cases?specialty=${encodeURIComponent(specialtyId)}`
    );
    return response.data.map((c) => ({
      id: c.case_id || c.id,
      case_id: c.case_id || c.id,
      title: c.display_title || c.title,
      display_title: c.display_title || c.title,
      specialty_id:
        c.normalized_specialty || c.specialty || c.specialty_id || specialtyId,
      specialty: c.specialty,
      normalized_specialty: c.normalized_specialty,
      difficulty_level: c.learning_phase || c.difficulty_level || 'Nivel 1',
      brief: c.chief_complaint_display || c.brief,
      chief_complaint_display: c.chief_complaint_display,
      tags: c.tags || [c.specialty],
    }));
  },

  getById: async (caseId: string): Promise<CaseDetail> => {
    const response = await api.get<any>(`/cases/${encodeURIComponent(caseId)}`);
    const data = response.data;

    const ageVal =
      typeof data.patient?.age?.value === 'number'
        ? data.patient.age.value
        : parseInt(String(data.patient?.age?.value || '0'), 10) ||
          data.patient_age ||
          0;

    const genderVal =
      data.patient?.sex?.value || data.patient_gender || 'No especificado';

    const chiefComplaint = Array.isArray(data.presentation?.chief_complaint)
      ? data.presentation.chief_complaint
          .map((c: any) => c.value ?? c)
          .join('. ')
      : data.chief_complaint || '';

    const physicalExam = Array.isArray(data.presentation?.physical_exam)
      ? data.presentation.physical_exam
          .map((p: any) => p.value ?? p)
          .join('. ')
      : data.physical_exam || '';

    const anamnesis = Array.isArray(data.presentation?.symptoms)
      ? data.presentation.symptoms
          .map((s: any) => s.value ?? s)
          .join('. ')
      : data.anamnesis || '';

    const vitals = data.presentation?.vitals || data.vitals || {};

    return {
      id: data.case_id || data.id || caseId,
      case_id: data.case_id || data.id || caseId,
      title: data.display_title || data.title || '',
      display_title: data.display_title || data.title || '',
      specialty_id:
        data.normalized_specialty ||
        data.specialty ||
        data.specialty_id ||
        '',
      difficulty_level:
        data.learning_phase || data.difficulty_level || 'Nivel 1',
      patient_age: ageVal,
      patient_gender: genderVal,
      chief_complaint: chiefComplaint,
      anamnesis: anamnesis,
      physical_exam: physicalExam,
      vitals: vitals,
      initial_labs: data.diagnostic_workup?.laboratory || data.initial_labs,
      tags: data.tags || [data.specialty],
      patient: data.patient,
      presentation: data.presentation,
      diagnostic_workup: data.diagnostic_workup,
    };
  },

  getStations: async (caseId: string): Promise<MCQStation[]> => {
    const response = await api.get<any[]>(
      `/cases/${encodeURIComponent(caseId)}/stations`
    );
    return response.data.map((st) => ({
      station_number: st.station_number,
      title: `Estacion ${st.station_number}: ${st.difficulty_tier || 'Clinica'}`,
      competency_focus: st.difficulty_tier || 'Razonamiento Clinico',
      clinical_question: st.clinical_stem || '',
      options: (st.options || []).map((opt: any) => ({
        id: opt.option_id || opt.id,
        option_id: opt.option_id || opt.id,
        text: opt.text,
      })),
      station_id: st.station_id,
      case_id: st.case_id,
      difficulty_tier: st.difficulty_tier,
      clinical_stem: st.clinical_stem,
    }));
  },
};

/**
 * Retrospective and MCQ Evaluation API
 */
export const evaluationApi = {
  submitMCQ: async (
    data: MCQSubmissionRequest
  ): Promise<MCQEvaluationResult> => {
    const payload = {
      case_id: data.case_id,
      station_number: data.station_number,
      chosen_option_id: data.chosen_option_id || data.selected_option_id,
      response_time_ms:
        data.response_time_ms ??
        Math.round((data.time_spent_seconds || 0) * 1000),
    };

    const response = await api.post<any>('/evaluation/submit-mcq', payload);
    const raw = response.data;

    const mappedPrescription: LevelingPrescription | null =
      raw.leveling_prescription
        ? {
            new_level:
              raw.leveling_prescription.new_level ||
              (raw.leveling_prescription.difficulty_tier ===
              'nivel_3_avanzado'
                ? 'Nivel 3'
                : raw.leveling_prescription.difficulty_tier ===
                    'nivel_2_intermedio'
                  ? 'Nivel 2'
                  : 'Nivel 1'),
            mastery_delta:
              raw.leveling_prescription.mastery_delta ??
              (raw.is_correct ? 5 : -2),
            spaced_repetition_scheduled:
              raw.leveling_prescription.spaced_repetition_scheduled ??
              Boolean(raw.leveling_prescription.next_repetition_date),
            next_review_interval:
              raw.leveling_prescription.next_review_interval || 'D7',
            ...raw.leveling_prescription,
          }
        : null;

    return {
      is_correct: raw.is_correct,
      selected_option_id:
        raw.selected_option_id ||
        raw.chosen_option_id ||
        data.selected_option_id,
      correct_option_id: raw.correct_option_id,
      xp_earned: raw.xp_earned ?? raw.points_earned ?? 0,
      gap_tag: raw.gap_tag || raw.associated_gap || null,
      gap_title:
        raw.gap_title ||
        (raw.associated_gap ? String(raw.associated_gap) : null),
      gap_explanation: raw.gap_explanation || raw.clinical_feedback || null,
      clinical_pearl: raw.clinical_pearl || null,
      medical_reference:
        raw.medical_reference ||
        (raw.citation_evidence
          ? {
              title: raw.citation_evidence,
              year: 2026,
              guideline_source: 'OdyssMedic Clinical Reference',
              pmid_doi: '',
              key_takeaway: raw.clinical_pearl || '',
            }
          : null),
      leveling_prescription: mappedPrescription,
      points_earned: raw.points_earned,
      chosen_option_id: raw.chosen_option_id,
      associated_gap: raw.associated_gap,
      clinical_feedback: raw.clinical_feedback,
      citation_evidence: raw.citation_evidence,
      recommended_difficulty: raw.recommended_difficulty,
    };
  },
};

/**
 * Adaptive Leveling and OCRI Radar API
 */
export const levelingApi = {
  getDashboard: async (): Promise<LevelingDashboard> => {
    const response = await api.get<any>('/leveling/dashboard');
    const d = response.data;

    const radarGaps: Record<CognitiveGapTag, number> = {
      GAP_TRIAGE_SEVERITY: 85,
      GAP_DIAGNOSTIC_REASONING: 78,
      GAP_LAB_INTERPRETATION: 82,
      GAP_INITIAL_MANAGEMENT: 70,
    };

    const specialtyMasteries: SpecialtyMastery[] = [];
    const profiles = d.specialty_profiles || d.specialties || {};
    for (const [key, val] of Object.entries<any>(profiles)) {
      specialtyMasteries.push({
        specialty_id: key,
        specialty_name: key.charAt(0).toUpperCase() + key.slice(1),
        mastery_score: val.score ?? 0,
        level:
          val.level === 'avanzado'
            ? 'Nivel 3'
            : val.level === 'competente'
              ? 'Nivel 2'
              : 'Nivel 1',
        cases_completed: val.attempts ?? 0,
        total_cases: 10,
      });
    }

    const pendingRepetitions: SpacedRepetitionItem[] = (
      d.pending_repetition_tasks ||
      d.spaced_repetition_tasks ||
      []
    ).map((t: any) => ({
      case_id: t.case_id,
      case_title: `Revision: ${t.case_id}`,
      specialty_name: t.gap_type || 'General',
      cycle: t.repetition_cycle || 'D7',
      scheduled_date: t.scheduled_for || new Date().toISOString(),
      is_overdue: t.scheduled_for
        ? new Date(t.scheduled_for) < new Date()
        : false,
      id: t.id,
      gap_type: t.gap_type,
      scheduled_for: t.scheduled_for,
      repetition_cycle: t.repetition_cycle,
      status: t.status,
      created_at: t.created_at,
    }));

    return {
      user_id: d.id || d.user?.id || 1,
      current_level: (d.ocri_score >= 80
        ? 'Nivel 3'
        : d.ocri_score >= 50
          ? 'Nivel 2'
          : 'Nivel 1') as CompetencyLevel,
      total_xp: d.xp ?? d.user?.xp ?? 0,
      streak_days: d.streak_days ?? d.user?.streak_days ?? 0,
      cognitive_gap_radar: radarGaps,
      specialty_masteries: specialtyMasteries,
      pending_spaced_repetitions: pendingRepetitions,
      ...d,
    };
  },

  getDiagnosticSpecialties: async (): Promise<DiagnosticSpecialtyOption[]> => {
    const response = await api.get<DiagnosticSpecialtyOption[]>(
      '/leveling/diagnostic/specialties'
    );
    return response.data;
  },

  getDiagnosticQuestions: async (
    mode: DiagnosticExamMode = 'general',
    specialty?: string | null
  ): Promise<DiagnosticQuestion[]> => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (mode === 'specialty' && specialty) {
      params.set('specialty', specialty);
    }
    const response = await api.get<DiagnosticQuestion[]>(
      `/leveling/diagnostic/questions?${params.toString()}`
    );
    return response.data;
  },

  submitDiagnosticExam: async (
    answers: Array<{ question_id: number; selected_option_id: string }>,
    mode: DiagnosticExamMode = 'general',
    specialty?: string | null
  ): Promise<DiagnosticResult> => {
    const response = await api.post<DiagnosticResult>('/leveling/diagnostic/submit', {
      answers,
      mode,
      specialty: mode === 'specialty' ? specialty || null : null,
    });
    return response.data;
  },
};

/**
 * Medical References and Clinical Guidelines API
 */
export const referencesApi = {
  getByCase: async (caseId: string): Promise<MedicalReference[]> => {
    const response = await api.get<any[]>(
      `/references/by-case/${encodeURIComponent(caseId)}`
    );
    return response.data.map((r) => ({
      id: r.reference_id || String(r.id || ''),
      specialty_id: r.associated_specialty || '',
      guideline_source:
        r.organization_or_publisher || r.source_title || 'Guia Medica',
      title: r.source_title || r.section_title || 'Referencia Clinica',
      year: r.year || 2024,
      pmid_doi: r.page_or_doi || '',
      key_takeaway: r.key_recommendation || '',
      reference_id: r.reference_id,
      source_title: r.source_title,
      organization_or_publisher: r.organization_or_publisher,
      edition_or_version: r.edition_or_version,
      section_title: r.section_title,
      page_or_doi: r.page_or_doi,
      key_recommendation: r.key_recommendation,
      evidence_level: r.evidence_level,
      associated_specialty: r.associated_specialty,
      associated_cases: r.associated_cases,
      anamnesis_checklist: r.anamnesis_checklist || [],
      physical_exam_signs: r.physical_exam_signs || [],
      diagnostic_cutoffs: r.diagnostic_cutoffs || [],
      red_flags: r.red_flags || [],
    }));
  },

  getAll: async (specialtyId?: string): Promise<MedicalReference[]> => {
    const url = `/references${
      specialtyId ? `?specialty=${encodeURIComponent(specialtyId)}` : ''
    }`;
    const response = await api.get<any[]>(url);
    return response.data.map((r) => ({
      id: r.reference_id || String(r.id || ''),
      specialty_id: r.associated_specialty || specialtyId || '',
      guideline_source:
        r.organization_or_publisher || r.source_title || 'Guia Medica',
      title: r.source_title || r.section_title || 'Referencia Clinica',
      year: r.year || 2024,
      pmid_doi: r.page_or_doi || '',
      key_takeaway: r.key_recommendation || '',
      reference_id: r.reference_id,
      source_title: r.source_title,
      organization_or_publisher: r.organization_or_publisher,
      edition_or_version: r.edition_or_version,
      section_title: r.section_title,
      page_or_doi: r.page_or_doi,
      key_recommendation: r.key_recommendation,
      evidence_level: r.evidence_level,
      associated_specialty: r.associated_specialty,
      associated_cases: r.associated_cases,
      anamnesis_checklist: r.anamnesis_checklist || [],
      physical_exam_signs: r.physical_exam_signs || [],
      diagnostic_cutoffs: r.diagnostic_cutoffs || [],
      red_flags: r.red_flags || [],
    }));
  },
};

export default api;
