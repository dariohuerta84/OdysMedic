"""Canonical Bank of High-Yield Clinical MCQs for Baseline Diagnostic Assessment.
Supports two evaluation modes:
1. General Exam ('general'): 5 cross-specialty core stations.
2. Single Specialty Exam ('specialty'): 5 focused stations in one chosen clinical world.
"""

from typing import List, Dict, Any, Optional

DIAGNOSTIC_SPECIALTIES: List[Dict[str, str]] = [
    {
        "id": "medicina_interna",
        "label": "Medicina Interna",
        "description": "Cardiologia aguda, neumologia, infectologia y estabilizacion hemodinamica.",
    },
    {
        "id": "pediatria",
        "label": "Pediatria",
        "description": "Reanimacion hidrica, urgencias respiratorias, infectologia e inmunologia pediatrica.",
    },
    {
        "id": "ginecologia_obstetricia",
        "label": "Gineco-Obstetricia",
        "description": "Claves obstetricas, trastornos hipertensivos del embarazo y hemorragias.",
    },
    {
        "id": "cirugia_general",
        "label": "Cirugia General",
        "description": "Abdomen agudo quirurgico, patologia biliar, obstruccion intestinal y trauma.",
    },
    {
        "id": "medicina_familiar",
        "label": "Medicina Familiar",
        "description": "Control cronico integral, prevencion primaria, endocrinologia ambulatoria y salud mental.",
    },
    {
        "id": "nefrologia",
        "label": "Nefrologia y Medio Interno",
        "description": "Trastornos acido-base, electrolitos criticos, injuria renal aguda y glomerulopatias.",
    },
]

SPECIALTY_ALIASES: Dict[str, str] = {
    "medicina_interna": "medicina_interna",
    "pediatria": "pediatria",
    "gineco_obstetricia": "ginecologia_obstetricia",
    "ginecologia_obstetricia": "ginecologia_obstetricia",
    "ginecologia": "ginecologia_obstetricia",
    "cirugia": "cirugia_general",
    "cirugia_general": "cirugia_general",
    "medicina_familiar": "medicina_familiar",
    "nefrologia": "nefrologia",
}


def _build_q(
    qid: int,
    specialty: str,
    specialty_label: str,
    station_type: str,
    target_gap: str,
    vignette: str,
    vital_signs: Dict[str, str],
    question: str,
    options: List[Dict[str, Any]],
) -> Dict[str, Any]:
    return {
        "id": qid,
        "specialty": specialty,
        "specialty_label": specialty_label,
        "station_type": station_type,
        "target_gap": target_gap,
        "vignette": vignette,
        "vital_signs": vital_signs,
        "question": question,
        "options": options,
    }


