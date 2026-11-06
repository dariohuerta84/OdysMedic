from typing import Optional
from app.models.enums import CognitiveGap
from app.models.mcq import (
    MCQOptionInternal,
    MCQStationInternal,
    MCQStationStudent,
)

CASE_ALIASES: dict[str, str] = {
    "s13256-022-03392-w": "s13256-017-1522-8",
    "s13256-023-04294-1": "s13256-018-1897-4",
    "s13256-026-05974-4": "s13256-020-02558-8",
    "s13256-025-05650-z": "s13256-021-02891-2",
    "s13256-024-04496-1": "s13256-024-04664-5",
    "s13256-025-05577-5": "s13256-024-04987-9",
}


def build_raw_case_stations() -> dict[str, list[MCQStationInternal]]:
    data: dict[str, list[MCQStationInternal]] = {}

    # Case 1: s13256-019-2334-y (Nefrologia, aHUS y falla renal aguda)
    cid_1 = "s13256-019-2334-y"
    data[cid_1] = [
        MCQStationInternal(
            station_id=f"{cid_1}-st1",
            case_id=cid_1,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Paciente femenina de 24 años ingresa a urgencias con astenia profunda, ictericia escleral, "
                "palidez mucocutánea marcada, fiebre de 38.3 C y oligoanuria (diuresis < 15 ml/h en las últimas 6 horas). "
                "Signos vitales: TA 165/100 mmHg, FC 112 lpm, FR 20 rpm, SpO2 97% aire ambiente. "
                "¿Cuál es la priorización de triaje y conducta inmediata más adecuada?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Clasificar como Prioridad I / Emergencia hemodinámico-renal; canalizar dos accesos venosos periféricos "
                        "de grueso calibre, monitorización continua y sonda vesical para cuantificación horaria de diuresis."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "Presenta signos de alarma inminente: falla renal aguda oligúrica e hipertensión severa en contexto "
                        "de sospecha de microangiopatía trombótica con repercusión hemodinámica."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Clasificar como Prioridad III (Urgencia menor); diferir la canalización venosa y esperar evaluación "
                        "en sala de espera general tras administrar paracetamol oral para la fiebre."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Subestima el riesgo vital de una microangiopatía con disfunción multiorgánica aguda y oligoanuria severa."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Administrar bolo intravenoso de 2000 ml de solución salina al 0.9% en 30 minutos sin verificar estado "
                        "de volemia ni diuresis previa."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La sobrecarga masiva de volumen en una paciente anúrica puede desencadenar edema agudo de pulmón iatrogénico."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Asumir cuadro de gastroenteritis bacteriana simple por la fiebre y el dolor abdominal previo, "
                        "indicando alta con loperamida y ciprofloxacino."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Pasa por alto los signos de microangiopatía y falla renal aguda grave, incurriendo en cierre prematuro."
                    ),
                ),
            ],
            target_competency="Triaje de emergencia y estabilización de microangiopatía trombótica",
            clinical_pearl_id="s13256-019-2334-y",
            citation_ref_id="ref-kdigo-ahus-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_1}-st2",
            case_id=cid_1,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "Los exámenes auxiliares urgentes reportan: Hb 6.8 g/dL, Plaquetas 28,000/uL, Creatinina 4.2 mg/dL, "
                "BUN 64 mg/dL, LDH 1450 UI/L, Haptoglobina < 5 mg/dL, Bilirrubina indirecta 3.1 mg/dL. "
                "Frotis de sangre periférica: abundantes esquistocitos (4%). Coprocultivo y toxina Shiga negativos. "
                "Actividad de ADAMTS13: 58%. ¿Cuál es el diagnóstico diferencial más acertado y su interpretación fisiopatológica?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Síndrome Urémico Hemolítico Atípico (aHUS) mediado por desregulación de la vía alternativa del complemento, "
                        "descartando PTT por ADAMTS13 > 10% y STEC-HUS por Shiga negativa."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La tríada de anemia hemolítica microangiopática no inmune, trombocitopenia de consumo y falla renal severa "
                        "con ADAMTS13 normal-alto (> 10%) y ausencia de Shiga toxina confirma aHUS."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Púrpura Trombocitopénica Trombótica (PTT) clásica que requiere confirmación genética inmediata antes "
                        "de cualquier intervención."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Error en el corte de ADAMTS13: la PTT cursa con déficit severo (< 10%). Con 58% de actividad queda descartada."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Púrpura Trombocitopénica Inmune (PTI) primaria aislada, dado que la trombocitopenia es la anomalía dominante."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Ignora los esquistocitos, la hemólisis microangiopática (LDH alta, haptoglobina indetectable) y la falla renal aguda grave."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Coagulación Intravascular Diseminada (CID) séptica; omitir frotis y transfundir inmediatamente plasma "
                        "fresco congelado y plaquetas sin confirmación de fibrinógeno ni tiempos."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "En microangiopatías trombóticas primarias los tiempos de coagulación son normales y la transfusión de plaquetas está contraindicada."
                    ),
                ),
            ],
            target_competency="Interpretación de frotis hematológico, ADAMTS13 y biomarcadores de hemólisis microangiopática",
            clinical_pearl_id="s13256-019-2334-y",
            citation_ref_id="ref-kdigo-ahus-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_1}-st3",
            case_id=cid_1,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Tras confirmarse la sospecha de aHUS con falla renal oligúrica severa (creatinina 4.2 mg/dL) "
                "y trombocitopenia profunda refractaria, ¿cuál es la estrategia terapéutica dirigida de primera línea "
                "recomendada por las guías internacionales KDIGO 2024?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Iniciar recambio plasmático terapéutico (plasmaféresis) de urgencia como puente o terapia dirigida "
                        "con inhibidor del complemento C5 (Eculizumab o Ravulizumab)."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El bloqueo de la fracción terminal del complemento C5 o el recambio plasmático precoz detiene el daño "
                        "endotelial microvascular y rescata la función renal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Transfusión profiláctica inmediata de concentrados plaquetarios para elevar las plaquetas por encima de 100,000/uL."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La transfusión profiláctica de plaquetas en microangiopatías trombóticas reactiva la trombogénesis microvascular y exacerba la isquemia tisular."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Suspender todo tratamiento específico hasta obtener el resultado del panel de secuenciación genética del factor H y CD46."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "El retraso terapéutico en aHUS genera necrosis cortical irreversible o mortalidad temprana; el inicio del tratamiento debe ser clínico e inmediato."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Indicar corticoides a dosis bajas por vía oral en sala general y reevaluar función renal ambulatoriamente en 72 horas."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Omite la monitorización en unidad de cuidados intensivos y carece de eficacia frente a la desregulación genética del complemento."
                    ),
                ),
            ],
            target_competency="Manejo terapéutico dirigido con inhibidores del complemento y prevención de iatrogenia transfusional",
            clinical_pearl_id="s13256-019-2334-y",
            citation_ref_id="ref-kdigo-ahus-001",
        ),
    ]

    # Case 2: s13256-017-1522-8 (Endocrinologia, hipokalemia y acidosis por capecitabina)
    cid_2 = "s13256-017-1522-8"
    data[cid_2] = [
        MCQStationInternal(
            station_id=f"{cid_2}-st1",
            case_id=cid_2,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Paciente masculino de 58 años en tratamiento con capecitabina por adenocarcinoma colorrectal acude a urgencias "
                "por debilidad muscular extrema ascendente, náuseas, poliuria y dificultad para mantenerse de pie. "
                "Al examen: PA 90/60 mmHg, FC 128 lpm irregular, FR 22 rpm, hiporreflexia osteotendinosa generalizada. "
                "¿Cuál es la prioridad en el triaje y evaluación inmediata?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Clasificar como Prioridad I / Emergencia médica; realizar de inmediato un electrocardiograma (ECG) "
                        "de 12 derivaciones y monitorización continua del ritmo cardíaco por sospecha de trastorno hidroelectrolítico crítico."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La debilidad muscular con pulso irregular en paciente oncológico sugiere hipopotasemia severa con alto riesgo de arritmias ventriculares letales."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Clasificar como fatiga oncológica habitual (Prioridad IV); programar cita ambulatoria con oncología para la próxima semana."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Desestima los signos de inestabilidad hemodinámica y las complicaciones electrolíticas agudas potencialmente mortales."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Administrar bolo de furosemida 40 mg IV por sospecha de retención hídrica subclínica antes de conocer los iones séricos."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Los diuréticos de asa exacerban drásticamente la hipopotasemia y la depleción de volumen, pudiendo precipitar colapso circulatorio."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Catalogar el cuadro como síndrome de Guillain-Barré atípico e iniciar inmunoglobulina humana intravenosa sin pruebas de laboratorio."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Ignora la historia de quimioterapia antimetabolito y no evalúa causas metabólicas corregibles de parálisis muscular."
                    ),
                ),
            ],
            target_competency="Triaje de inestabilidad hemodinámica e identificación de riesgo arrítmico electrolítico",
            clinical_pearl_id="s13256-022-03392-w",
            citation_ref_id="ref-ada-hyperglycemia-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_2}-st2",
            case_id=cid_2,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "El laboratorio urgente reporta: Potasio sérico 2.1 mEq/L, Glucosa 480 mg/dL, Sodio 132 mEq/L, "
                "Bicarbonato 12 mEq/L, pH 7.22, pCO2 28 mmHg, Cetonas en orina negativas, Osmolaridad sérica efectiva 315 mOsm/kg. "
                "ECG muestra aplanamiento de ondas T, prolongación del QTc y ondas U prominentes en derivaciones precordiales. "
                "¿Cuál es la interpretación diagnóstica integral?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Hipopotasemia severa sintomática con cambios electrocardiográficos de alto riesgo, asociada a crisis hiperglucémica "
                        "y acidosis metabólica por toxicidad metabólico-tubular inducida por capecitabina."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "Identifica con precisión el potasio crítico (< 2.5 mEq/L) con repercusión en ECG, la descompensación glucémica y el efecto tubular del fármaco."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Cetoacidosis diabética clásica grave que exige bomba de infusión de insulina endovenosa a dosis altas sin aporte de potasio."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Las cetonas son negativas y omite el riesgo mortal de administrar insulina con potasio menor a 3.3 mEq/L."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Alcalosis respiratoria pura por ansiedad oncológica con hipokalemia redistributiva transitoria benigna."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "El pH de 7.22 y bicarbonato de 12 mEq/L corresponden a una acidosis metabólica con compensación respiratoria, no alcalosis."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Falla suprarrenal aguda primaria aislada; prescribir fludrocortisona oral y retirar monitorización cardíaca."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La insuficiencia suprarrenal primaria se presenta característicamente con hiperpotasemia e hipoglucemia, no con hipopotasemia extrema."
                    ),
                ),
            ],
            target_competency="Interpretación gasométrica, electrolítica y correlación electrocardiográfica de hipokalemia",
            clinical_pearl_id="s13256-022-03392-w",
            citation_ref_id="ref-ada-hyperglycemia-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_2}-st3",
            case_id=cid_2,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Frente a un potasio sérico de 2.1 mEq/L con cambios en ECG (ondas U, QTc prolongado) y glucemia de 480 mg/dL, "
                "¿cuál es la secuencia terapéutica estricta y segura que debe seguirse según las guías clínicas de la ADA y KDIGO?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Suspender inmediatamente capecitabina, iniciar reposición intravenosa urgente de cloruro de potasio "
                        "a través de vía venosa central monitorizada, y diferir la insulina hasta que el potasio sérico sea > 3.3 mEq/L."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La insulina introduce el potasio al compartimento intracelular; si se administra con K < 3.3 mEq/L puede precipitar arritmias ventriculares fatales."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Administrar bolo inmediato de insulina regular 0.15 UI/kg IV en bolo seguido de infusión continua rápida sin suplementación previa de potasio."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Error crítico de seguridad farmacológica: la entrada masiva de potasio al espacio intracelular provocará paro cardíaco en diástole o FV."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Administrar suplementos de potasio únicamente por vía oral (jarabe 20 mEq) por considerarlo más seguro, descartando la vía parenteral."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "La vía oral es insuficiente ante hipopotasemia grave con cambios electrocardiográficos; requiere corrección intravenosa controlada."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Continuar la dosis programada de capecitabina para no retrasar el ciclo oncológico mientras se hidrata lentamente al paciente en sala común."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "No reconoce la necesidad mandatoria de suspender el agente tóxico desencadenante de la tubulopatía y la descompensación metabólica."
                    ),
                ),
            ],
            target_competency="Manejo de seguridad farmacológica en hipokalemia extrema con hiperglucemia concurrente",
            clinical_pearl_id="s13256-022-03392-w",
            citation_ref_id="ref-ada-hyperglycemia-001",
        ),
    ]

    # Case 3: s13256-018-1897-4 (Neurologia, afecto pseudobulbar post-ACV)
    cid_3 = "s13256-018-1897-4"
    data[cid_3] = [
        MCQStationInternal(
            station_id=f"{cid_3}-st1",
            case_id=cid_3,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Paciente masculino de 64 años con antecedente de ictus isquémico pontocerebeloso hace 3 semanas acude a control "
                "acompañado de su esposa, quien refiere que el paciente presenta episodios súbitos, incontrolables y repetidos "
                "de llanto desconsolado o risa espasmódica sin desencadenante ambiental ni tristeza congruente. "
                "Examen neurológico: paresia facial leve y disartria cerebelosa. ¿Cuál es la evaluación clínica y diferenciación inicial prioritaria?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Reconocer la incongruencia entre la expresión emocional involuntaria y el estado afectivo interno, "
                        "identificando sospecha de Afecto Pseudobulbar (PBA) secundario a disrupción de vías córtico-ponto-cerebelosas."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El PBA se define por episodios involuntarios y estereotipados de llanto/risa desproporcionados o disociados del estado de ánimo basal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Diagnosticar Trastorno Depresivo Mayor post-ictus e indicar inicio de terapia electroconvulsiva urgente sin escalas de afecto."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Confunde un trastorno de desinhibición motora emocional orgánica con un trastorno del estado de ánimo reactivo."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Desestimar el cuadro como llanto fingido o ganancia secundaria del paciente, indicando a la familia no prestarle atención."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Ignora el severo sufrimiento psicosocial del PBA y niega la base anatomofisiológica de la lesión vascular previa."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Prescribir sedación profunda con benzodiacepinas de acción prolongada a dosis altas como primera medida sintomática."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Las benzodiacepinas deterioran la cognición post-ictus, aumentan el riesgo de caídas y no resuelven la fisiopatología del PBA."
                    ),
                ),
            ],
            target_competency="Diferenciación semiológica entre incontinencia emocional (PBA) y depresión post-ictus",
            clinical_pearl_id="s13256-023-04294-1",
            citation_ref_id="ref-aha-pba-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_3}-st2",
            case_id=cid_3,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "Se realiza resonancia magnética cerebral que confirma infarto subagudo en protuberancia dorsal y pedúnculo cerebeloso medio. "
                "Se aplica la escala Center for Neurologic Study-Lability Scale (CNS-LS), arrojando un puntaje de 24 (corte >= 13). "
                "No hay ideación autolítica ni anhedonia basal. ¿Cuál es el diagnóstico diferencial más probable y su confirmación?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Afecto pseudobulbar confirmado clínica y radiológicamente por lesión de los circuitos córtico-ponto-cerebelosos "
                        "moduladores de la expresión afectiva."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La correlación de la lesión infratentorial con la puntuación de 24 en CNS-LS confirma formalmente el diagnóstico de PBA."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Crisis epilépticas gelásticas secundarias a hamartoma hipotalámico oculto, recomendando lobectomía temporal urgente."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "No existe correlato de actividad epileptógena ictal ni hallazgo de lesión hipotalámica en la resonancia magnética."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Psicosis maníaco-depresiva de inicio tardío inducida por edema vasogénico cerebeloso."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "El cuadro no presenta delusiones, manía ni pérdida de juicio de realidad; la afectividad es lábil pero lúcida."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Síndrome confusional agudo (delirium hiperactivo) secundario a encefalopatía metabólica no pesquisada."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "El paciente se encuentra lúcido, orientado en las tres esferas y sin fluctuación del nivel de conciencia."
                    ),
                ),
            ],
            target_competency="Aplicación de escalas psicométricas (CNS-LS) e interpretación de neuroimagen en PBA",
            clinical_pearl_id="s13256-023-04294-1",
            citation_ref_id="ref-aha-pba-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_3}-st3",
            case_id=cid_3,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Para el tratamiento farmacológico del afecto pseudobulbar sintomático con marcado impacto en la rehabilitación "
                "y calidad de vida del paciente, ¿cuál es la opción terapéutica de primera línea respaldada por las guías AHA/ASA 2023?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Iniciar un inhibidor selectivo de la recaptación de serotonina (ej. escitalopram o sertralina) "
                        "o combinación dextrometorfano/quinidina a dosis tituladas."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "Los ISRS y dextrometorfano/quinidina modulan la neurotransmisión serotoninérgica y glutamatérgica restaurando el control inhibitorio bulbocerebeloso."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Prescribir antipsicóticos típicos de alta potencia (ej. haloperidol 10 mg/día) para bloqueo dopaminérgico estricto."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Los antipsicóticos típicos inducen extrapiramidalismo severo en pacientes post-ictus y no están indicados en PBA."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Administrar anticonvulsivantes a dosis altas (fenitoína 400 mg IV cada 8h) sin monitorización de niveles plasmáticos."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Carece de indicación en ausencia de crisis y expone a ataxia, toxicidad cerebelosa añadida y arritmias cardíacas."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Suspender toda intervención farmacológica asumiendo que el daño axonal de tallo cerebral es intratable."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "El PBA responde favorablemente al tratamiento farmacológico en la mayoría de los pacientes, mejorando la rehabilitación motora y el bienestar familiar."
                    ),
                ),
            ],
            target_competency="Farmacoterapia dirigida del afecto pseudobulbar con ISRS y moduladores glutamatérgicos",
            clinical_pearl_id="s13256-023-04294-1",
            citation_ref_id="ref-aha-pba-001",
        ),
    ]

    # Case 4: s13256-020-02558-8 (Reumatologia, LES neuropsiquiátrico con psicosis)
    cid_4 = "s13256-020-02558-8"
    data[cid_4] = [
        MCQStationInternal(
            station_id=f"{cid_4}-st1",
            case_id=cid_4,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Mujer de 22 años es traída a urgencias por su familia debido a agitación psicomotriz aguda, alucinaciones auditivas, "
                "disartria y conducta desorganizada de 48 horas de evolución. Signos vitales: T 38.4 C, PA 135/85 mmHg, FC 105 lpm. "
                "Al examen físico destaca eritema malar que respeta surcos nasogenianos y sinovitis en interfalángicas proximales de manos. "
                "¿Cuál es la conducta de triaje y abordaje inicial?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Clasificar como Prioridad I / Emergencia neurológica e inmunológica; asegurar contención verbal/farmacológica segura, "
                        "monitorizar vía aérea y plantear sospecha de compromiso neuropsiquiátrico por enfermedad autoinmune sistémica (NPSLE)."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La psicosis aguda con signos inflamatorios sistémicos (artritis, eritema malar, fiebre) obliga a descartar patología orgánica autoinmune urgente."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Derivar directamente a hospital psiquiátrico ambulatorio con diagnóstico de brote esquizofrénico primario, "
                        "omitiendo la fiebre y las manifestaciones articulares."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Error grave de triaje: atribuir psicosis de debut a causa psiquiátrica pura ignorando signos de enfermedad inflamatoria multisistémica."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Administrar sedación masiva con diazepam 30 mg IV en bolo sin monitorización respiratoria ni examen neurológico formal."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Riesgo de depresión respiratoria severa y enmascaramiento del déficit neurológico focal subyacente."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Asumir intoxicación por alucinógenos ilícitos y esperar 24 horas en observación sin solicitar analítica básica ni punción lumbar."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "El anclaje en consumo de drogas retrasa el tratamiento de una vasculopatía inflamatoria cerebral potencialmente devastadora."
                    ),
                ),
            ],
            target_competency="Triaje de psicosis aguda orgánica y reconocimiento de signos de alarma de autoinmunidad sistémica",
            clinical_pearl_id="s13256-026-05974-4",
            citation_ref_id="ref-eular-npsle-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_4}-st2",
            case_id=cid_4,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "Se descarta infección en LCR (Gram y cultivos negativos, citoquímico con pleocitosis linfocítica leve y proteínas 68 mg/dL). "
                "Laboratorio: ANA 1:640 patrón homogéneo, anti-ADN doble cadena fuertemente positivo, C3 45 mg/dL (bajo) y C4 8 mg/dL (bajo). "
                "RMN cerebral: lesiones hiperintensas en sustancia blanca subcortical en T2/FLAIR. ¿Cuál es el diagnóstico confirmatorio y su fundamentación?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Lupus Eritematoso Sistémico con compromiso Neuropsiquiátrico activo (NPSLE) de fenotipo inflamatorio/inmunomediado "
                        "según criterios EULAR/ACR."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La combinación de hipocomplementemia profunda, anti-dsDNA elevado y neuroimagen con hiperintensidades respaldan afectación lúpica mediada por inmunocomplejos."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Esclerosis múltiple remitente-recurrente primaria aislada; interpretar los autoanticuerpos positivos como hallazgo incidental."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Ignora los criterios inmunológicos específicos de LES activo con consumo marcado de complemento."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Meningitis bacteriana aguda por neumococo; indicar ceftriaxona y vancomicina a dosis completas por 21 días."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "El LCR con predominio linfocítico, cultivos bacterianos negativos y marcada autoinmunidad descartan infección bacteriana purulenta."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Encefalitis herpética no complicada; prescribir aciclovir oral en monoterapia y suspender el estudio reumatológico."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La vía oral es inapropiada para encefalitis aguda y se ignora el diagnóstico de LES neuropsiquiátrico mayor."
                    ),
                ),
            ],
            target_competency="Interpretación de perfil inmunológico de LES y neuroimagen en afectación del sistema nervioso central",
            clinical_pearl_id="s13256-026-05974-4",
            citation_ref_id="ref-eular-npsle-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_4}-st3",
            case_id=cid_4,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Según las recomendaciones de consenso EULAR/ACR 2023 para el manejo de manifestaciones neuropsiquiátricas mayores "
                "de LES (psicosis lúpica, disartria y alteración cognitiva), ¿cuál es el esquema de inducción inmunosupresora indicado?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Pulsos de metilprednisolona intravenosa (1 g/día por 3 días consecutivos) en combinación con ciclofosfamida "
                        "intravenosa mensual (esquema NIH/Euro-Lupus) o rituximab en casos refractarios."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El compromiso lúpico neuropsiquiátrico mayor inflamatorio requiere terapia inmunosupresora agresiva de choque con corticoides a dosis altas y agentes alquilantes."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Iniciar prednisona oral a dosis de 5 mg/día en monoterapia sin agentes citotóxicos para evitar toxicidad medular."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Dosis francamente infraterapéutica para una manifestación potencialmente fatal de compromiso orgánico cerebral en LES."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Suspender los corticoides por riesgo de psicosis esteroidea y prescribir únicamente haloperidol a dosis altas."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "La psicosis es manifestación de la enfermedad activa (hipocomplementemia presente); suspender el corticoide agrava la inflamación del SNC."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Indicar reposo en cama domiciliario y postergar la decisión terapéutica hasta la consulta reumatológica ambulatoria en 4 semanas."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "La afectación del SNC por LES es una urgencia médica con alto riesgo de secuelas neurológicas permanentes o muerte si no se induce remisión inmediata."
                    ),
                ),
            ],
            target_competency="Terapia de inducción inmunosupresora intensiva con pulsos de metilprednisolona y ciclofosfamida",
            clinical_pearl_id="s13256-026-05974-4",
            citation_ref_id="ref-eular-npsle-001",
        ),
    ]

    # Case 5: s13256-021-02891-2 (Ginecologia/Obstetricia, hipoparatiroidismo en gestante)
    cid_5 = "s13256-021-02891-2"
    data[cid_5] = [
        MCQStationInternal(
            station_id=f"{cid_5}-st1",
            case_id=cid_5,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Gestante de 28 años a las 32 semanas de edad gestacional con antecedente de microdeleción 22q11.2 (síndrome de DiGeorge) "
                "e hipoparatiroidismo acude a urgencias por parestesias peribucales, espasmos carpopedales al inflar el manguito de presión "
                "(signo de Trousseau positivo) y sensación de contractura laríngea. PA: 120/75 mmHg, FC: 88 lpm, FCF: 142 lpm. "
                "¿Cuál es el triaje y abordaje de seguridad inmediato?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Clasificar como Prioridad I Obstétrico-Médica; asegurar vía aérea ante riesgo de laringoespasmo, "
                        "colocar acceso venoso periférico, monitorizar simultáneamente ritmo cardíaco materno y trazado cardiotocográfico fetal."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La hipocalcemia sintomática con tetania y estridor inminente amenaza la vida materna por paro respiratorio y compromete el bienestar fetal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Catalogar como crisis de hiperventilación por ansiedad gestacional; indicar respirar en una bolsa de papel y enviar a domicilio."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "La alcalosis respiratoria empeora críticamente la fracción ionizada del calcio, pudiendo desencadenar laringoespasmo letal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Proceder de inmediato a cesárea de emergencia sin evaluar el calcio sérico ni estabilizar el estado neuromuscular materno."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La anestesia e intervención quirúrgica con hipocalcemia severa no corregida conlleva riesgo crítico de arritmias intraoperatorias y paro cardíaco."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Atribuir las parestesias y espasmos exclusivamente a calambres comunes del tercer trimestre e indicar masajes locales."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Ignora el antecedente de microdeleción 22q11.2 y el signo inequívoco de Trousseau, desestimando la patología paratiroidea."
                    ),
                ),
            ],
            target_competency="Triaje materno-fetal de emergencia en hipocalcemia sintomática aguda con tetania",
            clinical_pearl_id="s13256-025-05650-z",
            citation_ref_id="ref-acog-hypopara-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_5}-st2",
            case_id=cid_5,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "El perfil bioquímico revela: Calcio total sérico 6.2 mg/dL (Albúmina 3.6 g/dL; Calcio corregido 6.5 mg/dL), "
                "Fósforo 6.1 mg/dL (elevado), Magnesio 1.9 mg/dL (normal), PTH intacta 4 pg/mL (inapropiadamente baja para el grado de hipocalcemia). "
                "Calciuria de 24 horas: 85 mg/24h. ¿Cuál es la interpretación diagnóstica y la meta terapéutica en la gestación según las guías ACOG / Endocrine Society?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Hipoparatiroidismo primario no controlado; la meta es mantener el calcio sérico en el límite inferior "
                        "de la normalidad (8.5 - 9.0 mg/dL) para evitar tetania materna y prevenir hipercalciuria materna que suprimiría la paratiroides fetal."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La sobrecorrección causa hipercalciuria con litiasis materna y paso transplacentario excesivo de calcio que suprime la paratiroides fetal produciendo hipocalcemia neonatal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Pseudohipoparatiroidismo resistente con hiperparatiroidismo secundario florido, esperando valores de PTH > 300 pg/mL."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "La PTH es marcadamente baja (4 pg/mL), lo que define hipoparatiroidismo deficitario primario, no resistencia a PTH."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Déficit nutricional simple de vitamina D con hiperparatiroidismo reactivo; el fósforo alto se debe a ingesta reciente."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "En el déficit de vitamina D la PTH elevada causa fosfaturia e hipofosfatemia; aquí el fósforo está elevado por ausencia de acción fosfatúrica de PTH."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Elevar el calcio materno agresivamente hasta valores > 10.5 mg/dL mediante infusiones continuas sin control de calciuria."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La hipercalcemia iatrogénica materna es perjudicial: genera nefrocalcinosis materna e hipoparatiroidismo neonatal con convulsiones tras el parto."
                    ),
                ),
            ],
            target_competency="Interpretación del eje calcio-fósforo-PTH en gestación y definición de metas de seguridad perinatal",
            clinical_pearl_id="s13256-025-05650-z",
            citation_ref_id="ref-acog-hypopara-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_5}-st3",
            case_id=cid_5,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Ante el cuadro agudo de tetania y calcio corregido de 6.5 mg/dL en el tercer trimestre de la gestación, "
                "¿cuál es el régimen terapéutico intravenoso inicial y de mantenimiento oral indicado?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Administrar Gluconato de Calcio al 10% (1-2 ampollas en 100 ml de dextrosa al 5% en 10-20 minutos) "
                        "con monitorización electrocardiográfica, seguido de infusión continua y titulación de calcitriol oral más carbonato de calcio."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El gluconato de calcio IV revierte la hipocalcemia aguda sintomática sin necrosar tejidos venosos periféricos, y el calcitriol es esencial al no haber 1-alfa-hidroxilación renal por falta de PTH."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Administrar Cloruro de Calcio al 10% en bolo directo no diluido por catéter venoso periférico sin dilución ni monitor cardíaco."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "El cloruro de calcio periférico en bolo rápido causa irritación endotelial severa, necrosis por extravasación y alto riesgo de fibrilación ventricular."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Prescribir únicamente colecalciferol nativo (Vitamina D3) a dosis habituales (800 UI/día) sin sales de calcio ni análogos activos de vitamina D."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "El colecalciferol nativo requiere activación enzimática dependiente de PTH; en hipoparatiroidismo grave es ineficaz y se requiere calcitriol activo."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Esperar al inicio espontáneo del trabajo de parto sin corregir el calcio, asumiendo que los requerimientos fetales compensarán el déficit."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "La hipocalcemia materna severa no corregida causa atonía uterina, distocias dinámicas y riesgo de muerte fetal intrauterina."
                    ),
                ),
            ],
            target_competency="Tratamiento agudo con gluconato de calcio y mantenimiento con calcitriol oral en gestante",
            clinical_pearl_id="s13256-025-05650-z",
            citation_ref_id="ref-acog-hypopara-001",
        ),
    ]

    # Case 6: s13256-024-04664-5 (Oftalmologia, síndrome de efusión uveal)
    cid_6 = "s13256-024-04664-5"
    data[cid_6] = [
        MCQStationInternal(
            station_id=f"{cid_6}-st1",
            case_id=cid_6,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Paciente de 45 años, emétrope, consulta por dolor ocular izquierdo intenso de inicio agudo, fotofobia, "
                "visión borrosa progresiva con halos alrededor de las luces, náuseas y cefalea hemicraneal izquierda. "
                "Al examen con linterna: inyección ciliar periquerática marcada, córnea opaca con edema microquístico y pupila media arreactiva. "
                "¿Cuál es la priorización de triaje y medida inmediata?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Prioridad I Oftalmológica (Emergencia); sospechar crisis de hipertensión ocular aguda por cierre angular secundario, "
                        "medir tonometría de aplanación urgente e interconsulta inmediata con oftalmología."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La hipertensión ocular aguda con edema corneal amenaza con producir daño isquémico irreversible del nervio óptico en cuestión de horas."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Prioridad IV; asumir conjuntivitis bacteriana aguda superficial, prescribir colirio de gentamicina y remitir a consulta externa programada."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Error catastrófico de triaje: confundir hipertensión ocular aguda con conjuntivitis bacteriana, retrasando la reducción urgente de la PIO."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Instilar colirio midriático (atropina o tropicamida al 1%) para examinar detalladamente el fondo de ojo en urgencias."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Contraindicación absoluta: los midriáticos causan midriasis que bloquea aún más el ángulo iridocorneal, disparando la presión intraocular."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Catalogar el cuadro como migraña clásica con aura visual e indicar antiinflamatorios orales y reposo en habitación oscura."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "La pupila media fija, el edema corneal y la hiperemia ciliar son signos objetivos de patología ocular orgánica grave, no de migraña primaria."
                    ),
                ),
            ],
            target_competency="Triaje de ojo rojo doloroso y sospecha de hipertensión ocular aguda por cierre angular",
            clinical_pearl_id="s13256-024-04496-1",
            citation_ref_id="ref-aao-uveal-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_6}-st2",
            case_id=cid_6,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "La tonometría reporta PIO de 48 mmHg en ojo izquierdo (ojo derecho 14 mmHg). La gonioscopía confirma cierre angular "
                "de 360 grados por desplazamiento anterior del diafragma iridocristaliniano. La ecografía ocular modo B y biomicroscopía "
                "ultrasónica (UBM) evidencian desprendimiento ciliocoroideo anular exudativo de 360 grados sin roturas retinianas y esclera "
                "engrosada (2.1 mm; normal < 1.0 mm). ¿Cuál es el diagnóstico diferencial definitivo?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Síndrome de Efusión Uveal (SEU) con engrosamiento escleral anormal y desprendimiento ciliocoroideo que provoca "
                        "rotación anterior del cuerpo ciliar y glaucoma por cierre angular secundario sin bloqueo pupilar."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El engrosamiento escleral altera la permeabilidad transescleral de proteínas acumulando líquido supracoroideo que empuja el cuerpo ciliar hacia adelante."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Glaucoma primario de ángulo abierto juvenil sin componente uveal ni coroideo."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Incompatible con la gonioscopía de cierre angular de 360 grados, la presencia de efusión coroidea y el engrosamiento escleral ecográfico."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Desprendimiento de retina regmatógeno primario que requiere vitrectomía posterior e inyección de gas de emergencia."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "La ecografía demuestra ausencia de desgarros retinianos y confirma efusión coroidea exudativa anular; la vitrectomía clásica está contraindicada."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Tumor de coroides (melanoma coroideo difuso) que indica enucleación ocular inmediata."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La efusión serosa anular simétrica de 360 grados con esclera gruesa difusa no corresponde a una lesión nodular hiperreflectiva sólida."
                    ),
                ),
            ],
            target_competency="Interpretación ecográfica ocular (modo B/UBM) y diagnóstico diferencial de desprendimiento ciliocoroideo",
            clinical_pearl_id="s13256-024-04496-1",
            citation_ref_id="ref-aao-uveal-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_6}-st3",
            case_id=cid_6,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Para el manejo inicial del síndrome de efusión uveal con hipertensión ocular de 48 mmHg por cierre angular "
                "secundario sin bloqueo pupilar, ¿cuál es el abordaje médico indicado por la Academia Americana de Oftalmología (AAO)?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Terapia médica hipotensora combinada: acetazolamida sistémica (oral o IV) más hipotensores tópicos "
                        "(betabloqueantes, agonistas alfa-2) y corticoides tópicos/sistémicos intensivos; evitar mióticos colinérgicos."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La acetazolamida reduce la producción de humor acuoso y los corticoides mitigan la trasudación. La pilocarpina está contraindicada porque relaja la zónula y acentúa el desplazamiento anterior del cristalino."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Instilar pilocarpina al 2% tópica cada 15 minutos en dosis repetidas para intentar abrir mecánicamente el ángulo."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "En glaucomas por desplazamiento anterior del cuerpo ciliar, los mióticos empeoran la rotación anterior y agravan el bloqueo angular."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Realizar iridotomía periférica láser YAG inmediata asumiendo que resolverá el mecanismo de cierre por bloqueo pupilar."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "El mecanismo patogénico es por empuje coroideo posterior ('cierre sin bloqueo pupilar'); la iridotomía no alivia el ángulo y agrega inflamación."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Suspender medicación y proceder directamente a punción de cámara anterior en sala general sin asepsia quirúrgica."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Riesgo extremo de endoftalmitis infecciosa, atalamia y lesión endotelial corneal irreversible."
                    ),
                ),
            ],
            target_competency="Manejo farmacológico hipotensor ocular y contraindicación de mióticos en cierre angular secundario",
            clinical_pearl_id="s13256-024-04496-1",
            citation_ref_id="ref-aao-uveal-001",
        ),
    ]

    # Case 7: s13256-024-04987-9 (Ginecologia/Oncologia, coriocarcinoma pulmonar)
    cid_7 = "s13256-024-04987-9"
    data[cid_7] = [
        MCQStationInternal(
            station_id=f"{cid_7}-st1",
            case_id=cid_7,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Mujer de 31 años con antecedente de aborto espontáneo hace 4 meses consulta en urgencias por hemoptisis recurrente "
                "de moderada cuantía, disnea progresiva de esfuerzo y dolor pleurítico derecho. "
                "Signos vitales: PA 105/65 mmHg, FC 108 lpm, FR 24 rpm, SpO2 93% aire ambiente. "
                "¿Cuál es el triaje prioritario y abordaje diagnóstico sindrómico inicial?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Clasificar como Prioridad I / Emergencia respiratoria con hemoptisis activa; asegurar vía aérea, oxigenoterapia "
                        "para SpO2 > 95%, canalizar vías venosas y solicitar analítica urgente incluyendo beta-hCG cuantitativa sérica "
                        "ante sospecha de metástasis pulmonar de neoplasia trofoblástica gestacional."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "En mujeres en edad fértil con hemoptisis inexplicada y antecedente obstétrico reciente, la medición de beta-hCG cuantitativa es mandatoria para detectar coriocarcinoma pulmonar temprano."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Clasificar como Prioridad IV (Bronquitis aguda estacional); prescribir jarabe antitusivo con codeína y alta domiciliaria con reposo."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Ignora los signos de alarma de hemoptisis activa, taquipnea e hipoxemia, postergando el diagnóstico de una emergencia oncológica potencialmente curable."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Iniciar heparina de bajo peso molecular a dosis plenas anticoagulantes por sospecha presuntiva de tromboembolismo pulmonar "
                        "sin evaluar riesgo de hemorragia pulmonar exanguinante."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La anticoagulación plena ante nódulos trofoblásticos vasculares hiperhemorrágicos puede desencadenar hemorragia alveolar masiva mortal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Asumir tuberculosis pulmonar como única opción diagnóstica y aislar a la paciente sin solicitar pruebas ginecológicas ni de imagen urgente."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Fijación en patología infecciosa omitiendo la anamnesis obstétrica y los marcadores tumorales de rápido acceso."
                    ),
                ),
            ],
            target_competency="Triaje de hemoptisis activa en mujer joven y pesquisa de neoplasia trofoblástica gestacional",
            clinical_pearl_id="s13256-025-05577-5",
            citation_ref_id="ref-acog-hypopara-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_7}-st2",
            case_id=cid_7,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "La tomografía computarizada (TC) de tórax muestra múltiples nódulos pulmonares bilaterales bien circunscritos en "
                "'suelta de globos' con áreas de sangrado perilesional. La prueba rápida de orina es positiva y la beta-hCG cuantitativa "
                "sérica reporta 185,000 mUI/mL. La ecografía transvaginal no evidencia gestación intrauterina pero sí una lesión miometrial "
                "hipervascular focal. ¿Cuál es la interpretación diagnóstica concluyente?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Coriocarcinoma gestacional metastásico a pulmón de alto riesgo según puntuación FIGO/OMS, caracterizado por invasión "
                        "hematógena vascular y producción masiva de beta-hCG."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El patrón nodular en suelta de globos con niveles masivos de beta-hCG y antecedente obstétrico reciente confirma coriocarcinoma metastásico."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Embarazo ectópico tubárico no roto con nódulos pulmonares granulomatosos residuales por micosis antigua."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Valores de beta-hCG de 185,000 mUI/mL son incompatibles con embarazo ectópico simple y subestiman el patrón neoplásico hematógeno evidente."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Carcinoma broncogénico de células no pequeñas primario de pulmón con elevación paraneoplásica inespecífica de gonadotropinas."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "El coriocarcinoma gestacional es el tumor que clásicamente produce cifras masivas de beta-hCG en mujeres jóvenes; asumir cáncer pulmonar primario es un sesgo etario."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Falla ovárica prematura con reacción cruzada de anticuerpos heterófilos que falsea el inmunoensayo de beta-hCG."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "Los inmunoensayos modernos con dilución confirman cifras verdaderas de 185,000 mUI/mL y no justifican las lesiones destructivas en TC."
                    ),
                ),
            ],
            target_competency="Interpretación tomográfica de nódulos en suelta de globos y correlación con beta-hCG cuantitativa",
            clinical_pearl_id="s13256-025-05577-5",
            citation_ref_id="ref-acog-hypopara-001",
        ),
        MCQStationInternal(
            station_id=f"{cid_7}-st3",
            case_id=cid_7,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Tras estratificar a la paciente como Coriocarcinoma Gestacional Metastásico de Alto Riesgo (Score FIGO/OMS >= 7), "
                "¿cuál es la conducta terapéutica de primera línea y de soporte urgente recomendada por los consensos onco-ginecológicos internacionales?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Iniciar poliquimioterapia intravenosa basada en régimen multiagente EMA-CO (etopósido, metotrexato, dactinomicina, "
                        "ciclofosfamida y vincristina) junto con profilaxis de lisis tumoral y soporte hemodinámico."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El coriocarcinoma gestacional de alto riesgo alcanza tasas de curación superiores al 85-90% cuando se instaura precozmente el régimen combinado EMA-CO."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Realizar histerectomía total abdominal de emergencia como único tratamiento curativo definitivo, omitiendo quimioterapia."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "La cirugía aislada no erradica las metástasis pulmonares activas y retrasa innecesariamente el inicio de la quimioterapia sistémica curativa."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Prescribir monoterapia con metotrexato oral a dosis bajas por 5 días para evitar toxicidad medular del régimen combinado."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "La monoterapia está estrictamente reservada para enfermedad de bajo riesgo (score FIGO < 7); en alto riesgo produce quimiorresistencia y desenlace fatal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Indicar radioterapia pulmonar externa bilateral inmediata antes de cualquier tratamiento sistémico."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "La radioterapia pulmonar bilateral genera fibrosis irreversible y toxicidad letal, y no es la modalidad terapéutica primaria de las neoplasias trofoblásticas."
                    ),
                ),
            ],
            target_competency="Estratificación FIGO/OMS y protocolo de poliquimioterapia EMA-CO en coriocarcinoma de alto riesgo",
            clinical_pearl_id="s13256-025-05577-5",
            citation_ref_id="ref-acog-hypopara-001",
        ),
    ]

    # Also build specific station set for s13256-025-05577-5 (Secuelas de ictus hemorrágico)
    cid_stroke = "s13256-025-05577-5"
    data[cid_stroke] = [
        MCQStationInternal(
            station_id=f"{cid_stroke}-st1",
            case_id=cid_stroke,
            station_number=1,
            difficulty_tier="Nivel 1 (Fundacional)",
            clinical_stem=(
                "Paciente de 68 años con antecedente de hematoma intraparenquimatoso talámico hace 2 meses ingresa a consulta "
                "por debilidad motora persistente en hemicuerpo izquierdo, espasticidad y declive cognitivo subjetivo. "
                "Signos vitales: PA 175/105 mmHg, FC 82 lpm, afebril. ¿Cuál es el triaje y detección de peligro inicial?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Clasificar como Prioridad II / Urgencia médica; evaluar control estricto de presión arterial para mitigar "
                        "riesgo de resangrado o recurrencia de ictus y descartar signos de nuevo déficit neurológico agudo."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La hipertensión severa no controlada post-ictus hemorrágico es el principal predictor de resangrado y requiere ajuste terapéutico inmediato."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Prioridad V (Consulta administrativa); ignorar la cifra tensional de 175/105 mmHg y citar en 3 meses."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "Desestima el riesgo crítico de recurrencia vascular en un paciente con secuelas de hemorragia intracraneal."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Indicar vasodilatador sublingual de acción rápida (nifedipino cápsula masticada) en sala de espera."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "El nifedipino sublingual de acción corta está contraindicado por riesgo de hipoperfusión cerebral brusca y empeoramiento del daño isquémico peri-lesional."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Catalogar el cuadro como demencia de Alzheimer primaria irreversible y descartar opciones de neuro-rehabilitación."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "Atribuye el déficit a enfermedad neurodegenerativa idiopática ignorando el origen vascular talámico documentado."
                    ),
                ),
            ],
            target_competency="Detección de factores de riesgo de recurrencia vascular y triaje post-ictus hemorrágico",
            clinical_pearl_id="s13256-025-05577-5",
            citation_ref_id="ref-aha-stroke-rehab-002",
        ),
        MCQStationInternal(
            station_id=f"{cid_stroke}-st2",
            case_id=cid_stroke,
            station_number=2,
            difficulty_tier="Nivel 2 (Intermedio)",
            clinical_stem=(
                "La TC craneal de control muestra reabsorción completa del hematoma con zona residual de encefalomalacia talámica derecha. "
                "En la evaluación funcional, la escala modificada de Rankin (mRS) es 3 (discapacidad moderada; requiere alguna ayuda pero camina sin asistencia). "
                "¿Cuál es la interpretación diagnóstica de las secuelas y pronóstico funcional?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Secuela funcional post-ictus hemorrágico con espasticidad subaguda y déficit sensitivo-motor talámico, "
                        "candidato idóneo a programa multidisciplinario estructurado de rehabilitación motora y cognitiva."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "El mRS de 3 indica potencial significativo de ganancia funcional mediante fisioterapia motora y terapia ocupacional continua."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Estado vegetativo persistente irreversible (mRS 5) sin posibilidades de mejoría neuromuscular."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "Confusión de escala mRS: el paciente camina y tiene mRS 3, muy lejos de discapacidad severa o estado vegetativo."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Hidrocefalia normotensiva aguda que requiere punción lumbar evacuadora repetida diaria."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_DIAGNOSTIC_REASONING,
                    rationale=(
                        "La neuroimagen muestra encefalomalacia focal sin ventriculomegalia desproporcionada ni signos de hidrocefalia."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Parálisis periódica familiar hipopotasémica no relacionada con la lesión vascular cerebral previa."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "El déficit es estrictamente focal (facio-braquio-crural izquierdo) congruente con el daño talámico anatómico previo."
                    ),
                ),
            ],
            target_competency="Evaluación con escala de Rankin modificada (mRS) y estratificación de neuro-rehabilitación",
            clinical_pearl_id="s13256-025-05577-5",
            citation_ref_id="ref-aha-stroke-rehab-002",
        ),
        MCQStationInternal(
            station_id=f"{cid_stroke}-st3",
            case_id=cid_stroke,
            station_number=3,
            difficulty_tier="Nivel 3 (Avanzado)",
            clinical_stem=(
                "Para optimizar la recuperación a largo plazo y prevenir recurrencias según las guías AHA/ASA de rehabilitación post-ictus, "
                "¿cuál es la estrategia combinada prioritaria?"
            ),
            options=[
                MCQOptionInternal(
                    option_id="A",
                    text=(
                        "Terapia física, ocupacional y del lenguaje multimodal intensiva temprana, combinada con control farmacológico "
                        "estricto de PA (meta < 130/80 mmHg) y toxina botulínica si la espasticidad limita la funcionalidad."
                    ),
                    is_correct=True,
                    associated_gap=None,
                    rationale=(
                        "La rehabilitación interdisciplinaria combinada con prevención secundaria estricta de la presión arterial mejora la independencia funcional y previene el resangrado."
                    ),
                ),
                MCQOptionInternal(
                    option_id="B",
                    text=(
                        "Reposo absoluto en cama sin movilización pasiva por 6 meses para prevenir nuevo sangrado talámico."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_INITIAL_MANAGEMENT,
                    rationale=(
                        "El reposo prolongado induce sarcopenia, trombosis venosa profunda, contracturas fijas irreversibles y úlceras por presión."
                    ),
                ),
                MCQOptionInternal(
                    option_id="C",
                    text=(
                        "Iniciar anticoagulación oral con warfarina a dosis plenas para INR 2.5-3.5 como prevención rutinaria en secuela hemorrágica sin fibrilación auricular."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_LAB_INTERPRETATION,
                    rationale=(
                        "La anticoagulación en ictus hemorrágico sin indicación cardioembólica mayor está contraindicada por riesgo letal de hemorragia cerebral."
                    ),
                ),
                MCQOptionInternal(
                    option_id="D",
                    text=(
                        "Diferir todo plan terapéutico y de fisioterapia hasta que el paciente logre bipedestación espontánea sin apoyo."
                    ),
                    is_correct=False,
                    associated_gap=CognitiveGap.GAP_TRIAGE_SEVERITY,
                    rationale=(
                        "La rehabilitación tardía pierde la ventana crítica de neuroplasticidad cerebral de los primeros 6 meses post-ictus."
                    ),
                ),
            ],
            target_competency="Rehabilitación multimodal, manejo de espasticidad y metas de prevención secundaria AHA/ASA",
            clinical_pearl_id="s13256-025-05577-5",
            citation_ref_id="ref-aha-stroke-rehab-002",
        ),
    ]

    return data


class MCQRepository:
    def __init__(self):
        self._stations: dict[str, list[MCQStationInternal]] = build_raw_case_stations()
        self._aliases: dict[str, str] = dict(CASE_ALIASES)

    def _resolve_case_id(self, case_id: str) -> Optional[str]:
        if case_id in self._stations:
            return case_id
        alias = self._aliases.get(case_id)
        if alias and alias in self._stations:
            return alias
        # Reverse check
        for k, v in self._aliases.items():
            if v == case_id and k in self._stations:
                return k
        return None

    def get_internal_stations_for_case(self, case_id: str) -> list[MCQStationInternal]:
        resolved = self._resolve_case_id(case_id)
        if not resolved:
            return []
        stations = self._stations[resolved]
        # Return stations ensuring case_id matches the requested case_id
        result: list[MCQStationInternal] = []
        for st in stations:
            st_copy = st.model_copy(deep=True)
            st_copy.case_id = case_id
            st_copy.station_id = f"{case_id}-st{st.station_number}"
            result.append(st_copy)
        return result

    def get_stations_for_case(self, case_id: str) -> list[MCQStationStudent]:
        internal_stations = self.get_internal_stations_for_case(case_id)
        return [st.to_student() for st in internal_stations]

    def get_station(self, case_id: str, station_number: int) -> Optional[MCQStationInternal]:
        stations = self.get_internal_stations_for_case(case_id)
        for st in stations:
            if st.station_number == station_number:
                return st
        return None

    def get_student_station(self, case_id: str, station_number: int) -> Optional[MCQStationStudent]:
        st = self.get_station(case_id, station_number)
        if not st:
            return None
        return st.to_student()


mcq_repository = MCQRepository()
