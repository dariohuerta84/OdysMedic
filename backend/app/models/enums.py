from enum import Enum

class MedicalSpecialty(str, Enum):
    NEUROLOGIA = "neurologia"
    NEFROLOGIA = "nefrologia"
    ENDOCRINOLOGIA = "endocrinologia"
    REUMATOLOGIA = "reumatologia"
    GINECOLOGIA_OBSTETRICIA = "ginecologia_obstetricia"
    OFTALMOLOGIA = "oftalmologia"
    MEDICINA_INTERNA = "medicina_interna"
    PEDIATRIA = "pediatria"
    CIRUGIA_GENERAL = "cirugia_general"
    MEDICINA_FAMILIAR = "medicina_familiar"

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

class EvidenceLevel(str, Enum):
    LEVEL_A = "Level A"
    LEVEL_B = "Level B"
    LEVEL_C = "Level C"
    GRADE_1A = "Grade 1A"
    GRADE_1B = "Grade 1B"
    GRADE_2B = "Grade 2B"
    EXPERT_CONSENSUS = "Expert Consensus"

class ReferenceType(str, Enum):
    GUIDELINE = "guideline"
    TEXTBOOK = "textbook"
    CONSENSUS = "consensus"

class StudentCompetencyLevel(str, Enum):
    DEFICIENTE = "deficiente"
    EN_DESARROLLO = "en_desarrollo"
    COMPETENTE = "competente"
    AVANZADO = "avanzado"

class DeficiencyType(str, Enum):
    CRITICA_SEGURIDAD = "critica_seguridad"
    INTERPRETACION_DATOS = "interpretacion_datos"
    RAZONAMIENTO_DIFERENCIAL = "razonamiento_diferencial"
    MANEJO_TERAPEUTICO = "manejo_terapeutico"

class ExerciseDifficultyTier(str, Enum):
    NIVEL_1_FUNDACIONAL = "nivel_1_fundacional"
    NIVEL_2_INTERMEDIO = "nivel_2_intermedio"
    NIVEL_3_AVANZADO = "nivel_3_avanzado"

