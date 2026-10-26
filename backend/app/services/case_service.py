import json
from typing import Optional
from app.config import settings
from app.models.clinical_case import (
    FullClinicalCase,
    ClinicalCaseSimulation,
    CaseSummary,
    PatientInfo,
    PresentationInfo,
    DiagnosticWorkup,
    EvaluationBlueprint,
    Criterion,
    DoseReference,
    SourceCitation,
    SourcedValue,
)
from app.models.enums import MedicalSpecialty

# Mapeo de normalizacion clinica de los 7 casos hacia las 5 especialidades cardinales
CASE_SPECIALTY_MAP: dict[str, str] = {
    "s13256-019-2334-y": MedicalSpecialty.NEFROLOGIA.value,
    "s13256-022-03392-w": MedicalSpecialty.ENDOCRINOLOGIA.value,
    "s13256-023-04294-1": MedicalSpecialty.NEUROLOGIA.value,
    "s13256-024-04496-1": MedicalSpecialty.OFTALMOLOGIA.value,
    "s13256-025-05577-5": MedicalSpecialty.NEUROLOGIA.value,
    "s13256-025-05650-z": MedicalSpecialty.GINECOLOGIA_OBSTETRICIA.value,
    "s13256-026-05974-4": MedicalSpecialty.REUMATOLOGIA.value,
}

SPECIALTY_INFO: dict[str, dict[str, str]] = {
    MedicalSpecialty.NEUROLOGIA.value: {
        "name": "Neurología",
        "description": "Ictus isquémico y hemorrágico, alteraciones cerebrovasculares y complicaciones neuropsiquiátricas.",
        "icon": "brain",
    },
    MedicalSpecialty.NEFROLOGIA.value: {
        "name": "Nefrología y Medio Interno",
        "description": "Lesión renal aguda, microangiopatía trombótica, trastornos hidroelectrolíticos y diálisis.",
        "icon": "droplet",
    },
    MedicalSpecialty.ENDOCRINOLOGIA.value: {
        "name": "Endocrinología y Metabolismo",
        "description": "Complicaciones glucémicas severas, toxicidad metabólica por fármacos y patología del metabolismo fosfocálcico.",
        "icon": "activity",
    },
    MedicalSpecialty.REUMATOLOGIA.value: {
        "name": "Reumatología e Inmunología",
        "description": "Enfermedades autoinmunes sistémicas, lupus eritematoso sistémico y terapia inmunosupresora intensiva.",
        "icon": "shield",
    },
    MedicalSpecialty.GINECOLOGIA_OBSTETRICIA.value: {
        "name": "Ginecología y Obstetricia",
        "description": "Complicaciones médicas del embarazo, control perinatal de alto riesgo y patologías genético-endocrinas.",
        "icon": "heart",
    },
    MedicalSpecialty.OFTALMOLOGIA.value: {
        "name": "Oftalmología (Interconsulta)",
        "description": "Hipertensión ocular aguda, urgencias del segmento posterior y patología exudativa coroidea.",
        "icon": "eye",
    },
}

