from enum import Enum

class MedicalSpecialty(str, Enum):
    NEUROLOGIA = "neurologia"
    NEFROLOGIA = "nefrologia"
    ENDOCRINOLOGIA = "endocrinologia"
    REUMATOLOGIA = "reumatologia"
    GINECOLOGIA_OBSTETRICIA = "ginecologia_obstetricia"
    OFTALMOLOGIA = "oftalmologia"

class CognitiveGap(str, Enum):
    GAP_TRIAGE_SEVERITY = "GAP_TRIAGE_SEVERITY"
    GAP_DIAGNOSTIC_REASONING = "GAP_DIAGNOSTIC_REASONING"
    GAP_LAB_INTERPRETATION = "GAP_LAB_INTERPRETATION"
    GAP_INITIAL_MANAGEMENT = "GAP_INITIAL_MANAGEMENT"

class EvaluationDimension(str, Enum):
    DIAGNOSTICO = "diagnostico"
    TRATAMIENTO = "tratamiento"
    DOSIS = "dosis"
    EFECTOS_SECUNDARIOS = "efectos_secundarios"
    INFORMACION_PACIENTE = "informacion_paciente"

class RequirementType(str, Enum):
    REQUIRED = "required"
    RECOMMENDED = "recommended"
    OPTIONAL = "optional"

class CriticalityLevel(str, Enum):
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"
