/**
 * OdyssMedic TypeScript Domain Interfaces and API Schemas
 * Strictly mirrors FastAPI backend domain models and OCRI engine schemas.
 */

export type CognitiveGapTag =
  | 'GAP_TRIAGE_SEVERITY'
  | 'GAP_DIAGNOSTIC_REASONING'
  | 'GAP_LAB_INTERPRETATION'
  | 'GAP_INITIAL_MANAGEMENT';

export type UserRole = 'student' | 'intern' | 'resident' | 'specialist';

export type PlanTier = 'pilot_free' | 'essential' | 'residentado_pro' | 'free' | 'premium';

export type CompetencyLevel = 'Nivel 1' | 'Nivel 2' | 'Nivel 3';

export type AptitudeStatus = 'apto' | 'en_nivelacion' | 'no_apto';

export type DiagnosticExamMode = 'general' | 'specialty';

export type OnboardingTrack = 'ruta' | 'desde_cero';

export interface User {
  id: number | string;
  email: string;
  full_name: string;
  role?: UserRole;
  plan_tier: PlanTier;
  experience_points?: number;
  streak_days: number;
  current_level?: CompetencyLevel;
  created_at: string;
  university?: string;
  stage?: string;
  target_exam?: string;
  career?: string;
  academic_year?: string;
  primary_goal?: string;
  initial_world?: string;
  interest_areas?: string[];
  onboarding_track?: OnboardingTrack | string;
  privacy_accepted?: boolean;
  xp?: number;
  diagnostic_completed?: boolean;
  diagnostic_score?: number | null;
  aptitude_status?: AptitudeStatus | null;
  aptitude_label?: string | null;
  diagnostic_mode?: DiagnosticExamMode | string | null;
  diagnostic_specialty?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface SpecialtyMastery {
  specialty_id: string;
  specialty_name: string;
  mastery_score: number;
  level: CompetencyLevel;
  cases_completed: number;
  total_cases: number;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_unlocked: boolean;
  case_count: number;
  specialty_id?: string;
  cases_count?: number;
}

export interface VitalSigns {
  bp?: string;
  hr?: number;
  rr?: number;
  spo2?: number;
  temp?: number;
  gcs?: number;
  [key: string]: any;
}

export interface CaseSummary {
  id: string;
  title: string;
  specialty_id: string;
  difficulty_level: string;
  brief?: string;
  tags?: string[];
  case_id?: string;
  specialty?: string;
  normalized_specialty?: string;
  display_title?: string;
  learning_phase?: string;
  age_display?: string;
  sex_display?: string;
  chief_complaint_display?: string;
}

export interface CaseDetail {
  id: string;
  title: string;
  specialty_id: string;
  difficulty_level: string;
  patient_age: number;
  patient_gender: string;
  chief_complaint: string;
  anamnesis: string;
  physical_exam: string;
  vitals: VitalSigns;
  initial_labs?: Record<string, any>;
  tags?: string[];
  case_id?: string;
  display_title?: string;
  normalized_specialty?: string;
  patient?: any;
  presentation?: any;
  diagnostic_workup?: any;
}

export interface MCQOption {
  id: string;
  text: string;
  option_id?: string;
}

export interface MCQStation {
  station_number: number;
  title: string;
  competency_focus: string;
  clinical_question: string;
  options: MCQOption[];
  station_id?: string;
  case_id?: string;
  difficulty_tier?: string;
  clinical_stem?: string;
}

export interface MCQSubmissionRequest {
  case_id: string;
  station_number: number;
  selected_option_id: string;
  time_spent_seconds: number;
  chosen_option_id?: string;
  response_time_ms?: number;
}

export interface MedicalReferenceSummary {
  title: string;
  year: number;
  guideline_source: string;
  pmid_doi: string;
  key_takeaway: string;
}

export interface LevelingPrescription {
  new_level: CompetencyLevel;
  mastery_delta: number;
  spaced_repetition_scheduled: boolean;
  next_review_interval?: 'D7' | 'D21' | null;
  prescription_id?: string;
  student_id?: string;
  specialty?: string;
  mastery_score?: number;
  detected_gap?: CognitiveGapTag | string;
  assigned_deficiency?: string;
  student_level?: string;
  difficulty_tier?: string;
  recommended_exercise_difficulty?: string;
  target_exercise_ids?: string[];
  rationale?: string;
  next_repetition_date?: string | null;
  created_at?: string;
  is_active?: boolean;
}

export interface MCQEvaluationResult {
  is_correct: boolean;
  selected_option_id: string;
  correct_option_id: string;
  xp_earned: number;
  gap_tag?: CognitiveGapTag | null;
  gap_title?: string | null;
  gap_explanation?: string | null;
  clinical_pearl?: string | null;
  medical_reference?: MedicalReferenceSummary | null;
  leveling_prescription?: LevelingPrescription | null;
  points_earned?: number;
  chosen_option_id?: string;
  associated_gap?: CognitiveGapTag | null;
  clinical_feedback?: string;
  citation_evidence?: string;
  recommended_difficulty?: string;
}

export interface SpacedRepetitionItem {
  case_id: string;
  case_title: string;
  specialty_name: string;
  cycle: 'D7' | 'D21';
  scheduled_date: string;
  is_overdue: boolean;
  id?: number;
  gap_type?: string;
  scheduled_for?: string;
  repetition_cycle?: string;
  status?: string;
  created_at?: string;
}

export interface LevelingDashboard {
  user_id: number;
  current_level: CompetencyLevel;
  total_xp: number;
  streak_days: number;
  cognitive_gap_radar: Record<CognitiveGapTag, number>;
  specialty_masteries: SpecialtyMastery[];
  pending_spaced_repetitions: SpacedRepetitionItem[];
  id?: number;
  email?: string;
  full_name?: string;
  university?: string;
  stage?: string;
  target_exam?: string;
  career?: string;
  academic_year?: string;
  primary_goal?: string;
  initial_world?: string;
  interest_areas?: string[];
  onboarding_track?: string;
  plan_tier?: PlanTier;
  xp?: number;
  user?: any;
  specialties?: Record<string, any>;
  specialty_profiles?: Record<string, any>;
  radar?: Array<{
    specialty: string;
    score: number;
    level: string;
    needs_leveling: boolean;
  }>;
  ocri_score?: number;
  global_ocri_score?: number;
  diagnostic_completed?: boolean;
  diagnostic_score?: number | null;
  aptitude_status?: AptitudeStatus | null;
  aptitude_label?: string | null;
  diagnostic_mode?: DiagnosticExamMode | string | null;
  diagnostic_specialty?: string | null;
  pending_repetition_tasks?: any[];
  spaced_repetition_tasks?: any[];
}

export interface MedicalReference {
  id: string;
  specialty_id: string;
  guideline_source: string;
  title: string;
  year: number;
  pmid_doi: string;
  key_takeaway: string;
  reference_id?: string;
  source_title?: string;
  organization_or_publisher?: string;
  edition_or_version?: string;
  section_title?: string;
  page_or_doi?: string;
  key_recommendation?: string;
  evidence_level?: string;
  associated_specialty?: string;
  associated_cases?: string[];
  anamnesis_checklist?: string[];
  physical_exam_signs?: string[];
  diagnostic_cutoffs?: string[];
  red_flags?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole | string;
  university?: string;
  stage?: string;
  target_exam?: string;
  career?: string;
  academic_year?: string;
  primary_goal?: string;
  initial_world?: string;
  interest_areas?: string[];
  onboarding_track?: OnboardingTrack | string;
  privacy_accepted?: boolean;
}

export interface DiagnosticSpecialtyOption {
  id: string;
  label: string;
  description: string;
}

export interface DiagnosticOption {
  id: string;
  text: string;
}

export interface DiagnosticQuestion {
  id: number;
  specialty: string;
  specialty_label: string;
  station_type: string;
  vignette: string;
  vital_signs: Record<string, string>;
  question: string;
  options: DiagnosticOption[];
}

export interface DiagnosticAnswerItem {
  question_id: number;
  selected_option_id: string;
}

export interface DiagnosticSubmissionRequest {
  answers: DiagnosticAnswerItem[];
  mode?: DiagnosticExamMode;
  specialty?: string | null;
}

export interface DiagnosticResultDetail {
  question_id: number;
  specialty: string;
  is_correct: boolean;
  selected_option_id: string;
  detected_gap?: string | null;
  explanation: string;
}

export interface DiagnosticResult {
  success: boolean;
  diagnostic_score: number;
  aptitude_status: AptitudeStatus;
  aptitude_label: string;
  diagnostic_mode?: DiagnosticExamMode | string;
  diagnostic_specialty?: string | null;
  correct_count: number;
  total_questions: number;
  xp_earned: number;
  detected_gaps: string[];
  details: DiagnosticResultDetail[];
}
