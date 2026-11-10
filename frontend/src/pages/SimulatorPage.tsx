import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import type {
  CaseDetail,
  MCQStation,
  MCQEvaluationResult,
  CognitiveGapTag,
} from '../types/api';
import { casesApi, evaluationApi } from '../services/api';
import {
  VignettePlayer,
  StationStepper,
  OptionCard,
  ClinicalPearlModal,
} from '../components/simulator';

export interface SimulatorPageProps {
  initialCaseId?: string;
  onBackToDashboard: () => void;
  className?: string;
}

interface MockCaseEntry {
  id: string;
  specialtyName: string;
  detail: CaseDetail;
  stations: MCQStation[];
  stationEvaluations: Record<
    number,
    Record<
      string,
      {
        is_correct: boolean;
        correct_option_id: string;
        xp_earned: number;
        gap_tag: CognitiveGapTag | null;
        gap_title: string | null;
        gap_explanation: string;
        clinical_pearl: string;
        citation: string;
      }
    >
  >;
}

// Fallback high-yield clinical cases
const MOCK_CASES_CATALOG: Record<string, MockCaseEntry> = {
  'case-nefro-001': {
    id: 'case-nefro-001',
    specialtyName: 'Nefrologia Clinica (KDIGO 2024)',
    detail: {
      id: 'case-nefro-001',
      title: 'Microangiopatia Trombotica (aHUS) y Falla Renal Aguda KDIGO 3',
      display_title: 'Sindrome Uremico Hemolitico Atipico con Falla Renal Aguda',
      specialty_id: 'nefrologia',
      difficulty_level: 'Nivel 1 (Fundacional)',
      patient_age: 24,
      patient_gender: 'Femenino',
      chief_complaint:
        'Anuria brusca de 12 horas, ictericia escleral, palidez mucocutanea marcada y fiebre.',
      anamnesis:
        'Paciente mujer de 24 anos sin antecedentes de enfermedad cronica, acude a emergencia traida por familiares por cuadro de 72 horas caracterizado por astenia profunda, nauseas, vomitos de contenido alimentario, coluria y reduccion drastica del volumen urinario.\n\nEn las ultimas 12 horas no ha presentado diuresis espontanea tras colocacion de sonda. Refiere cuadro febril no cuantificado y dolor abdominal difuso de inicio subito hace 2 dias. Niega hematuria macroscopica previa, diarrea disenterica reciente o consumo de AINEs.',
      physical_exam:
        'General: Regular estado general, marcada palidez mucocutanea con tinte icterico escleral evidente. Diaforetica y febril.\nRespiratorio: Murmullo vesicular conservado en ambos campos pulmonares, sin estertores ni sibilancias.\nCardiovascular: Taquicardia sinusal regular, ruidos cardiacos hiperdinamicos, no se auscultan soplos patologicos.\nAbdomen: Blando, depresible, levemente doloroso a la palpacion difusa en flancos, sin peritonismo, ruidos hidroaereos normales.\nNeurologico: Despierta, orientada en tiempo, espacio y persona. Glasgow 14/15 con leve enlentecimiento psicomotor sin signos de focalizacion.',
      vitals: {
        bp: '165/100',
        hr: 112,
        rr: 24,
        spo2: 96,
        temp: 38.4,
        gcs: 14,
      },
      initial_labs: {
        'Hemoglobina': {
          value: '6.8 g/dL (Anemia severa)',
          reference: '12.0 - 15.5 g/dL',
          severity: 'critical',
        },
        'Plaquetas': {
          value: '28,000 /uL (Trombocitopenia de consumo)',
          reference: '150,000 - 450,000 /uL',
          severity: 'critical',
        },
        'Creatinina Serica': {
          value: '4.2 mg/dL (Criterio KDIGO 3)',
          reference: '0.6 - 1.1 mg/dL',
          severity: 'critical',
        },
        'Urea / BUN': {
          value: '128 mg/dL (BUN 60 mg/dL)',
          reference: '15 - 45 mg/dL',
          severity: 'warning',
        },
        'Deshidrogenasa Lactica (LDH)': {
          value: '1,450 UI/L (Hemolisis intravascular)',
          reference: '140 - 280 UI/L',
          severity: 'critical',
        },
        'Frotis de Sangre Periferica': {
          value: 'Esquistocitos 4.2% campo (Positivo)',
          reference: '< 0.5%',
          severity: 'critical',
        },
        'Bilirrubina Indirecta': {
          value: '3.1 mg/dL',
          reference: '< 0.8 mg/dL',
          severity: 'warning',
        },
        'Haptoglobina': {
          value: '< 5 mg/dL (Consumo total)',
          reference: '30 - 200 mg/dL',
          severity: 'critical',
        },
      },
    },
    stations: [
      {
        station_number: 1,
        title: 'Estacion 1: Fundacional (Triaje y Priorizacion)',
        competency_focus: 'GAP_TRIAGE_SEVERITY',
        clinical_question:
          'Paciente femenina de 24 anos ingresa con anemia hemolitica microangiopatica, trombocitopenia severa, falla renal oligurica y cifras de presion arterial de 165/100 mmHg. ¿Cual es la priorizacion de triaje y la conducta medica inmediata mas adecuada?',
        options: [
          {
            id: 'A',
            text: 'Clasificar como Prioridad I (Emergencia hemodinamico-renal); canalizar dos vias venosas perifericas de grueso calibre, monitorizacion multiparametrica continua y colocacion de sonda Foley para gasto horario estricto.',
          },
          {
            id: 'B',
            text: 'Clasificar como Prioridad III (Urgencia menor); diferir accesos venosos e indicar paracetamol oral para la fiebre esperando evaluacion en sala general.',
          },
          {
            id: 'C',
            text: 'Administrar bolo intravenoso masivo de 2,500 mL de solucion salina 0.9% en 30 minutos sin verificar estado hemodinamico ni realizar ecografia de vena cava.',
          },
          {
            id: 'D',
            text: 'Asumir sindrome febril con gastroenteritis bacteriana inespecifica y prescribir hidratacion oral ambulatoria con analgesicos.',
          },
        ],
      },
      {
        station_number: 2,
        title: 'Estacion 2: Intermedio (Diagnostico Diferencial)',
        competency_focus: 'GAP_DIAGNOSTIC_REASONING',
        clinical_question:
          'Los examenes confirman esquistocitos 4.2%, LDH 1450 UI/L, Coombs directo negativo y actividad de ADAMTS13 normal (58%). Coprocultivo y toxina Shiga negativos. ¿Cual es el diagnostico fisiopatologico de mayor precision?',
        options: [
          {
            id: 'A',
            text: 'Sindrome Uremico Hemolitico Atipico (aHUS) mediado por desregulacion genetica o adquirida de la via alternativa del complemento.',
          },
          {
            id: 'B',
            text: 'Purpura Trombocitopenica Trombotica (PTT) por deficiencia severa adquirida de ADAMTS13 con actividad < 10%.',
          },
          {
            id: 'C',
            text: 'Coagulacion Intravascular Diseminada (CID) aguda secundaria a foco infeccioso bacteriano no evidente.',
          },
          {
            id: 'D',
            text: 'Anemia hemolitica autoinmune idiopatica por anticuerpos IgG de tipo caliente.',
          },
        ],
      },
      {
        station_number: 3,
        title: 'Estacion 3: Avanzado (Manejo Farmacologico y Procedimientos)',
        competency_focus: 'GAP_INITIAL_MANAGEMENT',
        clinical_question:
          'Se confirma sospecha de aHUS con injuria renal aguda en etapa 3 anurica. ¿Cual es el tratamiento de eleccion y primera linea segun las guias internacionales KDIGO 2024?',
        options: [
          {
            id: 'A',
            text: 'Iniciar precozmente anticuerpo monoclonal inhibidor del complemento terminal C5 (Eculizumab o Ravulizumab) y preparar soporte dialitico si persisten criterios de urgencia uremica.',
          },
          {
            id: 'B',
            text: 'Indicar transfusion profilactica seriada de plaquetas para mantener recuento superior a 100,000 /uL de manera rutinaria.',
          },
          {
            id: 'C',
            text: 'Administrar bolos endovenosos diarios de furosemida 240 mg para forzar la diuresis sin iniciar terapia etiologica.',
          },
          {
            id: 'D',
            text: 'Iniciar anticoagulacion terapeutica plena con heparina no fraccionada en dosis de tromboembolismo pulmonar masivo.',
          },
        ],
      },
    ],
    stationEvaluations: {
      1: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Conducta ejemplar. La combinacion de anuria aguda e hipertension en una microangiopatia trombotica requiere clasificacion de Prioridad I inmediata.',
          clinical_pearl:
            'En anuria aguda con sospecha de MAT, el triaje inmediato y el control horario estricto previenen la sobrecarga pulmonar y la muerte precoz.',
          citation:
            'KDIGO Clinical Practice Guideline for Acute Kidney Injury 2024; Kidney Int 105(4):S1-S120.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_TRIAGE_SEVERITY',
          gap_title: 'Triaje y Reconocimiento de Gravedad',
          gap_explanation:
            'Subestimo la severidad de una falla renal anurica con microangiopatia trombotica, retardando la estabilizacion hospitalaria de urgencia.',
          clinical_pearl:
            'Toda anuria < 15 ml/h asociada a trombocitopenia y anemia es una emergencia medica que jamas debe esperar en consulta regular.',
          citation:
            'KDIGO Clinical Practice Guideline for Acute Kidney Injury 2024; Kidney Int 105(4):S1-S120.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La sobrecarga masiva de volumen en un paciente anurico con presion arterial de 165/100 mmHg precipita edema agudo de pulmon y colapso respiratorio.',
          clinical_pearl:
            'En falla renal anurica, los fluidos deben administrarse guiados por metas dinamicas y ecografia pulmonar, jamas en bolos ciegos.',
          citation:
            'KDIGO Clinical Practice Guideline for Acute Kidney Injury 2024; Kidney Int 105(4):S1-S120.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'Cierre prematuro del caso atribuyendo anuria y plaquetopenia a un cuadro infeccioso simple sin evaluar la microangiopatia.',
          clinical_pearl:
            'La asociacion de anemia, plaquetopenia y falla renal aguda debe alertar inmediatamente sobre microangiopatia trombotica.',
          citation:
            'KDIGO Clinical Practice Guideline for Acute Kidney Injury 2024; Kidney Int 105(4):S1-S120.',
        },
      },
      2: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Excelente razonamiento. Con ADAMTS13 > 10% y toxina Shiga negativa, el diagnostico de exclusion y precision es aHUS mediado por complemento.',
          clinical_pearl:
            'ADAMTS13 > 10% descarta PTT clasica; toxina Shiga negativa descarta SHU tipico, confirmando el diagnostico de aHUS mediado por via alternativa.',
          citation:
            'KDIGO Controversies Conference on Complement-Mediated Kidney Diseases 2024; Kidney Int 106(2):189-204.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_LAB_INTERPRETATION',
          gap_title: 'Interpretacion de Examenes y Labs',
          gap_explanation:
            'En la PTT clasica, la actividad de ADAMTS13 debe ser marcadamente deficiente (< 10%). En este caso la actividad se encuentra preservada en 58%.',
          clinical_pearl:
            'Una actividad de ADAMTS13 mayor al 10% invalida el diagnostico de Purpura Trombocitopenica Trombotica grave.',
          citation:
            'KDIGO Controversies Conference on Complement-Mediated Kidney Diseases 2024; Kidney Int 106(2):189-204.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'En la CID hay alteracion franca de los tiempos de coagulacion (TP y TTPA prolongados, fibrinogeno bajo), ausentes en este cuadro.',
          clinical_pearl:
            'A diferencia de la CID, las microangiopatias tromboticas puras (SHU/PTT) cursan con pruebas de coagulacion estandar conservadas.',
          citation:
            'ISTH Guidelines for the Diagnosis and Treatment of DIC; J Thromb Haemost 2023; 21(5):1230-1245.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_LAB_INTERPRETATION',
          gap_title: 'Interpretacion de Examenes y Labs',
          gap_explanation:
            'El test de Coombs directo negativo descarta hemolisis inmune autoinmune, confirmando hemolisis microangiopatica mecanica.',
          clinical_pearl:
            'La presencia de esquistocitos con prueba de Coombs negativa orienta univocamente a dano mecanico endotelial microvascular.',
          citation:
            'British Society for Haematology Guidelines on the Diagnosis of TMA; Br J Haematol 2023.',
        },
      },
      3: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Respuesta impecable. Los inhibidores de C5 (Eculizumab/Ravulizumab) han transformado el pronostico del aHUS logrando recuperacion funcional renal.',
          clinical_pearl:
            'El inicio temprano de inhibidores de C5 dentro de las primeras 48 horas es el factor determinante para rescatar la tasa de filtracion glomerular en aHUS.',
          citation:
            'KDIGO 2024 Clinical Practice Guideline for Glomerular Diseases; Kidney Int 105(3S):S1-S210.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La transfusion de plaquetas en microangiopatia trombotica esta contraindicada a menos que exista hemorragia activa potencialmente mortal, ya que exacerba la trombosis microvascular.',
          clinical_pearl:
            'Nunca transfundir plaquetas en MAT de forma profilactica: actua como lena al fuego al abastecer sustrato para nueva formacion de trombos.',
          citation:
            'AABB / KDIGO Transfusion Safety Consensus Guidelines 2023.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La furosemida a altas dosis no revierte la microangiopatia endotelial y retrasa el inicio de la terapia inmunotarget o de hemodialisis urgente.',
          clinical_pearl:
            'Forzar diuresis con diureticos de asa en falla renal anurica establecida no reduce la mortalidad ni evita la necesidad dialitica.',
          citation:
            'KDIGO Clinical Practice Guideline for Acute Kidney Injury 2024.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La anticoagulacion terapeutica plena en una paciente con trombocitopenia profunda (28,000) incrementa desproporcionadamente el riesgo de sangrado fatal.',
          clinical_pearl:
            'La trombosis en MAT es por activacion endotelial/plaquetaria y no por deficit anticoagulante; la heparina no esta indicada sin trombosis macrovascular probada.',
          citation:
            'KDIGO Clinical Practice Guideline for Glomerular Diseases 2024.',
        },
      },
    },
  },

  'case-endo-002': {
    id: 'case-endo-002',
    specialtyName: 'Endocrinologia y Metabolismo (ADA 2024)',
    detail: {
      id: 'case-endo-002',
      title: 'Cetoacidosis Diabetica Severa con Hipokalemia Inicial (ADA 2024)',
      display_title: 'Cetoacidosis Diabetica Severa con Riesgo de Arritmia por Hipokalemia',
      specialty_id: 'endocrinologia',
      difficulty_level: 'Nivel 2 (Intermedio)',
      patient_age: 31,
      patient_gender: 'Masculino',
      chief_complaint:
        'Respiracion profunda y taquipneica (Kussmaul), deshidratacion severa y glucemia > 500 mg/dL.',
      anamnesis:
        'Paciente varon de 31 anos con antecedente de Diabetes Mellitus tipo 1 diagnosticada hace 8 anos, quien suspendio la aplicacion de insulina basal hace 48 horas debido a desabastecimiento durante un viaje de guardia.\n\nIngresa a sala de reanimacion con compromiso progresivo del estado de alerta, debilidad muscular intensa, polidipsia extrema, nauseas y multiples episodios emeticos en las ultimas 24 horas.',
      physical_exam:
        'General: Paciente somnoliento, deshidratado severo con signo del pliegue positivo en torax, mucosa oral intensamente seca y aliento cetonico franco.\nRespiratorio: Taquipneico marcado con respiracion forzada y profunda de Kussmaul (FR 32 rpm). Murmullo vesicular pasa en ambos campos.\nCardiovascular: Taquicardia sinusal regular (FC 124 lpm), pulsos debiles, llenado capilar prolongado en 3 segundos. PA 90/60 mmHg.\nAbdomen: Doloroso difuso a la palpacion profunda sin defensa peritoneal involuntaria ni rebote.\nNeurologico: Soporoso, localiza estimulos pero responde ordenes verbales simples con lentitud, Glasgow 13/15.',
      vitals: {
        bp: '90/60',
        hr: 124,
        rr: 32,
        spo2: 94,
        temp: 37.2,
        gcs: 13,
      },
      initial_labs: {
        'Glucosa Serica': {
          value: '540 mg/dL (Hiperglicemia severa)',
          reference: '70 - 100 mg/dL',
          severity: 'critical',
        },
        'Gases Arteriales (pH)': {
          value: '7.12 (Acidosis metabolica grave)',
          reference: '7.35 - 7.45',
          severity: 'critical',
        },
        'Bicarbonato Serico (HCO3)': {
          value: '9.0 mEq/L (Consumo de base)',
          reference: '22 - 26 mEq/L',
          severity: 'critical',
        },
        'Anion Gap': {
          value: '24.0 mEq/L (Elevado)',
          reference: '8 - 12 mEq/L',
          severity: 'critical',
        },
        'Potasio Serico (K+)': {
          value: '3.2 mEq/L (Hipokalemia riesgosa)',
          reference: '3.5 - 5.0 mEq/L',
          severity: 'critical',
        },
        'Beta-Hidroxibutirato en Sangre': {
          value: '4.8 mmol/L (Cetonemia marcada)',
          reference: '< 0.6 mmol/L',
          severity: 'critical',
        },
      },
    },
    stations: [
      {
        station_number: 1,
        title: 'Estacion 1: Fundacional (Triaje y Reconocimiento de Gravedad)',
        competency_focus: 'GAP_TRIAGE_SEVERITY',
        clinical_question:
          'Paciente de 31 anos con DM1, respiracion de Kussmaul, presion 90/60 mmHg y glucemia 540 mg/dL. Los electrolitos iniciales reportan Potasio en 3.2 mEq/L. ¿Cual es la prioridad terapeutica critica e inmediata?',
        options: [
          {
            id: 'A',
            text: 'Reanimacion hidrica con cloruro de sodio 0.9% (1,000 a 1,500 mL/hora) e iniciar reposicion urgente de potasio, postergando la infusion de insulina hasta que el potasio supere 3.3 mEq/L.',
          },
          {
            id: 'B',
            text: 'Administrar un bolo intravenoso rapido de 10 UI de insulina regular inmediatamente para detener la cetogenesis sin esperar fluidos.',
          },
          {
            id: 'C',
            text: 'Clasificar como urgencia menor e indicar reposicion de potasio por via oral en comprimidos de liberacion lenta.',
          },
          {
            id: 'D',
            text: 'Infundir 100 mEq de bicarbonato de sodio al 8.4% en bolo sin administrar ningun cristaloide.',
          },
        ],
      },
      {
        station_number: 2,
        title: 'Estacion 2: Intermedio (Razonamiento Diagnostico Diferencial)',
        competency_focus: 'GAP_DIAGNOSTIC_REASONING',
        clinical_question:
          'El perfil muestra pH 7.12, HCO3 9 mEq/L, Anion Gap 24 mEq/L y beta-hidroxibutirato 4.8 mmol/L. ¿Cual es la interpretacion diagnostica correcta segun el consenso ADA 2024?',
        options: [
          {
            id: 'A',
            text: 'Cetoacidosis diabetica severa con brecha anionica elevada; el deficit corporal total de potasio esta enmascarado por la acidosis extracelular.',
          },
          {
            id: 'B',
            text: 'Estado Hiperosmolar Hiperglicemico puro, descartando cetoacidosis debido a la cifra de glucosa mayor a 500 mg/dL.',
          },
          {
            id: 'C',
            text: 'Acidosis tubular renal tipo 2 proximal con perdida urinaria aislada de bicarbonato.',
          },
          {
            id: 'D',
            text: 'Acidosis lactica pura sin participacion de cetoacidos.',
          },
        ],
      },
      {
        station_number: 3,
        title: 'Estacion 3: Avanzado (Manejo Farmacologico y Procedimientos)',
        competency_focus: 'GAP_INITIAL_MANAGEMENT',
        clinical_question:
          'Tras recibir 2 litros de cristaloides y 30 mEq de KCl en las soluciones, el potasio asciende a 3.8 mEq/L. ¿Cual es el esquema de insulinoterapia intravenosa de eleccion segun estandares ADA?',
        options: [
          {
            id: 'A',
            text: 'Iniciar perfusion continua de insulina regular a 0.1 UI/kg/h (o bolo de 0.14 UI/kg seguido de 0.1 UI/kg/h) con meta de descenso glucemico de 50 a 75 mg/dL por hora.',
          },
          {
            id: 'B',
            text: 'Prescribir insulina NPH subcutanea cada 12 horas como unica modalidad de manejo agudo.',
          },
          {
            id: 'C',
            text: 'Administrar insulina ultrarrapida en bolos endovenosos directos de 30 unidades cada 30 minutos.',
          },
          {
            id: 'D',
            text: 'Iniciar sulfonilureas por sonda nasogastrica y mantener al paciente sin ningun tipo de insulina.',
          },
        ],
      },
    ],
    stationEvaluations: {
      1: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Decision vital. Iniciar insulina con potasio menor a 3.3 mEq/L induce hipokalemia severa letal y arritmias ventriculares fatales.',
          clinical_pearl:
            'Regla de oro ADA: Jamas iniciar insulina si el K serico es menor a 3.3 mEq/L. Primero reponer potasio e hidratar.',
          citation:
            'ADA Standards of Care in Diabetes 2024: Diabetes Care 47(Suppl. 1):S258-S281.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'Administrar insulina con un potasio en 3.2 mEq/L traslada el potasio al espacio intracelular, provocando paro cardiaco en asistolia o fibrilacion ventricular.',
          clinical_pearl:
            'La insulina es un potente inductor de entrada de K a la celula; administrada en hipokalemia puede ser mortal.',
          citation:
            'ADA Standards of Care in Diabetes 2024; Diabetes Care 47(Suppl. 1):S258-S281.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_TRIAGE_SEVERITY',
          gap_title: 'Triaje y Reconocimiento de Gravedad',
          gap_explanation:
            'Subestimo la severidad de un shock hipovolemico asociado a cetoacidosis severa con compromiso del sensorio.',
          clinical_pearl:
            'La cetoacidosis diabetica con hipotension y alteracion del sensorio es clasificada como Prioridad I en el area de shock trauma.',
          citation:
            'ADA Standards of Care in Diabetes 2024; Diabetes Care 47(Suppl. 1):S258-S281.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'El bicarbonato no esta indicado con pH > 7.00 y agrava la hipokalemia por desplazamiento intracelular de cationes.',
          clinical_pearl:
            'El bicarbonato solo se considera con pH < 6.90 y siempre acompanado de vigilancia extrema del potasio.',
          citation:
            'ADA Standards of Care in Diabetes 2024; Diabetes Care 47(Suppl. 1):S258-S281.',
        },
      },
      2: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Excelente sintesis diagnostica. A pesar del potasio inicial normal-bajo, existe un deficit corporal total de potasio de 300 a 500 mEq.',
          clinical_pearl:
            'En cetoacidosis, el potasio serico no refleja las reservas celulares: casi siempre existe deficit corporal severo.',
          citation:
            'ADA Standards of Care in Diabetes 2024; Diabetes Care 47(Suppl. 1):S258-S281.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'El EHH puro cursa con acidosis leve o ausente (pH > 7.30, HCO3 > 18) y cetonemia minima. Este paciente tiene acidosis severa (pH 7.12) y cetonas francas.',
          clinical_pearl:
            'La presencia de anion gap elevado y cetonemia alta define cetoacidosis con independencia de la magnitud de la glucemia.',
          citation:
            'ADA Standards of Care in Diabetes 2024; Diabetes Care 47(Suppl. 1):S258-S281.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'La acidosis tubular renal cursa con brecha anionica normal (hipercloremica), mientras que aqui el anion gap es marcadamente elevado (24).',
          clinical_pearl:
            'El anion gap > 12 orienta a presencia de cetoacidos, lactato o toxicos, nunca a ATR clasica.',
          citation:
            'KDIGO Clinical Practice Guideline 2024.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_LAB_INTERPRETATION',
          gap_title: 'Interpretacion de Examenes y Labs',
          gap_explanation:
            'El beta-hidroxibutirato elevado (4.8 mmol/L) comprueba la genesis cetonica del disturbio metabolico.',
          clinical_pearl:
            'El beta-hidroxibutirato es el marcador estandar de oro para diagnostico y resolucion de cetoacidosis diabetica.',
          citation:
            'ADA Standards of Care in Diabetes 2024.',
        },
      },
      3: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Conducta protocolar exacta segun guias ADA. La meta de descenso controlado previene el edema cerebral iatrogenico.',
          clinical_pearl:
            'El descenso glucemico no debe exceder 100 mg/dL por hora para evitar gradientes osmoticos cerebrales y edema celular.',
          citation:
            'ADA Standards of Care in Diabetes 2024; Diabetes Care 47(Suppl. 1):S258-S281.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La absorcion subcutanea en shock o hipoperfusion periferica es erratica e ineficaz para revertir la cetogenesis aguda.',
          clinical_pearl:
            'En cetoacidosis severa, la insulinoterapia debe ser siempre intravenosa continua para garantizar biodisponibilidad predecible.',
          citation:
            'ADA Standards of Care in Diabetes 2024.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'Los bolos masivos causan caidas precipitadas de osmolaridad plasmatica, colapso osmotico y edema cerebral agudo.',
          clinical_pearl:
            'El descenso gradual y monitoreado de la glucemia es la piedra angular para salvaguardar el sistema nervioso central.',
          citation:
            'ADA Standards of Care in Diabetes 2024.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'Los antidiabeticos orales estan formalmente contraindicados en crisis hiperglicemicas agudas y en pacientes con DM1.',
          clinical_pearl:
            'La DM1 se caracteriza por carencia absoluta de insulina; las sulfonilureas son ineficaces y potencialmente toxicas.',
          citation:
            'ADA Standards of Care in Diabetes 2024.',
        },
      },
    },
  },

  'case-neuro-003': {
    id: 'case-neuro-003',
    specialtyName: 'Neurologia y Neurocriticos (AHA/ASA 2023)',
    detail: {
      id: 'case-neuro-003',
      title: 'Accidente Cerebrovascular Isquemico Agudo en Ventana Terapeutica',
      display_title: 'Ictus Isquemico Agudo de Gran Vaso en Ventana Terapeutica (AHA/ASA)',
      specialty_id: 'neurologia',
      difficulty_level: 'Nivel 1 (Fundacional)',
      patient_age: 66,
      patient_gender: 'Masculino',
      chief_complaint:
        'Deficit motor facio-braquio-crural derecho y afasia motora subita iniciados hace 75 minutos.',
      anamnesis:
        'Paciente varon de 66 anos con historia de hipertension arterial y fibrilacion auricular cronica sin anticoagulacion regular. Mientras tomaba desayuno a las 07:30 am, presento subitamente imposibilidad para hablar y caida brusca del brazo derecho.\n\nFue auxiliado de inmediato por su conyuge y trasladado a emergencias en unidad de soporte avanzado, arribando a los 75 minutos desde la hora de ultima normalidad conocida.',
      physical_exam:
        'General: Afebril, bien hidratado, con presion arterial 175/95 mmHg, sin apremio respiratorio.\nRespiratorio: Murmullo vesicular pasa bien en ambos hemitorax, via aerea totalmente despejada.\nCardiovascular: Ruidos cardiacos arrítmicos de frecuencia variable (FA), no soplos audibles ni galope.\nAbdomen: Blando, indoloro, ruidos hidroaereos presentes.\nNeurologico: Despierto, fija la mirada, comprende ordenes sencillas pero afasia motora de Broca severa con disartria. Paralisis facial central derecha, plejia de extremidad superior derecha (0/5) y paresia crural derecha (2/5). Escala NIHSS de ingreso estimada en 14 puntos.',
      vitals: {
        bp: '175/95',
        hr: 88,
        rr: 18,
        spo2: 98,
        temp: 36.8,
        gcs: 14,
      },
      initial_labs: {
        'Tomografia Cerebral Simple (TC)': {
          value: 'Sin hemorragia intracraneal aguda, ASPECTS 9/10, signo de ACM hiperdensa izquierda',
          reference: 'Sin sangrado agudo',
          severity: 'critical',
        },
        'Glucosa Capilar en Triaje': {
          value: '118 mg/dL (Descarta hipoglucemia)',
          reference: '70 - 140 mg/dL',
          severity: 'normal',
        },
        'INR / Perfil Coagulacion': {
          value: '1.1 (Sin efecto anticoagulante)',
          reference: '0.8 - 1.2',
          severity: 'normal',
        },
        'Plaquetas': {
          value: '220,000 /uL',
          reference: '150,000 - 450,000 /uL',
          severity: 'normal',
        },
      },
    },
    stations: [
      {
        station_number: 1,
        title: 'Estacion 1: Fundacional (Triaje y Priorizacion)',
        competency_focus: 'GAP_TRIAGE_SEVERITY',
        clinical_question:
          'Paciente de 66 anos con inicio de deficit focal motor y afasia hace 75 minutos, NIHSS 14 y TA 175/95 mmHg. ¿Cual es la activacion protocolar y prioridad de atencion hospitalaria?',
        options: [
          {
            id: 'A',
            text: 'Activar Codigo Ictus / Stroke de inmediato; traslado directo a tomografia cerebral sin contraste y preparacion de ventana trombolitica manteniendo TA < 185/110 mmHg.',
          },
          {
            id: 'B',
            text: 'Solicitar interconsulta de rutina al servicio de neurologia y ordenar resonancia magnetica ambulatoria para el dia siguiente.',
          },
          {
            id: 'C',
            text: 'Administrar bolo de nitroprusiato intravenoso para normalizar bruscamente la presion por debajo de 120/80 mmHg.',
          },
          {
            id: 'D',
            text: 'Asumir cuadro conversivo funcional y derivar a evaluacion psiquiatrica con sedantes orales.',
          },
        ],
      },
      {
        station_number: 2,
        title: 'Estacion 2: Intermedio (Diagnostico Diferencial)',
        competency_focus: 'GAP_DIAGNOSTIC_REASONING',
        clinical_question:
          'La tomografia computarizada craneal descarta hemorragia y muestra ASPECTS 9/10. Han transcurrido 90 minutos desde el inicio. ¿Cual es la elegibilidad trombolitica segun directrices AHA/ASA 2023?',
        options: [
          {
            id: 'A',
            text: 'Candidato ideal para tratamiento trombolitico intravenoso con Alteplasa (0.9 mg/kg) o Tenecteplasa (0.25 mg/kg) dentro de la ventana de oro (< 4.5 horas).',
          },
          {
            id: 'B',
            text: 'Contraindicado absolutamente por registrar una presion arterial sistolica mayor a 140 mmHg.',
          },
          {
            id: 'C',
            text: 'No elegible debido a que el paciente supera los 60 anos de edad.',
          },
          {
            id: 'D',
            text: 'Indicar acido acetilsalicilico 300 mg via oral antes de considerar cualquier trombolitico endovenoso.',
          },
        ],
      },
      {
        station_number: 3,
        title: 'Estacion 3: Avanzado (Manejo Farmacologico y Procedimientos)',
        competency_focus: 'GAP_INITIAL_MANAGEMENT',
        clinical_question:
          'Se inicia la infusion de trombolitico intravenoso. La Angio-TC multimodal documenta una oclusion en tandem del segmento M1 de la arteria cerebral media izquierda. ¿Cual es la indicacion intervencionista prioritaria?',
        options: [
          {
            id: 'A',
            text: 'Trombectomia mecanica endovascular inmediata con stent retriever y aspiracion directa en sala de hemodinamia / neurointervencionismo.',
          },
          {
            id: 'B',
            text: 'Suspender el trombolitico y trasladar a piso de medicina interna sin intervencion adicional.',
          },
          {
            id: 'C',
            text: 'Realizar puncion lumbar urgente para evaluar presion de apertura de liquido cefalorraquideo.',
          },
          {
            id: 'D',
            text: 'Administrar heparina de bajo peso molecular a dosis terapeuticas plenas concomitantemente con la trombolisis.',
          },
        ],
      },
    ],
    stationEvaluations: {
      1: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Activacion perfecta. Tiempo es cerebro: cada minuto de retraso en la atencion del ictus destruye 1.9 millones de neuronas.',
          clinical_pearl:
            'La meta puerta-aguja para inicio de trombolisis es menor a 45-60 minutos desde la llegada al hospital.',
          citation:
            'AHA/ASA Guidelines for the Early Management of Patients With Acute Ischemic Stroke 2023; Stroke 54(12):e580-e620.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_TRIAGE_SEVERITY',
          gap_title: 'Triaje y Reconocimiento de Gravedad',
          gap_explanation:
            'Retardar la neuroimagen de emergencia condena al paciente a perder la ventana terapeutica de 4.5 horas.',
          clinical_pearl:
            'En el ictus hiperagudo, ningun tramite burocratico debe postergar la adquisicion inmediata de la tomografia computarizada.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La reduccion abrupta de la PA por debajo de 140 mmHg en fase hiperaguda colapsa la perfusion de la penumbra isquemica cerebral.',
          clinical_pearl:
            'En ictus isquemico agudo, solo se trata la hipertension si supera 185/110 mmHg para trombolisis o 220/120 sin trombolisis.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'La fibrilacion auricular con afasia y plejia aguda es un cuadro organico embolicoclasico de maxima prioridad.',
          clinical_pearl:
            'Nunca atribuir sintomas neurologicos focales agudos a causa psicogena sin neuroimagen y glucemia normales previas.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
      },
      2: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Excelente seleccion. Cumple todos los criterios de inclusion para trombolisis endovenosa dentro de las 4.5 horas.',
          clinical_pearl:
            'La trombolisis intravenosa dentro de las 3 a 4.5 horas incrementa sustancialmente la probabilidad de independencia funcional a los 90 dias.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_LAB_INTERPRETATION',
          gap_title: 'Interpretacion de Examenes y Labs',
          gap_explanation:
            'El limite de seguridad tensional para trombolisis es 185/110 mmHg. Su presion (175/95) es perfectamente segura para infusion.',
          clinical_pearl:
            'El punto de corte de exclusion tensional para trombolisis es PAS >= 185 o PAD >= 110 mmHg, no 140 mmHg.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'La edad avanzada no es una contraindicacion para trombolisis; los pacientes ancianos obtienen un beneficio neto significativo.',
          clinical_pearl:
            'No existe limite superior de edad para la administracion de tromboliticos en ictus isquemico agudo segun las guias actuales.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La aspirina oral debe diferirse 24 horas tras trombolisis para no elevar el riesgo de transformacion hemorragica.',
          clinical_pearl:
            'Los antiagregantes plaquetarios y anticoagulantes deben suspenderse durante las primeras 24 horas posteriores a la trombolisis.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
      },
      3: {
        A: {
          is_correct: true,
          correct_option_id: 'A',
          xp_earned: 25,
          gap_tag: null,
          gap_title: null,
          gap_explanation:
            'Indicacion de maximo nivel de evidencia (Clase I, Nivel A). La trombectomia mecanica en oclusion de gran vaso de circulacion anterior salva vidas.',
          clinical_pearl:
            'La trombectomia mecanica combinada con trombolisis previa es el estandar de oro para oclusiones de arteria carotida interna o segmento M1.',
          citation:
            'AHA/ASA Stroke Guidelines 2023; Stroke 54(12):e580-e620.',
        },
        B: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La trombolisis aislada solo recanaliza el 30% de oclusiones M1; omitir la trombectomia deja al paciente con discapacidad severa permanente.',
          clinical_pearl:
            'La trombectomia mecanica logra tasas de recanalizacion TICI 2b/3 superiores al 85% en oclusion de gran vaso.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        C: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_DIAGNOSTIC_REASONING',
          gap_title: 'Razonamiento Diagnostico Clinico',
          gap_explanation:
            'La puncion lumbar inmediatamente despues de trombolisis acarrea alto riesgo de hematoma espinal epidural o subaracnoideo.',
          clinical_pearl:
            'Procedimientos invasivos no compresibles como puncion lumbar estan formalmente contraindicados tras infusion trombolitica.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
        D: {
          is_correct: false,
          correct_option_id: 'A',
          xp_earned: 5,
          gap_tag: 'GAP_INITIAL_MANAGEMENT',
          gap_title: 'Manejo Terapeutico Inicial',
          gap_explanation:
            'La heparina plena junto a la trombolisis dispara el riesgo de hemorragia intracraneal letal sin mejorar el pronostico isquemico.',
          clinical_pearl:
            'Nunca combinar anticoagulacion parenteral plena simultanea con tromboliticos en las primeras 24 horas del ictus.',
          citation:
            'AHA/ASA Stroke Guidelines 2023.',
        },
      },
    },
  },
};