DIAGNOSTIC_QUESTIONS: List[Dict[str, Any]] = [
    # =========================================================================
    # CANONICAL GENERAL SET (IDs 1..5) + REUSED AS ANCHOR FOR EACH SPECIALTY
    # =========================================================================
    {
        "id": 1,
        "specialty": "medicina_interna",
        "specialty_label": "Medicina Interna / Emergencias",
        "station_type": "Triaje y Priorizacion",
        "target_gap": "GAP_TRIAGE_SEVERITY",
        "vignette": "Varon de 68 anos acude a Emergencias con dolor retroesternal opresivo de 30 minutos de evolucion, irradiado a mandibula y diaforesis profusa. Al ingreso se encuentra palido, frio y con livideces en rodillas.",
        "vital_signs": {
            "pa": "82/48 mmHg",
            "fc": "118 lpm",
            "fr": "26 rpm",
            "sato2": "90%",
            "temp": "36.2 °C",
        },
        "question": "Con base en los parametros hemodinamicos y clinicos de shock cardiogenico incipiente, ¿cual es la conducta prioritaria inmediata?",
        "options": [
            {
                "id": "a",
                "text": "Administrar bolo intravenoso rapido de 2000 mL de Cloruro de Sodio al 0.9% para restituir volumen.",
                "is_correct": False,
                "detected_gap": "GAP_INITIAL_MANAGEMENT",
                "explanation": "En sospecha de shock cardiogenico por infarto, la sobrecarga hidrica desmedida precipita edema agudo de pulmon y fallo ventricular.",
            },
            {
                "id": "b",
                "text": "Monitorizacion continua, oxigenoterapia para SatO2 >92%, acceso venoso, ECG de 12 derivadas inmediato e inicio cauteloso de soporte vasopresor.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "Priorizacion correcta: soporte hemodinamico, confirmacion electrocardiografica en menos de 10 minutos y activacion de reperfusion coronaria.",
            },
            {
                "id": "c",
                "text": "Indicar analgesia con morfina subcutanea y solicitar radiografia de torax diferida en camilla.",
                "is_correct": False,
                "detected_gap": "GAP_TRIAGE_SEVERITY",
                "explanation": "Retrasar el ECG y el soporte hemodinamico ante hipotension severa infringe la prioridad de estabilizacion vital.",
            },
            {
                "id": "d",
                "text": "Iniciar inmediatamente trombolisis con tenecteplase sin requerir trazo electrocardiografico previo.",
                "is_correct": False,
                "detected_gap": "GAP_DIAGNOSTIC_REASONING",
                "explanation": "La fibrinolisis exige confirmacion de elevacion del segmento ST; administrarla a ciegas expone a hemorragia letal ante posible diseccion aortica.",
            },
        ],
    },
    {
        "id": 2,
        "specialty": "medicina_interna",
        "specialty_label": "Neumologia / Medicina Interna",
        "station_type": "Razonamiento Diagnostico",
        "target_gap": "GAP_DIAGNOSTIC_REASONING",
        "vignette": "Mujer de 32 anos presenta disnea de esfuerzo progresiva de 2 meses de evolucion, tos seca persistente, febricula vespertina y nodulos eritematosos dolorosos en caras anteriores de ambas piernas (eritema nodoso). Radiografia de torax muestra adenopatias hiliares bilaterales simetricas sin infiltrados parenquimatosos.",
        "vital_signs": {
            "pa": "115/75 mmHg",
            "fc": "78 lpm",
            "fr": "18 rpm",
            "sato2": "97%",
            "temp": "37.4 °C",
        },
        "question": "¿Cual es la hipotesis diagnostica integradora de primera linea (Sindrome de Lofgren) y su evolucion habitual?",
        "options": [
            {
                "id": "a",
                "text": "Sarcoidosis aguda (Sindrome de Lofgren); pronostico habitualmente benigno con remision espontanea en la mayoria de casos.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "La triada de eritema nodoso, adenopatias hiliares bilaterales simetricas y artralgias define el Sindrome de Lofgren, forma aguda de buen pronostico.",
            },
            {
                "id": "b",
                "text": "Tuberculosis pulmonar multirresistente primaria; inicio urgente de esquema de segunda linea sin confirmacion.",
                "is_correct": False,
                "detected_gap": "GAP_DIAGNOSTIC_REASONING",
                "explanation": "Las adenopatias de tuberculosis primaria suelen ser unilaterales y no justifican tratamiento empirico de segunda linea sin microbiologia.",
            },
            {
                "id": "c",
                "text": "Linfoma de Hodgkin variedad esclerosis nodular; indicacion perentoria de radioterapia mediastinica inmediata.",
                "is_correct": False,
                "detected_gap": "GAP_DIAGNOSTIC_REASONING",
                "explanation": "El linfoma cursa con masa mediastinica anterior asimetrica y requiere biopsia histologica formal antes de cualquier terapia oncologica.",
            },
            {
                "id": "d",
                "text": "Carcinoma microcitico pulmonar metastasico; realizar lobectomia exploratoria de urgencia.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "Edad y patron radiologico discordantes con neoplasia microcitica; la cirugia sin estadificacion esta contraindicada.",
            },
        ],
    },
    {
        "id": 3,
        "specialty": "nefrologia",
        "specialty_label": "Nefrologia / Medio Interno",
        "station_type": "Interpretacion de Laboratorio",
        "target_gap": "GAP_LAB_INTERPRETATION",
        "vignette": "Varon de 56 anos con diabetes mellitus tipo 2 acude con astenia y respiracion profunda y rapida (Kussmaul). Analitica arterial y serica: pH 7.26, HCO3- 12 mEq/L, pCO2 28 mmHg, Na+ 138 mEq/L, K+ 5.7 mEq/L, Cl- 100 mEq/L, Glucosa 380 mg/dL, cetonas sericas positivas.",
        "vital_signs": {
            "pa": "100/60 mmHg",
            "fc": "104 lpm",
            "fr": "24 rpm",
            "sato2": "96%",
            "temp": "36.8 °C",
        },
        "question": "¿Cual es el valor del Anion Gap serico y el trastorno acido-base primario diagnosticado?",
        "options": [
            {
                "id": "a",
                "text": "Anion Gap 10 mEq/L; acidosis metabolica hipercloremica con brecha anionica normal.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "Calculo incorrecto. Anion Gap = Na - (Cl + HCO3) = 138 - (100 + 12) = 26 mEq/L.",
            },
            {
                "id": "b",
                "text": "Anion Gap 26 mEq/L; acidosis metabolica con brecha anionica elevada secundaria a cetoacidosis diabetica.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "Calculo exacto: 138 - (100 + 12) = 26 mEq/L (>12 mEq/L), confirmando acidosis metabolica normocloremica por cetoacidos.",
            },
            {
                "id": "c",
                "text": "Anion Gap 18 mEq/L; alcalosis respiratoria compensada por hiperventilacion primaria.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "La respiracion de Kussmaul es compensacion respiratoria ante el descenso primario de bicarbonato y pH acidemico.",
            },
            {
                "id": "d",
                "text": "Anion Gap 38 mEq/L; acidosis tubular renal proximal tipo 2.",
                "is_correct": False,
                "detected_gap": "GAP_LAB_INTERPRETATION",
                "explanation": "La acidosis tubular renal cursa con Anion Gap normal (hipercloremica), incompatible con cetonemia positiva y brecha de 26 mEq/L.",
            },
        ],
    },
    {
        "id": 4,
        "specialty": "pediatria",
        "specialty_label": "Pediatria / Reanimacion Hidrica",
        "station_type": "Manejo Terapeutico",
        "target_gap": "GAP_INITIAL_MANAGEMENT",
        "vignette": "Lactante de 10 meses (9 kg) ingresa tras 48 horas de vomitos reiterados y diarrea acuosa abundante. Al examen: letargico, ojos muy hundidos, mucosa oral seca, signo del pliegue >2 segundos y pulsos perifericos debiles.",
        "vital_signs": {
            "pa": "70/45 mmHg",
            "fc": "165 lpm",
            "fr": "42 rpm",
            "sato2": "94%",
            "temp": "37.8 °C",
        },
        "question": "Segun las guias de reanimacion pediatrica (Plan C OMS / MINSA) para menor de 12 meses, ¿cual es la pauta endovenosa inmediata?",
        "options": [
            {
                "id": "a",
                "text": "Cloruro de Sodio 0.9% o Lactato Ringer a 30 mL/kg en 1 hora (o 30 min si shock franco), seguido de 70 mL/kg en 5 horas (o 2.5 h).",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "El Plan C repone 100 mL/kg con cristaloide isotonico dividido en fase rapida inicial de 30 mL/kg y fase de consolidacion de 70 mL/kg con reevaluacion estricta.",
            },
            {
                "id": "b",
                "text": "Sales de rehidratacion oral con jeringa a 5 mL cada 15 minutos difiriendo acceso venoso.",
                "is_correct": False,
                "detected_gap": "GAP_TRIAGE_SEVERITY",
                "explanation": "Con letargia e hipoperfusion existe alto riesgo de aspiracion y colapso circulatorio; la via intravenosa o intraosea es impostergable.",
            },
            {
                "id": "c",
                "text": "Dextrosa al 5% pura sin electrolitos a 100 mL/kg en 30 minutos.",
                "is_correct": False,
                "detected_gap": "GAP_INITIAL_MANAGEMENT",
                "explanation": "El agua libre hipotonica no expande el intravascular e induce hiponatremia aguda con edema cerebral grave.",
            },
            {
                "id": "d",
                "text": "Furosemida 2 mg/kg endovenosa para estimular diuresis temprana.",
                "is_correct": False,
                "detected_gap": "GAP_INITIAL_MANAGEMENT",
                "explanation": "Los diureticos estan contraindicados en hipovolemia severa porque precipitan parada circulatoria.",
            },
        ],
    },
    {
        "id": 5,
        "specialty": "cirugia_general",
        "specialty_label": "Cirugia General / Abdomen Agudo",
        "station_type": "Criterio Quirurgico",
        "target_gap": "GAP_TRIAGE_SEVERITY",
        "vignette": "Varon de 24 anos presenta dolor abdominal iniciado hace 16 horas en epigastrio con migracion a fosa iliaca derecha, nauseas e hiporexia. Examen: dolor localizado en punto de McBurney, signo de Blumberg positivo y defensa muscular. Leucocitos 15,800/mm3 (82% segmentados).",
        "vital_signs": {
            "pa": "120/78 mmHg",
            "fc": "98 lpm",
            "fr": "19 rpm",
            "sato2": "98%",
            "temp": "38.2 °C",
        },
        "question": "Con puntuacion de Alvarado 9/10 e irritacion peritoneal localizada, ¿cual es la conducta indicada?",
        "options": [
            {
                "id": "a",
                "text": "Suspension de via oral, hidratacion isotonica, analgesia reglada, profilaxis antibiotica preoperatoria y apendicectomia urgente.",
                "is_correct": True,
                "detected_gap": None,
                "explanation": "En varon joven con Alvarado alto y peritonismo franco, la resolucion quirurgica temprana con cobertura antimicrobiana evita perforacion y sepsis.",
            },
            {
                "id": "b",
                "text": "Alta medica con ciprofloxacino oral por 7 dias y reevaluacion en 72 horas.",
                "is_correct": False,
                "detected_gap": "GAP_INITIAL_MANAGEMENT",
                "explanation": "Enviar a domicilio un abdomen agudo peritoneal expone a perforacion apendicular y peritonitis generalizada.",
            },
            {
                "id": "c",
                "text": "Solicitar tomografia diferida en 24 horas antes de definir conducta.",
                "is_correct": False,
                "detected_gap": "GAP_TRIAGE_SEVERITY",
                "explanation": "Postergar 24 horas un cuadro clinico concluyente incrementa significativamente la tasa de complicacion perforativa.",
            },
            {
                "id": "d",
                "text": "Indicar enema evacuante de fosfato sodico en observacion.",
                "is_correct": False,
                "detected_gap": "GAP_INITIAL_MANAGEMENT",
                "explanation": "Los enemas aumentan la presion intraluminal y el riesgo de perforacion en apendicitis aguda.",
            },
        ],
    },

    # =========================================================================
    # MEDICINA INTERNA EXTRA QUESTIONS (IDs 6..8, paired with 1 & 2 = 5 total)
    # =========================================================================
    _build_q(
        6,
        "medicina_interna",
        "Medicina Interna / Infectologia",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Mujer de 74 anos ingresa por fiebre, tos purulenta y confusion aguda de 12 horas. Examen: crepitantes en base pulmonar derecha, llenado capilar 4 segundos. Lactato arterial 4.3 mmol/L, urea 52 mg/dL.",
        {"pa": "84/52 mmHg", "fc": "116 lpm", "fr": "31 rpm", "sato2": "89%", "temp": "38.9 °C"},
        "Ante sepsis de foco respiratorio con CURB-65 de 4 puntos e hipoperfusion tisular, ¿cual es el paquete de primera hora (Surviving Sepsis)?",
        [
            {"id": "a", "text": "Hemocultivos previos sin retrasar inicio de antibiotico empirico EV en <1 hora, cristaloides 30 mL/kg y control seriado de lactato.", "is_correct": True, "detected_gap": None, "explanation": "En choque septico probable, cada hora de retraso antibiotico eleva la mortalidad; se toman cultivos y se inicia cobertura y reanimacion inmediata."},
            {"id": "b", "text": "Diferir antibioticos hasta obtener resultado definitivo de cultivo de esputo en 48 horas.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Retrasar antimicrobianos 48 horas en sepsis grave con lactato >4 mmol/L resulta altamente letal."},
            {"id": "c", "text": "Manejo ambulatorio con amoxicilina oral y antipireticos.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "CURB-65 >=3 e hipotension obligan a hospitalizacion critica en unidad monitoreada."},
            {"id": "d", "text": "Administrar corticoides en megadosis aisladas sin cobertura antimicrobiana.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Los esteroides sin control infeccioso agravan la bacteriemia y no corrigen la causa primaria."},
        ],
    ),
    _build_q(
        7,
        "medicina_interna",
        "Medicina Interna / Cardiologia",
        "Interpretacion de Examenes",
        "GAP_LAB_INTERPRETATION",
        "Varon de 61 anos operado de artroplastia total de cadera hace 6 dias presenta disnea subita y dolor pleuritico derecho. Angio-TC pulmonar muestra trombo oclusivo en arteria lobar derecha; troponina normal y ventriculo derecho sin dilatacion en ecocardiograma.",
        {"pa": "124/78 mmHg", "fc": "106 lpm", "fr": "24 rpm", "sato2": "93%", "temp": "36.9 °C"},
        "Segun las guias ESC de Tromboembolismo Pulmonar (riesgo bajo / intermedio-bajo hemodinamicamente estable), ¿cual es el tratamiento indicado?",
        [
            {"id": "a", "text": "Anticoagulacion terapeutica inmediata (HBPM o anticoagulante oral directo como apixaban/rivaroxaban tras verificar hemostasia quirurgica).", "is_correct": True, "detected_gap": None, "explanation": "En TEP normotenso sin disfuncion del ventriculo derecho, la anticoagulacion plena previene recurrencia sin el riesgo hemorragico de la trombolisis."},
            {"id": "b", "text": "Fibrinolisis sistemica urgente con alteplasa 100 mg IV.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "La trombolisis sistemica se reserva para TEP de alto riesgo con inestabilidad hemodinamica, mas aun con cirugia mayor reciente."},
            {"id": "c", "text": "Solo acido acetilsalicilico 100 mg diario sin anticoagulantes.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "La antiagregacion plaquetaria es insuficiente para tratar tromboembolismo venoso agudo confirmado."},
            {"id": "d", "text": "Colocacion profilactica de filtro de vena cava inferior sin anticoagular pese a ausencia de sangrado activo.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "El filtro de cava solo se indica ante contraindicacion absoluta de anticoagulacion o recurrencia pese a rango optimo."},
        ],
    ),
    _build_q(
        8,
        "medicina_interna",
        "Medicina Interna / Urgencias",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Mujer de 70 anos con antecedente de hipertension mal controlada acude de madrugada con ortopnea severa, esputo rosado espumoso y crepitantes bilaterales hasta campos superiores (perfil humedo y caliente).",
        {"pa": "192/108 mmHg", "fc": "114 lpm", "fr": "32 rpm", "sato2": "86%", "temp": "36.5 °C"},
        "En edema agudo de pulmon cardiogenico hipertensivo, ¿cual es la intervencion inicial mas eficaz?",
        [
            {"id": "a", "text": "Posicion semisentada, soporte ventilatorio no invasivo (CPAP/BiPAP), vasodilatador endovenoso (nitroglicerina) y furosemida IV.", "is_correct": True, "detected_gap": None, "explanation": "Reducir poscarga y precarga con nitratos IV + VNI + diuretico de asa revierte rapidamente la congestion alveolar hipertensiva."},
            {"id": "b", "text": "Infusion rapida de 1500 mL de solucion salina isotonica.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Aportar volumen en edema pulmonar agudo agrava la hipoxemia refractaria."},
            {"id": "c", "text": "Betabloqueador endovenoso en bolo rapido durante la fase descompensada hipoxemica.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Iniciar betabloqueo agudo en congestion pulmonar franca puede deprimir el gasto cardiaco y precipitar choque."},
            {"id": "d", "text": "Nebulizacion aislada con bromuro de ipratropio y alta domiciliaria.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Se trata de insuficiencia cardiaca aguda hipoxemica potencialmente letal que requiere manejo hospitalario inmediato."},
        ],
    ),

    # =========================================================================
    # NEFROLOGIA EXTRA QUESTIONS (IDs 9..12, paired with 3 = 5 total)
    # =========================================================================
    _build_q(
        9,
        "nefrologia",
        "Nefrologia / Electrolitos",
        "Triaje y Priorizacion",
        "GAP_TRIAGE_SEVERITY",
        "Varon de 64 anos con enfermedad renal cronica estadio 5 omite dos sesiones de hemodialisis. Ingresa con debilidad muscular ascendente. Potasio serico: 7.1 mEq/L. ECG: ondas T picudas simetricas, ausencia de onda P y ensanchamiento del complejo QRS (160 ms).",
        {"pa": "135/82 mmHg", "fc": "48 lpm", "fr": "20 rpm", "sato2": "96%", "temp": "36.6 °C"},
        "¿Cual es el primer farmaco a administrar en los primeros minutos para prevenir fibrilacion ventricular?",
        [
            {"id": "a", "text": "Gluconato de calcio al 10% (10 mL IV lento en 2 a 5 minutos) bajo monitoreo electrocardiografico continuo.", "is_correct": True, "detected_gap": None, "explanation": "Con cambios en el QRS por hiperkalemia severa, estabilizar la membrana miocardica con calcio IV precede a las medidas redistributivas."},
            {"id": "b", "text": "Resina fijadora de potasio por via oral como medida unica y esperar 4 horas.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Las resinas intestinales tienen inicio de accion lento e insuficiente ante toxicidad cardiaca inminente."},
            {"id": "c", "text": "Espironolactona 100 mg via oral.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Los antagonistas de aldosterona retienen potasio y estan contraindicados."},
            {"id": "d", "text": "Infusion de cloruro de potasio 20 mEq/L.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Aportar potasio exogeno en hiperkalemia con QRS ancho desencadena asistolia."},
        ],
    ),
    _build_q(
        10,
        "nefrologia",
        "Nefrologia / Injuria Renal Aguda",
        "Interpretacion de Laboratorio",
        "GAP_LAB_INTERPRETATION",
        "Paciente de 72 anos con diarrea profusa de 4 dias presenta oliguria y ascenso de creatinina de 0.9 a 2.6 mg/dL. Sodio urinario: 8 mEq/L, FENa: 0.4%, osmolaridad urinaria: 610 mOsm/kg y sedimento urinario hialino sin cilindros granulosos.",
        {"pa": "92/58 mmHg", "fc": "108 lpm", "fr": "20 rpm", "sato2": "97%", "temp": "36.7 °C"},
        "¿Que mecanismo fisiopatologico explican los indices urinarios obtenidos?",
        [
            {"id": "a", "text": "Injuria renal aguda prerrenal por hipoperfusion con integridad tubular conservada.", "is_correct": True, "detected_gap": None, "explanation": "FENa <1%, Na urinario <20 mEq/L y osmolaridad urinaria >500 mOsm/kg demuestran avidez tubular intacta por sodio y agua."},
            {"id": "b", "text": "Necrosis tubular aguda establecida con perdida masiva de reabsorcion proximal.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "En NTA el FENa supera 2%, el sodio urinario supera 40 mEq/L y aparecen cilindros granulosos pigmentados."},
            {"id": "c", "text": "Obstruccion ureteral bilateral cronica con hidronefrosis grado IV.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "El contexto de perdidas gastrointestinales e indices de concentracion maxima orientan a causa prerrenal."},
            {"id": "d", "text": "Glomerulonefritis rapidamente progresiva pauciinmune.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "Faltan hematuria dismorfica y cilindros eritrocitarios propios del sindrome nefritico."},
        ],
    ),
    _build_q(
        11,
        "nefrologia",
        "Nefrologia / Medio Interno",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Maratonista de 29 anos ingresa con convulsion tonico-clonica generalizada tras ingerir grandes volumenes de agua libre durante la carrera. Sodio serico: 114 mEq/L, osmolaridad plasmatica: 238 mOsm/kg.",
        {"pa": "126/78 mmHg", "fc": "92 lpm", "fr": "20 rpm", "sato2": "95%", "temp": "37.0 °C"},
        "Ante hiponatremia aguda con sintomas neurologicos graves, ¿cual es el manejo inmediato y el limite seguro de correccion en 24 horas?",
        [
            {"id": "a", "text": "Bolo de Cloruro de Sodio hipertónico al 3% (100-150 mL en 10-20 min), evitando superar 8 a 10 mEq/L de ascenso en 24 horas.", "is_correct": True, "detected_gap": None, "explanation": "Un ascenso inicial de 4-6 mEq/L detiene el edema cerebral y las convulsiones, respetando el tope diario para prevenir mielinolisis osmótica."},
            {"id": "b", "text": "Restriccion hidrica exclusiva esperando ascenso espontaneo en 48 horas.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "En hiponatremia convulsiva existe riesgo inminente de herniacion cerebral si no se usa solucion salina al 3%."},
            {"id": "c", "text": "Corregir rapidamente el sodio hasta 140 mEq/L en menos de 6 horas.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "La sobrecorreccion acelerada provoca sindrome de desmielinizacion osmotica pontina."},
            {"id": "d", "text": "Infundir solucion hipotonica al 0.45% endovenosa.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El suero hipotonico reduce aun mas la natremia y agrava el edema cerebral."},
        ],
    ),
    _build_q(
        12,
        "nefrologia",
        "Nefrologia / Glomerulopatias",
        "Razonamiento Diagnostico",
        "GAP_DIAGNOSTIC_REASONING",
        "Varon de 45 anos consulta por anasarca progresiva y orina espumosa. Laboratorio: proteinuria de 24 horas 6.8 g, albumina serica 2.1 g/dL, colesterol total 340 mg/dL, creatinina 1.0 mg/dL, sedimento con cuerpos ovales grasos sin hematuria dismorfica.",
        {"pa": "128/80 mmHg", "fc": "76 lpm", "fr": "16 rpm", "sato2": "98%", "temp": "36.6 °C"},
        "¿Que sindrome glomerular define este perfil y que complicacion sistemica debe vigilarse estrechamente?",
        [
            {"id": "a", "text": "Sindrome nefrotico puro; alto estado protrombotico por perdida urinaria de antitrombina III e inmunoglobulinas.", "is_correct": True, "detected_gap": None, "explanation": "Proteinuria >3.5 g/24h, hipoalbuminemia, edema y dislipidemia definen sindrome nefrotico, con elevado riesgo tromboembolico e infeccioso."},
            {"id": "b", "text": "Sindrome nefritico agudo postinfeccioso sin proteinuria significativa.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "No presenta hipertension severa ni hematuria glomerular con cilindros hematicos."},
            {"id": "c", "text": "Nefritis intersticial alergica inducida por betalactamicos.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "La nefritis intersticial cursa con proteinuria subnefrotica (<1-2 g/d), eosinofilia y leucocituria esteril."},
            {"id": "d", "text": "Litiasis coraliforme bilateral obstructiva.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "La litiasis no explica proteinuria masiva de 6.8 g/24h ni lipiduria."},
        ],
    ),

    # =========================================================================
    # PEDIATRIA EXTRA QUESTIONS (IDs 13..16, paired with 4 = 5 total)
    # =========================================================================
    _build_q(
        13,
        "pediatria",
        "Pediatria / Neumologia",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Lactante de 4 meses previamente sano inicia rinorrea hialina hace 3 dias y hoy presenta tiraje subcostal, taquipnea y primer episodio de sibilancias difusas y subcrepitantes bilaterales.",
        {"pa": "86/52 mmHg", "fc": "148 lpm", "fr": "58 rpm", "sato2": "90%", "temp": "37.9 °C"},
        "Ante el primer episodio de bronquiolitis aguda viral moderada-hipoxemica, ¿cual es el pilar terapeutico avalado por guias AAP / MINSA?",
        [
            {"id": "a", "text": "Soporte con oxigenoterapia suplementaria para mantener SatO2 >=90-92%, aspiracion suave de secreciones nasales e hidratacion fraccionada.", "is_correct": True, "detected_gap": None, "explanation": "En bronquiolitis aguda las medidas de soporte (oxigeno e hidratacion) son las unicas con eficacia demostrada; broncodilatadores, corticoides y antibioticos rutinarios no estan recomendados."},
            {"id": "b", "text": "Dexametasona endovenosa sistematica junto con ceftriaxona empirica por 7 dias.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Ni corticoides sistemicos ni antibioticos alteran el curso viral sin coinfeccion bacteriana documentada."},
            {"id": "c", "text": "Antitusigenos opioides centrales para suprimir la tos.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Los antitusigenos estan contraindicados en lactantes por depresion respiratoria y retencion de moco."},
            {"id": "d", "text": "Alta inmediata sin suplemento de oxigeno pese a SatO2 de 90% y tiraje.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Lactante menor de 6 meses con hipoxemia y dificultad respiratoria requiere observacion y oxigenoterapia."},
        ],
    ),
    _build_q(
        14,
        "pediatria",
        "Pediatria / Infectologia",
        "Razonamiento Diagnostico",
        "GAP_DIAGNOSTIC_REASONING",
        "Nino de 3 anos presenta fiebre persistente de 6 dias (39.5 °C), inyeccion conjuntival bilateral no exudativa, labios eritematosos fisurados, lengua aframbuesada, exantema polimorfo, edema indurado de manos y adenopatia cervical unilateral de 2 cm.",
        {"pa": "96/60 mmHg", "fc": "132 lpm", "fr": "26 rpm", "sato2": "98%", "temp": "39.4 °C"},
        "¿Cual es el diagnostico clinico y el tratamiento precoz para prevenir aneurismas coronarios?",
        [
            {"id": "a", "text": "Enfermedad de Kawasaki; inmunoglobulina intravenosa (IGIV 2 g/kg dosis unica) mas acido acetilsalicilico y ecocardiograma basal.", "is_correct": True, "detected_gap": None, "explanation": "Cumple fiebre >=5 dias mas 5 criterios clasicos de Kawasaki; la IGIV dentro de los primeros 10 dias reduce los aneurismas coronarios de 25% a <5%."},
            {"id": "b", "text": "Escarlatina estreptococica; solo penicilina benzatinica intramuscular sin ecocardiograma.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "La conjuntivitis bulbar no purulenta y el edema acral con fiebre prolongada distinguen Kawasaki de escarlatina."},
            {"id": "c", "text": "Exantema subito por HHV-6; observacion exclusiva domiciliaria.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "En roseola el exantema aparece al ceder la fiebre, sin afectacion mucocutanea ni adenopatia mayor."},
            {"id": "d", "text": "Pulsos exclusivos de ciclofosfamida sin inmunoglobulina.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El estandar de primera linea con evidencia IA es inmunoglobulina endovenosa."},
        ],
    ),
    _build_q(
        15,
        "pediatria",
        "Pediatria / Neuroinfeccion",
        "Interpretacion de Laboratorio",
        "GAP_LAB_INTERPRETATION",
        "Escolar de 6 anos ingresa por cefalea intensa, vomitos explosivos, rigidez de nuca y signo de Brudzinski positivo, sin signos de focalizacion ni papiledema. LCR: aspecto turbio, leucocitos 1,850/mm3 (92% polimorfonucleares), glucosa 18 mg/dL (glucemia 96 mg/dL), proteinas 210 mg/dL.",
        {"pa": "104/66 mmHg", "fc": "122 lpm", "fr": "24 rpm", "sato2": "97%", "temp": "39.2 °C"},
        "¿Que etiologia refleja el citoquimico de LCR y cual es la conducta antimicrobiana?",
        [
            {"id": "a", "text": "Meningitis bacteriana aguda; iniciar de inmediato cefalosporina de tercera generacion (ceftriaxona/cefotaxima) + vancomicina a dosis meningea.", "is_correct": True, "detected_gap": None, "explanation": "Pleocitosis neutrofilica marcada, hipoglucorraquia (<40% de glucemia) e hiperproteinorraquia definen meningitis bacteriana y exigen terapia bactericida inmediata."},
            {"id": "b", "text": "Meningitis viral por enterovirus; manejo sintomatico exclusivo.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "La meningitis viral cursa con predominio mononuclear, glucosa normal y proteinas levemente elevadas."},
            {"id": "c", "text": "Meningitis tuberculosa subaguda; diferir tratamiento 1 semana.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "La forma tuberculosa presenta predominio linfocitario e instauracion subaguda."},
            {"id": "d", "text": "LCR normal para la edad; alta con paracetamol.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "1,850 leucocitos PMN con glucosa 18 mg/dL es una emergencia neuroinfecciosa."},
        ],
    ),
    _build_q(
        16,
        "pediatria",
        "Pediatria / Emergencias Respiratorias",
        "Triaje y Priorizacion",
        "GAP_TRIAGE_SEVERITY",
        "Nino de 2 anos despierta a medianoche con tos perruna metalica, disfonia y estridor inspiratorio audible en reposo con retraccion supraesternal moderada, sin babeo ni posicion en tripode.",
        {"pa": "94/58 mmHg", "fc": "136 lpm", "fr": "36 rpm", "sato2": "94%", "temp": "38.0 °C"},
        "En laringotraqueitis aguda (crup viral) moderada con estridor en reposo, ¿cual es el tratamiento de eleccion?",
        [
            {"id": "a", "text": "Dexametasona sistemica (0.6 mg/kg VO/IM/IV) asociada a adrenalina nebulizada y observacion minima de 2 a 4 horas.", "is_correct": True, "detected_gap": None, "explanation": "En crup con estridor en reposo, la dexametasona reduce el edema subglotico sostenido y la adrenalina nebulizada alivia rapidamente la obstruccion."},
            {"id": "b", "text": "Examen forzado de faringe con bajalenguas metalico y radiografia lateral obligatoria antes de medicar.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Agitar al nino empeora la obstruccion dinamica de la via aerea superior."},
            {"id": "c", "text": "Salbutamol inhalado cada 20 minutos como terapia unica.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El crup es obstruccion laringotraqueal extratoracica, no broncoespasmo bronquial."},
            {"id": "d", "text": "Azitromicina oral sin corticoides.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "La etiologia habitual es virus parainfluenza; los macrolidos son ineficaces."},
        ],
    ),

    # =========================================================================
    # CIRUGIA GENERAL EXTRA QUESTIONS (IDs 17..20, paired with 5 = 5 total)
    # =========================================================================
    _build_q(
        17,
        "cirugia_general",
        "Cirugia General / Via Biliar",
        "Razonamiento Diagnostico",
        "GAP_DIAGNOSTIC_REASONING",
        "Mujer de 46 anos acude por dolor continuo en hipocondrio derecho de 36 horas tras ingesta copiosa, fiebre y vomitos. Signo de Murphy positivo. Leucocitos 19,200/mm3, bilirrubina total 1.1 mg/dL. Ecografia: litiasis vesicular impactada en bacinete, pared vesicular de 6 mm con liquido pericolecistico y via biliar comun de 4 mm.",
        {"pa": "122/76 mmHg", "fc": "102 lpm", "fr": "20 rpm", "sato2": "97%", "temp": "38.5 °C"},
        "Segun las Guias de Tokio (TG18), ¿que grado de colecistitis aguda presenta y cual es el manejo optimo?",
        [
            {"id": "a", "text": "Colecistitis aguda Grado II (moderada, por leucocitosis >18,000); hidratacion, antibioticoterapia y colecistectomia laparoscopica temprana.", "is_correct": True, "detected_gap": None, "explanation": "Leucocitosis >18,000/mm3 sin disfuncion organica clasifica como Grado II en TG18; la colecistectomia laparoscopica temprana es el tratamiento definitivo."},
            {"id": "b", "text": "Colangitis aguda supurada; CPRE de urgencia obligatoria pese a coledoco normal y bilirrubina normal.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "No existe ictericia ni dilatacion coledociana que sugiera coledocolitiasis o colangitis."},
            {"id": "c", "text": "Colecistitis Grado III con choque refractario.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "El Grado III exige disfuncion organica cardiovascular, neurologica, renal, respiratoria, hepatica o hematologica."},
            {"id": "d", "text": "Alta directa con dieta libre en grasas.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Requiere ingreso hospitalario, soporte antimicrobiano y resolucion quirurgica."},
        ],
    ),
    _build_q(
        18,
        "cirugia_general",
        "Cirugia General / Trauma ATLS",
        "Triaje y Priorizacion",
        "GAP_TRIAGE_SEVERITY",
        "Varon de 30 anos sufre colision vehicular de alta energia. Ingresa diaforetico, abdomen distendido y doloroso. Eco-FAST en sala de trauma demuestra abundante liquido libre en espacio de Morrison y pelvis.",
        {"pa": "76/44 mmHg", "fc": "134 lpm", "fr": "28 rpm", "sato2": "93%", "temp": "35.9 °C"},
        "En trauma abdominal cerrado hemodinamicamente inestable con Eco-FAST positivo, ¿cual es la conducta prioritaria segun ATLS?",
        [
            {"id": "a", "text": "Activar protocolo de reanimacion hemostatica y trasladar de inmediato a quirofano para laparotomia exploradora.", "is_correct": True, "detected_gap": None, "explanation": "Un paciente inestable con FAST positivo tiene hemoperitoneo quirurgico; trasladarlo a tomografia retrasa letalmente el control de hemorragia."},
            {"id": "b", "text": "Trasladar al tomografo fuera de emergencias para TC trifasica de cuerpo entero de 30 minutos.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "La tomografia esta contraindicada en pacientes con hipotension refractaria (" + "el tomografo de la muerte" + ")."},
            {"id": "c", "text": "Observacion expectante en topico de cirugia por 12 horas.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Choque hemorragico grado III-IV requiere control quirurgico inmediato."},
            {"id": "d", "text": "Lavado peritoneal diagnostico antes de decidir cirugia.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "El FAST positivo ya confirmo hemoperitoneo; repetir pruebas invasivas solo consume tiempo vital."},
        ],
    ),
    _build_q(
        19,
        "cirugia_general",
        "Cirugia General / Obstruccion Intestinal",
        "Interpretacion de Imagenes",
        "GAP_LAB_INTERPRETATION",
        "Mujer de 58 anos con antecedente de histerectomia abdominal hace 5 anos acude por dolor abdominal colico, vomitos biliosos, distension marcada y ausencia de eliminacion de flatos de 24 horas. Rx de abdomen de pie: niveles hidroaereos escalonados en intestino delgado, valvulas conniventes en pila de monedas y ausencia de gas rectal, sin irritacion peritoneal ni lactato elevado.",
        {"pa": "118/74 mmHg", "fc": "94 lpm", "fr": "18 rpm", "sato2": "98%", "temp": "36.9 °C"},
        "¿Cual es la causa mas frecuente y el manejo inicial en ausencia de signos de estrangulacion?",
        [
            {"id": "a", "text": "Obstruccion de intestino delgado por bridas y adherencias postoperatorias; descompresion con sonda nasogastrica, reposicion hidroelectrolitica y reevaluacion quirurgica seriada.", "is_correct": True, "detected_gap": None, "explanation": "Las adherencias explican >65% de obstrucciones de intestino delgado; sin isquemia ni peritonismo se inicia manejo descompresivo vigilado."},
            {"id": "b", "text": "Administrar prokineticos a dosis altas (metoclopramida cada 4 h) con sonda pinzada.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Los prokineticos en obstruccion mecanica completa aumentan el dolor y riesgo de perforacion."},
            {"id": "c", "text": "Volvulo de sigmoides; colonoscopia descompresiva de urgencia.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "Las valvulas conniventes centrales corresponden a intestino delgado, no a signo del grano de cafe colonico."},
            {"id": "d", "text": "Dieta liquida hipercalorica inmediata por via oral.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El reposo digestivo absoluto (NPO) es obligatorio ante obstruccion intestinal."},
        ],
    ),
    _build_q(
        20,
        "cirugia_general",
        "Cirugia General / Pancreas",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Varon de 42 anos ingresa con dolor epigastrico transfictivo en cinturon hacia dorso y vomitos persistentes. Lipasa serica: 1,420 U/L (>3 veces limite superior). Ecografia abdominal muestra microlitiasis vesicular con via biliar normal y sin necrosis pancreatica.",
        {"pa": "114/72 mmHg", "fc": "96 lpm", "fr": "20 rpm", "sato2": "97%", "temp": "37.3 °C"},
        "En pancreatitis aguda biliar leve, ¿cual es el manejo inicial basado en evidencia actual?",
        [
            {"id": "a", "text": "Hidratacion moderada dirigida por metas con Lactato Ringer, control analgesico eficaz, nutricion enteral oral temprana al ceder dolor y colecistectomia en la misma hospitalizacion.", "is_correct": True, "detected_gap": None, "explanation": "Los ensayos actuales (WATERFALL) respaldan hidratacion moderada con Ringer, realimentacion precoz y colecistectomia en el mismo ingreso para evitar recurrencia."},
            {"id": "b", "text": "Imipenem profilactico obligatorio por 14 dias en toda pancreatitis leve.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Los antibioticos profilacticos en pancreatitis aguda esteril no reducen mortalidad y seleccionan resistencia."},
            {"id": "c", "text": "Ayuno absoluto prolongado por 10 dias con nutricion parenteral total rutinaria.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "La nutricion enteral temprana preserva la barrera mucosa intestinal y reduce infecciones."},
            {"id": "d", "text": "Pancreatectomia distal de urgencia en las primeras 6 horas.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "La cirugia pancreatica precoz en pancreatitis leve esta contraindicada."},
        ],
    ),

    # =========================================================================
    # GINECO-OBSTETRICIA QUESTIONS (IDs 21..25 = 5 total)
    # =========================================================================
    _build_q(
        21,
        "ginecologia_obstetricia",
        "Gineco-Obstetricia / Clave Azul",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Gestante de 33 semanas acude por cefalea frontooccipital intensa, escotomas centelleantes y epigastralgia. Presion arterial repetida: 168/112 mmHg, plaquetas 88,000/uL, TGO 145 U/L, creatinina 1.3 mg/dL.",
        {"pa": "168/112 mmHg", "fc": "94 lpm", "fr": "20 rpm", "sato2": "98%", "temp": "36.7 °C"},
        "Ante preeclampsia con criterios de severidad (ACOG / Clave Azul), ¿cual es la conducta neuroprotectora y antihipertensiva inmediata?",
        [
            {"id": "a", "text": "Sulfato de magnesio (4-6 g IV carga y 1-2 g/h mantenimiento) para profilaxis de eclampsia + antihipertensivo agudo (nifedipino oral o labetalol IV) y estabilizacion para culminacion segun protocolo.", "is_correct": True, "detected_gap": None, "explanation": "El sulfato de magnesio es el farmaco de eleccion para prevenir convulsiones eclampticas, acompañado de control urgente de PA >=160/110 mmHg."},
            {"id": "b", "text": "Enalaprilato endovenoso seguido de losartan oral.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "IECA y ARA-II son teratogenicos y fetotoxicos (disgenesia renal y oligohidramnios), contraindicados en el embarazo."},
            {"id": "c", "text": "Diazepam endovenoso continuo en lugar de sulfato de magnesio.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El sulfato de magnesio es muy superior a las benzodiacepinas para prevencion de eclampsia y evita depresion neonatal."},
            {"id": "d", "text": "Reposo domiciliario con control prenatal en 2 semanas.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Presenta crisis hipertensiva severa y daño de organo blanco (HELLP incipiente), emergencia obstetrica."},
        ],
    ),
    _build_q(
        22,
        "ginecologia_obstetricia",
        "Gineco-Obstetricia / Clave Roja",
        "Triaje y Priorizacion",
        "GAP_TRIAGE_SEVERITY",
        "Puerpera inmediata de parto vaginal macrosomico presenta sangrado transvaginal profuso estimado en 1,200 mL. Al examen: utero blando, subinvolucionado por encima de cicatriz umbilical que no contrae adecuadamente.",
        {"pa": "84/50 mmHg", "fc": "126 lpm", "fr": "24 rpm", "sato2": "95%", "temp": "36.4 °C"},
        "Identificando la causa mas frecuente de hemorragia postparto (atonia uterina - Tono), ¿cual es el paquete terapeutico inmediato?",
        [
            {"id": "a", "text": "Activar Clave Roja, masaje uterino bimanual, dos vias gruesas con cristaloides, uterotonicos (oxitocina EV) y acido tranexamico 1 g IV temprano (dentro de las primeras 3 h).", "is_correct": True, "detected_gap": None, "explanation": "La atonia uterina causa ~70% de HPP; el manejo simultaneo con masaje, oxitocicos y acido tranexamico precoz (ensayo WOMAN) reduce la mortalidad materna."},
            {"id": "b", "text": "Esperar resultados de hemograma control en 2 horas antes de indicar uterotonicos.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "La hemoglobina inicial no refleja perdidas agudas; el indice de choque >0.9 exige accion inmediata."},
            {"id": "c", "text": "Indicar tocoliticos (nifedipino) para relajar el miometrio.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Relajar el utero empeora catastroficamente la hemorragia por atonia."},
            {"id": "d", "text": "Histerectomia directa sin intentar masaje ni uterotonicos de primera linea.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El manejo escalonado inicia siempre con medidas medicas y mecanicas inmediatas."},
        ],
    ),
    _build_q(
        23,
        "ginecologia_obstetricia",
        "Gineco-Obstetricia / Primer Trimestre",
        "Razonamiento Diagnostico",
        "GAP_DIAGNOSTIC_REASONING",
        "Mujer de 27 anos con amenorrea de 7 semanas ingresa por dolor pelvico agudo unilateral, sangrado vaginal escaso oscuro y sincope. Examen: dolor a la movilizacion cervical (signo de Frenkel) y abdomen con rebote hipogastrico. Beta-hCG cuantitativa: 4,200 mUI/mL. Ecografia transvaginal: cavidad endometrial vacia, masa anexial derecha y abundante liquido libre en fondo de saco de Douglas.",
        {"pa": "86/54 mmHg", "fc": "122 lpm", "fr": "22 rpm", "sato2": "96%", "temp": "36.5 °C"},
        "¿Cual es el diagnostico y la conducta resolutiva indicada?",
        [
            {"id": "a", "text": "Embarazo ectopico tubarico roto con inestabilidad hemodinamica; reanimacion intravascular e intervencion quirurgica de urgencia (salpingectomia).", "is_correct": True, "detected_gap": None, "explanation": "Beta-hCG > zona discriminatoria con utero vacio, hemoperitoneo e hipotension confirma ectopico roto, contraindicando metotrexato y exigiendo cirugia."},
            {"id": "b", "text": "Tratamiento medico ambulatorio con metotrexato intramuscular dosis unica.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "La rotura tubarica y la inestabilidad hemodinamica son contraindicaciones absolutas para metotrexato."},
            {"id": "c", "text": "Amenaza de aborto simple; reposo absoluto en casa con progesterona.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "El utero vacio con hemoperitoneo y choque descarta gestacion intrauterina viable."},
            {"id": "d", "text": "Legrado uterino instrumental inmediato.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El legrado no resuelve la hemorragia peritoneal proveniente de la trompa rota."},
        ],
    ),
    _build_q(
        24,
        "ginecologia_obstetricia",
        "Gineco-Obstetricia / Tercer Trimestre",
        "Razonamiento Diagnostico",
        "GAP_DIAGNOSTIC_REASONING",
        "Multigesta de 31 semanas con antecedente de dos cesareas previas consulta por sangrado transvaginal rojo rutilante, indoloro, de inicio subito durante el reposo. Tono uterino normal (blando) y latidos cardiacos fetales conservados (142 lpm).",
        {"pa": "112/70 mmHg", "fc": "88 lpm", "fr": "18 rpm", "sato2": "99%", "temp": "36.7 °C"},
        "¿Que sospecha clinica predomina y que maniobra esta estrictamente proscrita antes de la ecografia?",
        [
            {"id": "a", "text": "Placenta previa; esta contraindicado realizar tacto vaginal hasta confirmar ubicacion placentaria por ecografia.", "is_correct": True, "detected_gap": None, "explanation": "Sangrado rojo rutilante indoloro con tono uterino normal orienta a placenta previa; el tacto vaginal digital puede desencadenar hemorragia exsanguinante."},
            {"id": "b", "text": "Desprendimiento prematuro de placenta; realizar tacto vaginal bimanual vigoroso y amniotomia.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El DPP cursa con hipertonia uterina dolorosa y sangrado oscuro; además, el tacto a ciegas en hemorragia del 3er trimestre es peligroso."},
            {"id": "c", "text": "Rotura uterina consumada con feto libre en cavidad.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "En rotura uterina hay dolor agudo, perdida de presentacion y bradicardia fetal grave."},
            {"id": "d", "text": "Induccion inmediata del parto con misoprostol vaginal sin ecografia.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Inducir trabajo de parto sobre una placenta previa oclusiva provoca hemorragia materno-fetal catastrofica."},
        ],
    ),
    _build_q(
        25,
        "ginecologia_obstetricia",
        "Gineco-Obstetricia / Infeccion Obstetrica",
        "Interpretacion Clinica",
        "GAP_LAB_INTERPRETATION",
        "Gestante de 38 semanas con rotura prematura de membranas de 26 horas presenta fiebre materna (38.6 °C), sensibilidad uterina a la palpacion, liquido amniotico purulento, taquicardia materna (116 lpm) y taquicardia fetal sostenida (172 lpm). Leucocitos: 17,400/mm3.",
        {"pa": "110/68 mmHg", "fc": "116 lpm", "fr": "20 rpm", "sato2": "98%", "temp": "38.6 °C"},
        "Ante el diagnostico de corioamnionitis clinica (criterios de Gibbs / Triple I), ¿cual es la conducta terapeutica?",
        [
            {"id": "a", "text": "Iniciar antibioticoterapia endovenosa de amplio espectro (ampicilina + gentamicina) de inmediato y proceder a culminar la gestacion, privilegiando via vaginal salvo indicacion obstetrica de cesarea.", "is_correct": True, "detected_gap": None, "explanation": "La corioamnionitis requiere antibioticos intraparto inmediatos y finalizacion del embarazo; por si sola no obliga a cesarea si el parto vaginal es factible."},
            {"id": "b", "text": "Conducta expectante con tocolisis por 2 semanas adicionales.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Tocolizar una cavidad amniotica infectada precipita sepsis materna y neonatal severa."},
            {"id": "c", "text": "Diferir antibioticos hasta despues del alumbramiento.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El inicio intraparto de antibioticos reduce significativamente la bacteriemia neonatal y endometritis."},
            {"id": "d", "text": "Solo antipireticos orales sin cobertura antimicrobiana.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Cumple criterios completos de infeccion intraamniotica aguda."},
        ],
    ),

    # =========================================================================
    # MEDICINA FAMILIAR QUESTIONS (IDs 26..30 = 5 total)
    # =========================================================================
    _build_q(
        26,
        "medicina_familiar",
        "Medicina Familiar / Riesgo Cardiovascular",
        "Triaje y Priorizacion",
        "GAP_TRIAGE_SEVERITY",
        "Varon de 54 anos asintomatico acude a consulta de control en centro de salud. Se constata presion arterial en ambos brazos tras reposo de 184/112 mmHg. Examen neurologico, cardiopulmonar y fondo de ojo normales; niega dolor toracico, disnea o cefalea.",
        {"pa": "184/112 mmHg", "fc": "78 lpm", "fr": "16 rpm", "sato2": "98%", "temp": "36.6 °C"},
        "Al tratarse de una urgencia hipertensiva (elevacion severa sin daño agudo de organo blanco), ¿cual es la conducta adecuada?",
        [
            {"id": "a", "text": "Reiniciar o ajustar terapia antihipertensiva por via oral con descenso gradual en 24-48 horas y seguimiento ambulatorio estrecho, evitando descensos bruscos.", "is_correct": True, "detected_gap": None, "explanation": "Sin daño agudo de organo diana no se requieren vasodilatadores IV; bajar bruscamente la PA induce hipoperfusion cerebral o coronaria."},
            {"id": "b", "text": "Administrar nifedipino sublingual de accion corta para normalizar la PA en 15 minutos.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El nifedipino sublingual esta proscrito por caidas impredecibles de presion e isquemia cerebral/miocardica."},
            {"id": "c", "text": "Iniciar infusion de nitroprusiato de sodio en topico.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El nitroprusiato se reserva para emergencias hipertensivas con daño organico agudo en UCI."},
            {"id": "d", "text": "Suspender definitivamente toda medicacion cronica.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Requiere optimizacion y adherencia farmacologica oral sostenida."},
        ],
    ),
    _build_q(
        27,
        "medicina_familiar",
        "Medicina Familiar / Diabetes",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Mujer de 59 anos con diabetes mellitus tipo 2, hipertension y enfermedad renal cronica albuminurica (TFGe 48 mL/min/1.73m2, relacion albumina/creatinina urinaria 420 mg/g). Toma metformina 850 mg c/12h y losartan 100 mg/dia; HbA1c actual 8.1%.",
        {"pa": "128/78 mmHg", "fc": "74 lpm", "fr": "16 rpm", "sato2": "98%", "temp": "36.6 °C"},
        "Segun las guias ADA y KDIGO 2024, ¿que grupo farmacologico debe añadirse por beneficio cardiorrenal demostrado?",
        [
            {"id": "a", "text": "Inhibidor del cotransportador sodio-glucosa tipo 2 (iSGLT2 como empagliflozina o dapagliflozina).", "is_correct": True, "detected_gap": None, "explanation": "Con TFGe >=20 mL/min y albuminuria en DM2, los iSGLT2 reducen progresion renal y hospitalizacion por insuficiencia cardiaca con evidencia 1A."},
            {"id": "b", "text": "Glibenclamida a dosis maximas por su seguridad hipoglucemica en ERC.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Glibenclamida acumula metabolitos activos en ERC y provoca hipoglucemias graves prolongadas."},
            {"id": "c", "text": "Combinar losartan con enalapril (doble bloqueo SRAA).", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El doble bloqueo IECA + ARA-II esta contraindicado por incrementar hiperkalemia e injuria renal aguda."},
            {"id": "d", "text": "Suspender el ARA-II pese a creatinina y potasio estables.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El bloqueo SRAA a dosis maxima tolerada es pilar nefroprotector en nefropatia albuminurica."},
        ],
    ),
    _build_q(
        28,
        "medicina_familiar",
        "Medicina Familiar / Endocrinologia",
        "Interpretacion de Laboratorio",
        "GAP_LAB_INTERPRETATION",
        "Mujer de 38 anos consulta por fatiga cronica, intolerancia al frio, estreñimiento, piel seca y ganancia ponderal leve de 6 meses. Analitica: TSH 18.4 mUI/L (VN 0.4 - 4.0) y T4 libre 0.5 ng/dL (VN 0.8 - 1.8). Anticuerpos anti-TPO positivos elevados.",
        {"pa": "116/76 mmHg", "fc": "58 lpm", "fr": "15 rpm", "sato2": "99%", "temp": "36.1 °C"},
        "¿Cual es el diagnostico y la indicacion terapeutica inicial?",
        [
            {"id": "a", "text": "Hipotiroidismo primario autoinmune (tiroiditis de Hashimoto); iniciar levotiroxina sodica en ayunas y reevaluar TSH en 6 a 8 semanas.", "is_correct": True, "detected_gap": None, "explanation": "TSH elevada con T4 libre baja y anti-TPO positivos confirma hipotiroidismo primario clinico; la vida media de T4 exige control de TSH a las 6-8 semanas."},
            {"id": "b", "text": "Hipotiroidismo secundario hipofisario; solicitar tiamazol.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "El hipotiroidismo central cursa con TSH baja o inapropiadamente normal; tiamazol es antitiroideo."},
            {"id": "c", "text": "Hipertiroidismo subclinico; iniciar propranolol.", "is_correct": False, "detected_gap": "GAP_LAB_INTERPRETATION", "explanation": "En hipertiroidismo la TSH se encuentra suprimida (<0.1 mUI/L)."},
            {"id": "d", "text": "Tiroidectomia total como primera medida.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El manejo del hipotiroidismo autoinmune sin bocio compresivo ni sospecha maligna es exclusivamente medico."},
        ],
    ),
    _build_q(
        29,
        "medicina_familiar",
        "Medicina Familiar / Respiratorio",
        "Manejo Terapeutico",
        "GAP_INITIAL_MANAGEMENT",
        "Joven de 22 anos con asma utiliza salbutamol a demanda 4 veces por semana, presenta despertares nocturnos 2 veces al mes y limitacion leve al ejercicio. Espirometria con relacion VEF1/CVF 0.68 e incremento de VEF1 de 16% post-broncodilatador.",
        {"pa": "115/72 mmHg", "fc": "80 lpm", "fr": "17 rpm", "sato2": "98%", "temp": "36.6 °C"},
        "De acuerdo con la estrategia GINA actual en adultos y adolescentes, ¿por que debe evitarse la monoterapia exclusiva con SABA y que se recomienda?",
        [
            {"id": "a", "text": "El uso aislado de SABA aumenta riesgo de exacerbaciones graves; se recomienda tratamiento controlador con corticoide inhalado (idealmente formoterol-CI a demanda/mantenimiento MART).", "is_correct": True, "detected_gap": None, "explanation": "GINA desaconseja SABA en monoterapia desde el escalon 1 y prioriza corticoide inhalado (vía preferida CI-formoterol) para reducir hospitalizaciones y mortalidad."},
            {"id": "b", "text": "Aumentar salbutamol fijo cada 4 horas sin corticoide inhalado.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "El sobreuso de SABA (>3 inhaladores/ano) se asocia a subtratamiento inflamatorio y mortalidad por asma."},
            {"id": "c", "text": "Iniciar prednisona oral diaria permanente de 40 mg.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Los corticoides orales continuos son ultimo recurso en asma grave refractaria por sus efectos adversos sistemicos."},
            {"id": "d", "text": "Prescribir teofilina endovenosa ambulatoria.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Las metilxantinas tienen estrecho margen terapeutico y no estan recomendadas."},
        ],
    ),
    _build_q(
        30,
        "medicina_familiar",
        "Medicina Familiar / Salud Mental",
        "Triaje y Priorizacion",
        "GAP_TRIAGE_SEVERITY",
        "Varon de 47 anos acude tras perdida laboral reciente refiriendo animo depresivo diario por 5 semanas, anhedonia, insomnio terminal, culpa intensa y verbaliza haber estructurado un plan especifico de autolesion para esa misma noche viviendo solo.",
        {"pa": "126/80 mmHg", "fc": "88 lpm", "fr": "18 rpm", "sato2": "99%", "temp": "36.6 °C"},
        "Ante episodio depresivo mayor con riesgo suicida alto e inminente (plan estructurado y falta de red inmediata), ¿cual es la conducta prioritaria?",
        [
            {"id": "a", "text": "Garantizar acompanamiento continuo en entorno seguro, activar referencia urgente a urgencias psiquiatricas/hospitalizacion protectora e involucrar red familiar de soporte.", "is_correct": True, "detected_gap": None, "explanation": "La presencia de plan letal estructurado e intencionalidad actual constituye emergencia medico-psiquiatrica que impide el alta sin contencion."},
            {"id": "b", "text": "Entregar receta para 60 tabletas de antidepresivo triciclico y citar en 30 dias.", "is_correct": False, "detected_gap": "GAP_TRIAGE_SEVERITY", "explanation": "Dar de alta sin supervision y prescribir triciclicos (altamente cardiotoxicos en sobredosis) es gravemente riesgoso."},
            {"id": "c", "text": "Evitar preguntar sobre ideacion suicida para no sugerir conductas.", "is_correct": False, "detected_gap": "GAP_DIAGNOSTIC_REASONING", "explanation": "Explorar directamente el riesgo suicida no induce la conducta y es indispensable para proteger la vida del paciente."},
            {"id": "d", "text": "Indicar unicamente complejo vitaminico B intramuscular.", "is_correct": False, "detected_gap": "GAP_INITIAL_MANAGEMENT", "explanation": "Ignora una emergencia de salud mental con riesgo vital inmediato."},
        ],
    ),
]

GENERAL_EXAM_IDS = [1, 2, 3, 4, 5]

SPECIALTY_EXAM_IDS: Dict[str, List[int]] = {
    "medicina_interna": [1, 2, 6, 7, 8],
    "nefrologia": [3, 9, 10, 11, 12],
    "pediatria": [4, 13, 14, 15, 16],
    "cirugia_general": [5, 17, 18, 19, 20],
    "ginecologia_obstetricia": [21, 22, 23, 24, 25],
    "medicina_familiar": [26, 27, 28, 29, 30],
}


def resolve_diagnostic_question_set(
    mode: str = "general",
    specialty: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Resolves the exact 5-question raw set for general or single-specialty mode."""
    question_lookup = {q["id"]: q for q in DIAGNOSTIC_QUESTIONS}

    norm_mode = (mode or "general").strip().lower()
    if norm_mode == "specialty" and specialty:
        norm_spec = SPECIALTY_ALIASES.get(
            specialty.strip().lower().replace("-", "_"),
            "medicina_interna",
        )
        ids = SPECIALTY_EXAM_IDS.get(norm_spec, GENERAL_EXAM_IDS)
    else:
        ids = GENERAL_EXAM_IDS

    return [question_lookup[qid] for qid in ids if qid in question_lookup]


def get_diagnostic_questions_for_student(
    mode: str = "general",
    specialty: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Returns sanitized diagnostic questions hiding internal correct/gap fields."""
    raw_questions = resolve_diagnostic_question_set(mode=mode, specialty=specialty)
    sanitized = []
    for q in raw_questions:
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
                    "text": opt["text"],
                }
                for opt in q["options"]
            ],
        })
    return sanitized
