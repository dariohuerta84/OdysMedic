"""Canonical Bank of 5 High-Yield Clinical MCQs for Baseline Diagnostic Assessment.
Evaluates the 4 Cognitive Gaps and Core Specialties for Internado / ENIM-EsSalud.
"""

from typing import List, Dict, Any

DIAGNOSTIC_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "specialty": "medicina_interna",
        "specialty_label": "Medicina Interna / Emergencias",
        "station_type": "Triaje y Priorización",
        "target_gap": "GAP_TRIAGE_PRIORITIZATION",
        "vignette": "Varón de 68 años acude a Emergencias con dolor retroesternal opresivo de 30 minutos de evolución, irradiado a mandíbula y diaforesis profusa. Al ingreso se encuentra pálido, frío y con livideces en rodillas.",
        "vital_signs": {
            "pa": "82/48 mmHg",
            "fc": "118 lpm",
            "fr": "26 rpm",
            "sato2": "90%",
            "temp": "36.2 °C"
        },
        "question": "Con base en los parámetros hemodinámicos y clínicos de shock cardiogénico incipiente, ¿cuál es la conducta prioritaria inmediata?",
        "options": [
            {
                "id": "a",
                "text": "Administrar bolo intravenoso rápido de 2000 mL de Cloruro de Sodio al 0.9% para restituir volumen.",
                "is_correct": False,
                "detected_gap": "GAP_THERAPEUTIC_MANAGEMENT",
                "explanation": "En sospecha de shock cardiogénico por infarto, la sobrecarga hídrica desmedida precipita edema agudo de pulmón y fallo ventricular catastrófico."
            },
            {
                "id": "b",
                "text": "Monitorización continua, oxigenoterapia para SatO2 >92%, acceso venoso, EKG de 12 derivadas inmediato e inicio cauteloso de soporte vasopresor/inotrópico.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "Priorización correcta: soporte hemodinámico, confirmación electrocardiográfica y activación de código infarto sin sobrecargar el ventrículo izquierdo claudicante."
            },
            {
                "id": "c",
                "text": "Indicar analgesia con morfina subcutánea y solicitar radiografía de tórax diferida en camilla.",
                "is_correct": False,
                "detected_gap": "GAP_TRIAGE_PRIORITIZATION",
                "explanation": "Retrasar el EKG y el soporte hemodinámico ante hipotensión severa por tramitar estudios complementarios no urgentes infringe la prioridad de triaje vital."
            },
            {
                "id": "d",
                "text": "Iniciar inmediatamente trombolisis con tenecteplase sin requerir trazo electrocardiográfico previo.",
                "is_correct": False,
                "detected_gap": "GAP_DIAGNOSTIC_REASONING",
                "explanation": "La fibrinólisis requiere confirmación categórica de elevación del segmento ST; administrarla a ciegas expone al paciente a hemorragias letales (e.g. disección aórtica)."
            }
        ]
    },
    {
        "id": 2,
        "specialty": "medicina_interna",
        "specialty_label": "Neumología / Medicina Interna",
        "station_type": "Razonamiento Diagnóstico",
        "target_gap": "GAP_DIAGNOSTIC_REASONING",
        "vignette": "Mujer de 32 años presenta disnea de esfuerzo progresiva de 2 meses de evolución, tos seca persistente, febrícula vespertina y nódulos eritematosos dolorosos en ambas caras anteriores de las piernas (eritema nodoso). Radiografía de tórax revela adenopatías hiliares bilaterales y mediastínicas simétricas sin infiltrados parenquimatosos (Estadio I).",
        "vital_signs": {
            "pa": "115/75 mmHg",
            "fc": "78 lpm",
            "fr": "18 rpm",
            "sato2": "97%",
            "temp": "37.4 °C"
        },
        "question": "¿Cuál es la hipótesis diagnóstica integradora de primera línea (Síndrome de Löfgren) y la conducta diagnóstica recomendada?",
        "options": [
            {
                "id": "a",
                "text": "Sarcoidosis aguda (Síndrome de Löfgren); pronóstico habitualmente benigno y resolución espontánea en la mayoría de casos.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "La tríada de eritema nodoso, adenopatías hiliares bilaterales simétricas y artralgias/artritis conforma el Síndrome de Löfgren, manifestación aguda y benigna de sarcoidosis con remisión >80%."
            },
            {
                "id": "b",
                "text": "Tuberculosis pulmonar multirresistente primaria; inicio urgente de esquema de segunda línea sin confirmación baciloscópica.",
                "is_correct": False,
                "detected_gap": "GAP_DIAGNOSTIC_REASONING",
                "explanation": "Las adenopatías hiliares de la TBC primaria suelen ser unilaterales y asimétricas, y el eritema nodoso no justifica iniciar fármacos de segunda línea sin evidencia microbiológica."
            },
            {
                "id": "c",
                "text": "Linfoma de Hodgkin esclerosis nodular; indicación perentoria de radioterapia mediastínica inmediata.",
                "is_correct": False,
                "detected_gap": "GAP_DIAGNOSTIC_REASONING",
                "explanation": "El linfoma mediastínico suele cursar con masa asimétrica mediastínica anterior y síntomas B severos; no se inicia tratamiento oncológico sin biopsia histológica formal."
            },
            {
                "id": "d",
                "text": "Cáncer microcítico de pulmón metastásico; realizar lobectomía exploratoria de urgencia.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "Cuadro clínico y edad discordantes con neoplasia microcítica; la cirugía radical de entrada sin estadiaje está contraindicada."
            }
        ]
    },
    {
        "id": 3,
        "specialty": "nefrologia",
        "specialty_label": "Nefrología / Medio Interno",
        "station_type": "Interpretación de Laboratorio",
        "target_gap": "GAP_LAB_INTERPRETATION",
        "vignette": "Varón de 56 años con diabetes mellitus tipo 2 de larga data e hipertensión arterial acude con astenia y respiración profunda y rápida (Kussmaul). En analítica de sangre: pH 7.26, HCO3- 12 mEq/L, pCO2 28 mmHg, Na+ 138 mEq/L, K+ 5.7 mEq/L, Cl- 100 mEq/L, Glucosa 380 mg/dL, Cetonas séricas fuertemente positivas.",
        "vital_signs": {
            "pa": "100/60 mmHg",
            "fc": "104 lpm",
            "fr": "24 rpm",
            "sato2": "96%",
            "temp": "36.8 °C"
        },
        "question": "¿Cuál es el valor del Anion Gap sérico y el trastorno ácido-base primario diagnosticado?",
        "options": [
            {
                "id": "a",
                "text": "Anion Gap 10 mEq/L; Acidosis metabólica hiperclorémica con brecha aniónica normal.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "Cálculo erróneo de la brecha aniónica. Anion Gap = Na - (Cl + HCO3) = 138 - (100 + 12) = 26 mEq/L."
            },
            {
                "id": "b",
                "text": "Anion Gap 26 mEq/L; Acidosis metabólica con brecha aniónica elevada secundaria a cetoacidosis diabética.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "Cálculo preciso: Anion Gap = 138 - (100 + 12) = 26 mEq/L (>12 mEq/L). Trastorno primario: Acidosis metabólica con anion gap aumentado por normoacumulación de cetoácidos."
            },
            {
                "id": "c",
                "text": "Anion Gap 18 mEq/L; Alcalosis respiratoria compensada por hiperventilación psicógena.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "La hiperventilación de Kussmaul es la respuesta fisiológica compensadora a la acidosis metabólica grave, no un trastorno respiratorio primario."
            },
            {
                "id": "d",
                "text": "Anion Gap 38 mEq/L; Acidosis tubular renal tipo 2 por pérdida de bicarbonato proximal.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "La acidosis tubular renal cursa clásicamente con Anion Gap normal (hiperclorémica), incompatible con el valor de 26 mEq/L y cetonemia positiva."
            }
        ]
    },
    {
        "id": 4,
        "specialty": "pediatria",
        "specialty_label": "Pediatría / Reanimación Hídrica",
        "station_type": "Manejo Terapéutico y Farmacológico",
        "target_gap": "GAP_THERAPEUTIC_MANAGEMENT",
        "vignette": "Lactante de 10 meses de 9 kg es traído a Emergencias tras 48 horas de vómitos reiterados y diarrea líquida abundante. Al examen: somnoliento, llanto débil sin lágrimas, ojos marcadamente hundidos, mucosa oral seca, pliegue cutáneo que se recupera muy lentamente (>2 seg) y pulsos periféricos filiformes.",
        "vital_signs": {
            "pa": "70/45 mmHg",
            "fc": "165 lpm",
            "fr": "42 rpm",
            "sato2": "94%",
            "temp": "37.8 °C"
        },
        "question": "De acuerdo con las guías de reanimación pediátrica (Plan C de OMS / MINSA), ¿cuál es el esquema de expansión endovenosa de rescate inmediato?",
        "options": [
            {
                "id": "a",
                "text": "Bolo inicial de Lactato Ringer o Cloruro de Sodio 0.9% a 30 mL/kg en 30 minutos, seguido de 70 mL/kg en las siguientes 2.5 horas.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "En lactantes menores de 1 año con deshidratación grave con shock, el Plan C estipula 100 mL/kg divididos en: 30 mL/kg en los primeros 30 minutos, seguido de 70 mL/kg en 2.5 horas, con reevaluación estricta continua."
            },
            {
                "id": "b",
                "text": "Ofrecer sales de rehidratación oral con jeringa a 5 mL cada 15 minutos y diferir vía intravenosa.",
                "is_correct": False,
                "detected_gap": "GAP_TRIAGE_PRIORITIZATION",
                "explanation": "El paciente presenta signos inequívocos de choque hipovolémico descompensado y alteración de conciencia; la vía oral está formalmente contraindicada por riesgo inminente de aspiración y muerte."
            },
            {
                "id": "c",
                "text": "Infusión de Dextrosa al 5% pura a 100 mL/kg en 30 minutos sin electrolitos.",
                "is_correct": False,
                "detected_gap": "GAP_THERAPEUTIC_MANAGEMENT",
                "explanation": "Infundir agua libre hipotónica sin sodio en choque induce edema cerebral masivo, hiponatremia severa y convulsiones fatales."
            },
            {
                "id": "d",
                "text": "Bolo de Furosemida 2 mg/kg IV para forzar diuresis inmediata y descartar anuria.",
                "is_correct": False,
                "detected_gap": "GAP_THERAPEUTIC_MANAGEMENT",
                "explanation": "Administrar diuréticos de asa ante choque hipovolémico agrava letalmente la volemia y provoca colapso circulatorio irreversible."
            }
        ]
    },
    {
        "id": 5,
        "specialty": "cirugia_general",
        "specialty_label": "Cirugía General / Abdomen Agudo",
        "station_type": "Criterio Quirúrgico y Escalamiento",
        "target_gap": "GAP_TRIAGE_PRIORITIZATION",
        "vignette": "Varón de 24 años consulta por dolor abdominal iniciado hace 16 horas en epigastrio y región periumbilical, migrando luego a fosa ilíaca derecha. Presenta náuseas, hiporexia y sensación de alza térmica. Al examen: dolor exquisito a la palpación en punto de McBurney, signo de Blumberg positivo y defensa involuntaria. Hemograma: leucocitos 15,800/mm3 con 82% segmentados.",
        "vital_signs": {
            "pa": "120/78 mmHg",
            "fc": "98 lpm",
            "fr": "19 rpm",
            "sato2": "98%",
            "temp": "38.2 °C"
        },
        "question": "Con una puntuación de Alvarado de 9/10 (alta probabilidad de apendicitis aguda complicada), ¿cuál es la conducta terapéutica indicada?",
        "options": [
            {
                "id": "a",
                "text": "Nada por vía oral, hidratación endovenosa isotónica, analgesia reglada, profilaxis antibiótica preoperatoria y pase urgente a sala de operaciones para apendicectomía.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "En un paciente joven con Alvarado >=7 y signos de irritación peritoneal, la conducta es quirúrgica urgente sin requerir tomografías adicionales que retrasen la resolución antes de la perforación."
            },
            {
                "id": "b",
                "text": "Alta médica con ciprofloxacino oral por 7 días y control ambulatorio en 72 horas.",
                "is_correct": False,
                "detected_gap": "GAP_THERAPEUTIC_MANAGEMENT",
                "explanation": "Dar de alta a un paciente con abdomen agudo peritoneal genera peritonitis generalizada, sepsis severa y choque séptico potencialmente mortal."
            },
            {
                "id": "c",
                "text": "Solicitar tomografía abdominal trifásica diferida para dentro de 24 horas y mantener observación en sala general.",
                "is_correct": False,
                "detected_gap": "GAP_TRIAGE_PRIORITIZATION",
                "explanation": "Diferir la cirugía 24 horas ante irritación peritoneal franca eleva drásticamente la tasa de perforación apendicular, absceso y dehiscencia."
            },
            {
                "id": "d",
                "text": "Prescribir enemas evacuantes repetidos de fosfato sódico para resolver probable fecaloma.",
                "is_correct": False,
                "detected_gap": "GAP_THERAPEUTIC_MANAGEMENT",
                "explanation": "Los enemas están absolutamente contraindicados en sospecha de abdomen agudo por alto riesgo de barotrauma y perforación intestinal transmural."
            }
        ]
    }
]


def get_diagnostic_questions_for_student() -> List[Dict[str, Any]]:
    """Returns the sanitized diagnostic questions hiding internal correct/gap fields."""
    sanitized = []
    for q in DIAGNOSTIC_QUESTIONS:
        sanitized.append({
            "id": q["id"],
            "specialty": q["specialty"],
            "specialty_label": q["specialty_label"],
            "station_type": q["station_type"],
            "vignette": q["vignette"],
            "vital_signs": q["vital_signs"],
            "question": q["question"],
            "options": [
                {
                    "id": opt["id"],
                    "text": opt["text"]
                }
                for opt in q["options"]
            ]
        })
    return sanitized