const BACKEND_TO_MOCK_FALLBACK: Record<string, string> = {
  's13256-019-2334-y': 'case-nefro-001',
  's13256-022-03392-w': 'case-endo-002',
  's13256-023-04294-1': 'case-neuro-003',
  's13256-025-05577-5': 'case-neuro-003',
  's13256-026-05974-4': 'case-nefro-001',
  's13256-025-05650-z': 'case-endo-002',
  's13256-024-04496-1': 'case-neuro-003',
  's13256-017-1522-8': 'case-endo-002',
  's13256-018-1897-4': 'case-neuro-003',
};

export const SimulatorPage: React.FC<SimulatorPageProps> = ({
  initialCaseId = 's13256-019-2334-y',
  onBackToDashboard,
  className = '',
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || 's13256-019-2334-y'
  );

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [stations, setStations] = useState<MCQStation[]>([]);
  const [currentStationIndex, setCurrentStationIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [evaluationResult, setEvaluationResult] =
    useState<MCQEvaluationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [completedStations, setCompletedStations] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  // Timer and modal reveal references
  const timerRef = useRef<number | null>(null);
  const modalDelayRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialCaseId) {
      setSelectedCaseId(initialCaseId);
    }
  }, [initialCaseId]);

  useEffect(() => {
    return () => {
      if (modalDelayRef.current) {
        window.clearTimeout(modalDelayRef.current);
      }
    };
  }, []);

  // Load clinical case and stations
  const loadCaseData = async (caseId: string) => {
    if (modalDelayRef.current) {
      window.clearTimeout(modalDelayRef.current);
      modalDelayRef.current = null;
    }
    setIsLoading(true);
    setEvaluationResult(null);
    setIsModalOpen(false);
    setSelectedOptionId(null);
    setCurrentStationIndex(0);
    setCompletedStations([]);
    setTimeSpentSeconds(0);

    const fallbackKey =
      MOCK_CASES_CATALOG[caseId]
        ? caseId
        : BACKEND_TO_MOCK_FALLBACK[caseId] || 'case-nefro-001';

    try {
      const [detailRes, stationsRes] = await Promise.allSettled([
        casesApi.getById(caseId),
        casesApi.getStations(caseId),
      ]);

      let loadedDetail: CaseDetail | null = null;
      let loadedStations: MCQStation[] = [];

      if (detailRes.status === 'fulfilled' && detailRes.value) {
        loadedDetail = detailRes.value;
      }

      if (
        stationsRes.status === 'fulfilled' &&
        stationsRes.value &&
        stationsRes.value.length > 0
      ) {
        loadedStations = stationsRes.value;
      }

      if (loadedDetail && loadedStations.length > 0) {
        setCaseDetail(loadedDetail);
        setStations(loadedStations);
        setIsUsingFallback(false);
      } else {
        const mockEntry =
          MOCK_CASES_CATALOG[fallbackKey] || MOCK_CASES_CATALOG['case-nefro-001'];
        setCaseDetail(mockEntry.detail);
        setStations(mockEntry.stations);
        setIsUsingFallback(true);
      }
    } catch {
      const mockEntry =
        MOCK_CASES_CATALOG[fallbackKey] || MOCK_CASES_CATALOG['case-nefro-001'];
      setCaseDetail(mockEntry.detail);
      setStations(mockEntry.stations);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData(selectedCaseId);
  }, [selectedCaseId]);

  // Active Timer: tracks seconds spent on the current station
  useEffect(() => {
    if (
      !isModalOpen &&
      !isSubmitting &&
      !isLoading &&
      caseDetail &&
      evaluationResult === null
    ) {
      timerRef.current = window.setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isModalOpen, isSubmitting, isLoading, caseDetail, evaluationResult]);

  const currentStation = stations[currentStationIndex];
  const stationNumber = currentStation?.station_number ?? currentStationIndex + 1;

  // Handle clinical decision submission
  const handleSubmitDecision = async () => {
    if (!selectedOptionId || isSubmitting || !caseDetail || !currentStation) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Attempt API submission
      const apiResult = await evaluationApi.submitMCQ({
        case_id: caseDetail.id || caseDetail.case_id || selectedCaseId,
        station_number: stationNumber,
        selected_option_id: selectedOptionId,
        time_spent_seconds: timeSpentSeconds,
      });

      setEvaluationResult(apiResult);
      if (!completedStations.includes(stationNumber)) {
        setCompletedStations((prev) => [...prev, stationNumber]);
      }
      modalDelayRef.current = window.setTimeout(() => {
        setIsModalOpen(true);
      }, 340);
    } catch {
      // 2. Resilient fallback evaluation from local high-yield catalog
      const fbKey =
        MOCK_CASES_CATALOG[selectedCaseId]
          ? selectedCaseId
          : BACKEND_TO_MOCK_FALLBACK[selectedCaseId] || 'case-nefro-001';
      const catalogEntry =
        MOCK_CASES_CATALOG[fbKey] || MOCK_CASES_CATALOG['case-nefro-001'];
      const stEval =
        catalogEntry.stationEvaluations[stationNumber]?.[selectedOptionId];

      const fallbackResult: MCQEvaluationResult = stEval
        ? {
            is_correct: stEval.is_correct,
            selected_option_id: selectedOptionId,
            correct_option_id: stEval.correct_option_id,
            xp_earned: stEval.xp_earned,
            gap_tag: stEval.gap_tag,
            gap_title: stEval.gap_title,
            gap_explanation: stEval.gap_explanation,
            clinical_pearl: stEval.clinical_pearl,
            medical_reference: {
              title: stEval.citation,
              year: 2024,
              guideline_source: 'OdyssMedic Evidence Engine',
              pmid_doi: '',
              key_takeaway: stEval.clinical_pearl,
            },
            leveling_prescription: {
              new_level: stEval.is_correct ? 'Nivel 2' : 'Nivel 1',
              mastery_delta: stEval.is_correct ? 5 : -2,
              spaced_repetition_scheduled: !stEval.is_correct,
              next_review_interval: !stEval.is_correct ? 'D7' : null,
            },
          }
        : {
            is_correct: selectedOptionId === 'A',
            selected_option_id: selectedOptionId,
            correct_option_id: 'A',
            xp_earned: selectedOptionId === 'A' ? 25 : 5,
            gap_tag:
              selectedOptionId === 'A' ? null : 'GAP_DIAGNOSTIC_REASONING',
            gap_title:
              selectedOptionId === 'A'
                ? null
                : 'Razonamiento Diagnostico Clinico',
            gap_explanation:
              selectedOptionId === 'A'
                ? 'Respuesta fundamentada en la evidencia clinica de emergencia.'
                : 'La opcion seleccionada retrasa el manejo optimo segun guias de practica clinica.',
            clinical_pearl:
              'La priorizacion temprana y el reconocimiento de signos de alarma reducen la mortalidad hospitalaria.',
            medical_reference: {
              title: 'Guias Clinicas OdyssMedic 2024',
              year: 2024,
              guideline_source: 'OdyssMedic Protocol Archive',
              pmid_doi: '',
              key_takeaway: 'Evaluacion estructurada de triaje hospitalario.',
            },
            leveling_prescription: {
              new_level: 'Nivel 2',
              mastery_delta: 5,
              spaced_repetition_scheduled: false,
              next_review_interval: null,
            },
          };

      setEvaluationResult(fallbackResult);
      if (!completedStations.includes(stationNumber)) {
        setCompletedStations((prev) => [...prev, stationNumber]);
      }
      modalDelayRef.current = window.setTimeout(() => {
        setIsModalOpen(true);
      }, 340);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next Station handler
  const handleNextStation = () => {
    if (modalDelayRef.current) {
      window.clearTimeout(modalDelayRef.current);
      modalDelayRef.current = null;
    }
    setIsModalOpen(false);
    setEvaluationResult(null);
    setSelectedOptionId(null);
    setTimeSpentSeconds(0);

    // Scroll to top of station smoothly
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (currentStationIndex < stations.length - 1) {
      setCurrentStationIndex((prev) => prev + 1);
    } else {
      // Completed all stations -> return to dashboard
      onBackToDashboard();
    }
  };

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`min-h-screen bg-[#FDFCFA] text-[#0B252E] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 ${
        evaluationResult !== null && !isModalOpen ? 'pb-28 sm:pb-24' : ''
      } ${className}`}
    >
      {/* 1. Header Toolbar: Back navigation, Case Switcher, Live Timer */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-6 rounded-2xl bg-white border border-[#DCE5E3]">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-full bg-[#F2F7F6] border border-[#DCE5E3] hover:bg-[#ECF6F4] text-[#0B252E] text-xs font-medium flex items-center gap-2 transition-colors"
            title="Volver a Mundo Clinico"
          >
            <ArrowLeft className="w-4 h-4 text-[#0E6F65]" />
            <span>Volver a Mundo Clinico</span>
          </button>

          {/* Specialty Case Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7D83] hidden md:inline">
              Escenario:
            </span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-[#FDFCFA] border border-[#DCE5E3] rounded-full px-4 py-2 text-xs font-medium text-[#0B252E] focus:outline-none focus:border-[#0E6F65] transition-colors max-w-[260px] sm:max-w-xs truncate"
              aria-label="Selector de casos de simulacion"
            >
              <option value="s13256-019-2334-y">
                Nefrologia · Microangiopatia Trombotica y AKI (KDIGO)
              </option>
              <option value="s13256-022-03392-w">
                Endocrinologia · Crisis Glucemica y Electrolitos (ADA)
              </option>
              <option value="s13256-023-04294-1">
                Neurologia · Ictus Isquemico en Ventana (AHA/ASA)
              </option>
              <option value="s13256-025-05577-5">
                Neurologia · Hemorragia Intracerebral Aguda
              </option>
              <option value="s13256-026-05974-4">
                Reumatologia · Lupus Neuropsiquiatrico (EULAR)
              </option>
              <option value="s13256-025-05650-z">
                Gineco-Obstetricia · Trastorno Metabolico Gestacional
              </option>
              <option value="s13256-024-04496-1">
                Oftalmologia · Urgencia e Hipertension Ocular
              </option>
            </select>
          </div>
        </div>

        {/* Decision Timer */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {isUsingFallback && (
            <span className="text-xs text-[#8A6116]">
              Repositorio clinico local
            </span>
          )}

          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2F7F6] border border-[#DCE5E3] text-[#0B252E] text-xs"
            title="Tiempo dedicado a la estacion actual"
          >
            <Clock className="w-3.5 h-3.5 text-[#0E6F65]" />
            <span className="text-[#6B7D83]">Tiempo:</span>
            <span className="font-semibold text-sm text-[#0E6F65]">
              {formatTimer(timeSpentSeconds)}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Station Stepper Progress Component */}
      <section aria-label="Progreso de estaciones">
        <StationStepper
          currentStation={stationNumber}
          totalStations={stations.length > 0 ? stations.length : 3}
          completedStations={completedStations}
          competencyFocus={currentStation?.competency_focus}
        />
      </section>

      {/* 3. Main Workspace: Vignette Player + Question / Option Decision Area */}
      {isLoading || !caseDetail ? (
        <div className="p-16 rounded-3xl bg-white border border-[#DCE5E3] text-center space-y-4">
          <RefreshCw className="w-7 h-7 text-[#0E6F65] animate-spin mx-auto" />
          <p className="text-sm text-[#4A5D64]">
            Preparando expediente clinico y constantes de ingreso...
          </p>
        </div>
      ) : (
        <main className="space-y-6">
          {/* A. Clinical Scenario & Anamnesis View */}
          <section aria-label="Historia clinica y constantes">
            <VignettePlayer
              caseDetail={caseDetail}
              isCollapsedDefaultOnMobile={true}
            />
          </section>

          {/* B. Active Station Question Stem and Options */}
          {currentStation && (
            <section
              key={stationNumber}
              className="rounded-3xl bg-white border border-[#DCE5E3] p-5 sm:p-8 space-y-6 animate-fade-in-up"
              aria-label="Pregunta clinica y opciones de decision"
            >
              {/* Question Header */}
              <div className="space-y-2 border-b border-[#EDF2F0] pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#0E6F65] uppercase tracking-[0.14em] font-semibold">
                    <HelpCircle className="w-4 h-4 text-[#0E6F65]" />
                    <span>
                      Estacion {stationNumber} de {stations.length} · Decision clinica
                    </span>
                  </div>

                  <span className="text-xs text-[#6B7D83]">
                    Selecciona la conducta mejor fundamentada
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#0B252E] leading-relaxed">
                  {currentStation.clinical_question}
                </h3>
              </div>

              {/* Options List with Animated Correct / Incorrect Evaluation States */}
              <div className="space-y-3">
                {currentStation.options.map((option, idx) => {
                  const isOptSelected = selectedOptionId === option.id;
                  const normOptId = String(option.id || '').toLowerCase();
                  const normCorrectId = String(
                    evaluationResult?.correct_option_id || ''
                  ).toLowerCase();

                  let evalState:
                    | 'idle'
                    | 'correct'
                    | 'incorrect'
                    | 'revealed-correct'
                    | 'dimmed' = 'idle';

                  if (evaluationResult !== null) {
                    if (isOptSelected && evaluationResult.is_correct) {
                      evalState = 'correct';
                    } else if (isOptSelected && !evaluationResult.is_correct) {
                      evalState = 'incorrect';
                    } else if (!isOptSelected && normCorrectId && normOptId === normCorrectId) {
                      evalState = 'revealed-correct';
                    } else {
                      evalState = 'dimmed';
                    }
                  }

                  return (
                    <OptionCard
                      key={option.id || idx}
                      option={option}
                      index={idx}
                      isSelected={isOptSelected}
                      onSelect={() => setSelectedOptionId(option.id)}
                      disabled={isSubmitting || evaluationResult !== null}
                      evaluationState={evalState}
                    />
                  );
                })}
              </div>

              {/* Submission Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#EDF2F0]">
                <div className="text-xs text-[#4A5D64] flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      evaluationResult !== null
                        ? 'bg-[#0E6F65]'
                        : selectedOptionId
                          ? 'bg-[#0E6F65]'
                          : 'bg-[#C4D3CF]'
                    }`}
                  />
                  <span>
                    {evaluationResult !== null
                      ? 'Decision clinica evaluada. Puedes consultar la retroalimentacion o avanzar.'
                      : selectedOptionId
                        ? 'Alternativa seleccionada. Lista para confirmar.'
                        : 'Elige una alternativa para habilitar la confirmacion.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitDecision}
                  disabled={
                    !selectedOptionId ||
                    isSubmitting ||
                    evaluationResult !== null
                  }
                  className={`w-full sm:w-auto px-7 py-3 rounded-full font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors ${
                    !selectedOptionId ||
                    isSubmitting ||
                    evaluationResult !== null
                      ? 'bg-[#F2F7F6] text-[#8FA1A6] border border-[#DCE5E3] cursor-not-allowed'
                      : 'bg-[#0E6F65] hover:bg-[#0A564E] text-white shadow-xs'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Evaluando criterio clinico...</span>
                    </>
                  ) : evaluationResult !== null ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#0E6F65]" />
                      <span>Estacion evaluada</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirmar decision clinica</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          )}
        </main>
      )}

      {/* 4. Sticky Bottom Action Bar when evaluation is complete and modal is closed */}
      {evaluationResult !== null && !isModalOpen && (
        <aside
          aria-label="Barra de accion de estacion evaluada"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#FDFCFA]/95 border-t border-[#DCE5E3] shadow-lg backdrop-blur-sm px-4 py-3.5 sm:px-6 transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  evaluationResult.is_correct ? 'bg-[#0E6F65]' : 'bg-[#9E3F42]'
                }`}
              />
              <div>
                <span className="font-serif text-sm font-semibold text-[#0B252E] block">
                  Estacion evaluada · Decision registrada
                </span>
                <span className="text-xs text-[#4A5D64]">
                  {evaluationResult.is_correct
                    ? 'Conducta clinica acertada'
                    : 'Oportunidad de refuerzo detectada en tu ruta'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-white hover:bg-[#F2F7F6] border border-[#DCE5E3] text-xs sm:text-sm font-medium text-[#0B252E] flex items-center justify-center gap-2 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-[#0E6F65] shrink-0" />
                <span>Ver retroalimentacion</span>
              </button>

              <button
                type="button"
                onClick={
                  currentStationIndex < stations.length - 1
                    ? handleNextStation
                    : onBackToDashboard
                }
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <span>
                  {currentStationIndex < stations.length - 1
                    ? 'Siguiente estacion'
                    : 'Finalizar caso'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 5. Retrospective Evaluation Feedback Modal */}
      {evaluationResult && (
        <ClinicalPearlModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          result={evaluationResult}
          stationNumber={stationNumber}
          totalStations={stations.length}
          onNextStation={handleNextStation}
          onFinishCase={onBackToDashboard}
        />
      )}
    </div>
  );
};

export default SimulatorPage;