class CaseRepository:
    def __init__(self):
        self._cases: dict[str, FullClinicalCase] = {}
        self._load_cases()

    def _parse_source_citation(self, data: Optional[dict]) -> Optional[SourceCitation]:
        if not data:
            return None
        return SourceCitation(
            file=data.get("file"),
            page=data.get("page"),
            evidence=data.get("evidence"),
        )

    def _parse_sourced_value(self, data: Optional[dict]) -> Optional[SourcedValue]:
        if not data:
            return None
        sources = [
            SourceCitation(file=s.get("file"), page=s.get("page"), evidence=s.get("evidence"))
            for s in data.get("sources", [])
        ]
        return SourcedValue(value=data.get("value"), status=data.get("status", "reported"), sources=sources)

    def _load_cases(self):
        file_path = settings.cases_file
        if not file_path.exists():
            return

        with open(file_path, "r", encoding="utf-8") as f:
            raw_cases = json.load(f)

        for raw in raw_cases:
            cid = raw.get("case_id")
            norm_spec = CASE_SPECIALTY_MAP.get(cid, raw.get("specialty", "medicina_interna"))

            # Parse patient
            raw_patient = raw.get("patient", {})
            age_sv = self._parse_sourced_value(raw_patient.get("age"))
            sex_sv = self._parse_sourced_value(raw_patient.get("sex"))
            history_svs = [
                self._parse_sourced_value(h) for h in raw_patient.get("relevant_history", []) if h
            ]
            patient = PatientInfo(
                age=age_sv,
                sex=sex_sv,
                relevant_history=[h for h in history_svs if h is not None],
            )

            # Parse presentation
            raw_pres = raw.get("presentation", {})
            presentation = PresentationInfo(
                chief_complaint=[self._parse_sourced_value(c) for c in raw_pres.get("chief_complaint", []) if c],
                symptoms=[self._parse_sourced_value(s) for s in raw_pres.get("symptoms", []) if s],
                signs=[self._parse_sourced_value(s) for s in raw_pres.get("signs", []) if s],
                vitals=raw_pres.get("vitals", {}),
                physical_exam=[self._parse_sourced_value(p) for p in raw_pres.get("physical_exam", []) if p],
            )

            # Parse diagnostic workup
            raw_dw = raw.get("diagnostic_workup", {})
            workup = DiagnosticWorkup(
                laboratory=raw_dw.get("laboratory", []),
                imaging=raw_dw.get("imaging", []),
                other_tests=raw_dw.get("other_tests", []),
            )

            # Parse evaluation blueprint criteria
            raw_eb = raw.get("evaluation_blueprint", {})
            criteria_list: list[Criterion] = []
            for c_raw in raw_eb.get("criteria", []):
                dose_ref_obj = None
                dr_raw = c_raw.get("dose_reference")
                if dr_raw:
                    dose_ref_obj = DoseReference(
                        drug=dr_raw.get("drug"),
                        drug_aliases=dr_raw.get("drug_aliases", []),
                        value=dr_raw.get("value"),
                        unit=dr_raw.get("unit"),
                        route=dr_raw.get("route"),
                        interval=dr_raw.get("interval"),
                    )

                src_ref = self._parse_source_citation(c_raw.get("source_reference"))
                criteria_list.append(
                    Criterion(
                        criterion_id=c_raw.get("criterion_id", ""),
                        dimension=c_raw.get("dimension", ""),
                        concept=c_raw.get("concept", ""),
                        requirement_type=c_raw.get("requirement_type", "required"),
                        alternative_group=c_raw.get("alternative_group"),
                        weight=float(c_raw.get("weight", 1.0)),
                        criticality=c_raw.get("criticality", "normal"),
                        accepted_answers=c_raw.get("accepted_answers", []),
                        category=c_raw.get("category"),
                        phase=c_raw.get("phase", "initial_treatment"),
                        source_reference=src_ref,
                        review_status="active",
                        dose_reference=dose_ref_obj,
                    )
                )

            blueprint = EvaluationBlueprint(
                review_status=raw_eb.get("review_status"),
                dimensions=raw_eb.get("dimensions", {}),
                criteria=criteria_list,
            )

            full_case = FullClinicalCase(
                case_id=cid,
                specialty=raw.get("specialty", ""),
                normalized_specialty=norm_spec,
                display_title=raw.get("display_title", ""),
                learning_phase=raw.get("learning_phase", "initial_treatment"),
                is_synthetic=raw.get("is_synthetic", False),
                source=raw.get("source", {}),
                patient=patient,
                presentation=presentation,
                diagnostic_workup=workup,
                diagnosis=raw.get("diagnosis", {}),
                timeline=raw.get("timeline", []),
                observed_interventions=raw.get("observed_interventions", []),
                outcomes=raw.get("outcomes", {}),
                source_facts=raw.get("source_facts", {}),
                evaluation_blueprint=blueprint,
            )

            self._cases[cid] = full_case

    def get_all_summaries(self, specialty: Optional[str] = None) -> list[CaseSummary]:
        summaries = []
        for c in self._cases.values():
            if specialty and c.normalized_specialty != specialty:
                continue

            age_str = str(c.patient.age.value) if c.patient.age and c.patient.age.value else None
            sex_str = str(c.patient.sex.value) if c.patient.sex and c.patient.sex.value else None
            cc_str = (
                str(c.presentation.chief_complaint[0].value)
                if c.presentation.chief_complaint and c.presentation.chief_complaint[0].value
                else None
            )

            summaries.append(
                CaseSummary(
                    case_id=c.case_id,
                    specialty=c.specialty,
                    normalized_specialty=c.normalized_specialty,
                    display_title=c.display_title,
                    learning_phase=c.learning_phase,
                    age_display=age_str,
                    sex_display=sex_str,
                    chief_complaint_display=cc_str,
                )
            )
        return summaries

    def get_simulation_vignette(self, case_id: str) -> Optional[ClinicalCaseSimulation]:
        c = self._cases.get(case_id)
        if not c:
            return None
        # Devuelve solo la vineta sanitizada para gameplay clinico
        return ClinicalCaseSimulation(
            case_id=c.case_id,
            display_title=c.display_title,
            specialty=c.specialty,
            normalized_specialty=c.normalized_specialty,
            learning_phase=c.learning_phase,
            patient=c.patient,
            presentation=c.presentation,
            diagnostic_workup=c.diagnostic_workup,
        )

    def get_full_case(self, case_id: str) -> Optional[FullClinicalCase]:
        return self._cases.get(case_id)

    def get_specialties_catalog(self) -> list[dict]:
        counts: dict[str, int] = {}
        for c in self._cases.values():
            counts[c.normalized_specialty] = counts.get(c.normalized_specialty, 0) + 1

        catalog = []
        for spec_id, info in SPECIALTY_INFO.items():
            catalog.append({
                "specialty_id": spec_id,
                "name": info["name"],
                "description": info["description"],
                "icon": info["icon"],
                "cases_count": counts.get(spec_id, 0),
            })
        return catalog

case_repository = CaseRepository()
