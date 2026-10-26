"""
Catalogo curado de Perlas Clinicas de Alta Rentabilidad para los 7 casos reales de OdyssMedic.
Cada perla entrega un concepto didactico conciso (1-2 oraciones) derivado de la evidencia del caso.
"""

CLINICAL_PEARLS: dict[str, str] = {
    "s13256-019-2334-y": (
        "Ante una anemia hemolitica microangiopatica con trombocitopenia e insuficiencia renal aguda "
        "en ausencia de diarrea sanguinolenta (Shiga-toxina negativa), sospechar Sindrome Uremico Hemolitico "
        "Atipico (aHUS) por desregulacion del complemento e iniciar terapia de recambio plasmatico urgente o bloqueo de C5."
    ),
    "s13256-022-03392-w": (
        "La capecitabina puede desencadenar hiperglucemia extrema e hipopotasemia severa por toxicidad metabolico-tubular. "
        "La suspension inmediata del antineoplasico y la correccion intravenosa prioritaria del potasio deben preceder "
        "a la insulina a dosis altas para evitar arritmias ventriculares por hipopotasemia de entrada celular."
    ),
    "s13256-023-04294-1": (
        "El llanto o risa involuntaria tras un ictus de tronco encefalico o cerebelo orienta a Afecto Pseudobulbar (PBA) "
        "por perdida de control cortico-subcortical, no a depresion mayor reactiva; su tratamiento de primera linea "
        "consiste en inhibidores selectivos de la recaptacion de serotonina (ej. escitalopram)."
    ),
    "s13256-024-04496-1": (
        "El sindrome de efusion uveal cursa con desprendimiento ciliocoroideo e hipertension ocular aguda por cierre angular. "
        "El control inicial requiere hipotensores sistemicos (acetazolamida) y topicos combinados con corticoides, "
        "reservando la descompresion escleral para casos refractarios."
    ),
    "s13256-025-05577-5": (
        "El manejo de las secuelas motoras, espasticidad y declive cognitivo cronico tras un ictus hemorragico "
        "se fundamenta en rehabilitacion multimodal intensiva (fisioterapia, terapia ocupacional y del habla) "
        "junto con control estricto de la presion arterial para mitigar el riesgo de recurrencia."
    ),
    "s13256-025-05650-z": (
        "El hipoparatiroidismo primario en el tercer trimestre del embarazo requiere titular suplementos de calcio "
        "y vitamina D para mantener la calcemia en el limite inferior de la normalidad, evitando hipercalciuria materna "
        "y previniendo tetania intraparto o hipocalcemia neonatal de rebote."
    ),
    "s13256-026-05974-4": (
        "La aparicion de disartria u otro deficit neurologico agudo con fiebre y rash en una mujer joven sugiere "
        "Lupus Eritematoso Sistemico con compromiso neuropsiquiatrico (NPSLE); exige confirmacion serologica inmediata "
        "e inicio de pulsos de metilprednisolona combinados con ciclofosfamida."
    ),
}

def get_clinical_pearl(case_id: str) -> str:
    """Devuelve la perla clinica de alto rendimiento para el caso solicitado."""
    return CLINICAL_PEARLS.get(
        case_id,
        "La evaluacion clinica sistematica y la priorizacion de medidas de soporte vital son fundamentales antes de iniciar terapias dirigidas."
    )
