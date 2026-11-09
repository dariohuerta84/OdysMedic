import React, { useState } from 'react';
import {
  HeartPulse,
  FileText,
  Stethoscope,
  TestTubes,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import type { CaseDetail, VitalSigns } from '../../types/api';
import { VitalSignBadge } from '../common/VitalSignBadge';

export interface VignettePlayerProps {
  caseDetail: CaseDetail;
  isCollapsedDefaultOnMobile?: boolean;
  className?: string;
}

interface ParsedVital {
  label: string;
  value: string | number;
  unit?: string;
  severity: 'normal' | 'warning' | 'critical';
}

interface LabRow {
  test: string;
  result: string;
  reference: string;
  severity: 'normal' | 'warning' | 'critical';
}

/**
 * Heuristic analyzer for vital signs according to OdyssMedic emergency triage rules
 */
function analyzeVitals(vitals?: VitalSigns): ParsedVital[] {
  if (!vitals) return [];

  const list: ParsedVital[] = [];

  // 1. Presion Arterial (PA / BP)
  const rawBp = vitals.bp ?? vitals.pa ?? vitals.blood_pressure;
  const bpVal = typeof rawBp === 'object' && rawBp !== null ? rawBp.value : rawBp;
  if (bpVal) {
    const bpStr = String(bpVal).trim();
    let bpSeverity: 'normal' | 'warning' | 'critical' = 'normal';
    const match = bpStr.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const sbp = parseInt(match[1], 10);
      const dbp = parseInt(match[2], 10);
      if (sbp >= 180 || dbp >= 120 || sbp < 90) {
        bpSeverity = 'critical';
      } else if (sbp >= 140 || dbp >= 90 || sbp < 100) {
        bpSeverity = 'warning';
      }
    }
    list.push({
      label: 'PA',
      value: bpStr.replace(/\s*mmHg/i, ''),
      unit: 'mmHg',
      severity: bpSeverity,
    });
  }

  // 2. Frecuencia Cardiaca (FC / HR)
  const rawHr = vitals.hr ?? vitals.fc ?? vitals.heart_rate;
  const hrVal = typeof rawHr === 'object' && rawHr !== null ? rawHr.value : rawHr;
  if (hrVal !== undefined && hrVal !== null) {
    const hrNum = parseInt(String(hrVal).replace(/[^\d]/g, ''), 10);
    let hrSeverity: 'normal' | 'warning' | 'critical' = 'normal';
    if (!isNaN(hrNum)) {
      if (hrNum > 130 || hrNum < 40) {
        hrSeverity = 'critical';
      } else if (hrNum > 100 || hrNum < 50) {
        hrSeverity = 'warning';
      }
    }
    list.push({
      label: 'FC',
      value: !isNaN(hrNum) ? hrNum : String(hrVal),
      unit: 'lpm',
      severity: hrSeverity,
    });
  }

  // 3. Frecuencia Respiratoria (FR / RR)
  const rawRr = vitals.rr ?? vitals.fr ?? vitals.respiratory_rate;
  const rrVal = typeof rawRr === 'object' && rawRr !== null ? rawRr.value : rawRr;
  if (rrVal !== undefined && rrVal !== null) {
    const rrNum = parseInt(String(rrVal).replace(/[^\d]/g, ''), 10);
    let rrSeverity: 'normal' | 'warning' | 'critical' = 'normal';
    if (!isNaN(rrNum)) {
      if (rrNum > 30 || rrNum < 10) {
        rrSeverity = 'critical';
      } else if (rrNum > 22 || rrNum < 12) {
        rrSeverity = 'warning';
      }
    }
    list.push({
      label: 'FR',
      value: !isNaN(rrNum) ? rrNum : String(rrVal),
      unit: 'rpm',
      severity: rrSeverity,
    });
  }

  // 4. Saturacion de Oxigeno (SatO2 / SpO2)
  const rawSpo2 =
    vitals.spo2 ??
    vitals.sato2 ??
    vitals.oxygen_saturation ??
    vitals.o2_sat;
  const spo2Val =
    typeof rawSpo2 === 'object' && rawSpo2 !== null ? rawSpo2.value : rawSpo2;
  if (spo2Val !== undefined && spo2Val !== null) {
    const spo2Num = parseInt(String(spo2Val).replace(/[^\d]/g, ''), 10);
    let spo2Severity: 'normal' | 'warning' | 'critical' = 'normal';
    if (!isNaN(spo2Num)) {
      if (spo2Num < 92) {
        spo2Severity = 'critical';
      } else if (spo2Num < 95) {
        spo2Severity = 'warning';
      }
    }
    list.push({
      label: 'SatO2',
      value: !isNaN(spo2Num) ? spo2Num : String(spo2Val),
      unit: '%',
      severity: spo2Severity,
    });
  }

  // 5. Temperatura Corporal (Temp / T)
  const rawTemp = vitals.temp ?? vitals.temperatura ?? vitals.temperature ?? vitals.t;
  const tempVal =
    typeof rawTemp === 'object' && rawTemp !== null ? rawTemp.value : rawTemp;
  if (tempVal !== undefined && tempVal !== null) {
    const tempNum = parseFloat(String(tempVal).replace(/[^\d.]/g, ''));
    let tempSeverity: 'normal' | 'warning' | 'critical' = 'normal';
    if (!isNaN(tempNum)) {
      if (tempNum >= 39.5) {
        tempSeverity = 'critical';
      } else if (tempNum >= 38.3 || tempNum < 35.5) {
        tempSeverity = 'warning';
      }
    }
    list.push({
      label: 'Temp',
      value: !isNaN(tempNum) ? tempNum.toFixed(1) : String(tempVal),
      unit: '°C',
      severity: tempSeverity,
    });
  }

  // 6. Escala de Glasgow (GCS / Glasgow)
  const rawGcs = vitals.gcs ?? vitals.glasgow;
  const gcsVal =
    typeof rawGcs === 'object' && rawGcs !== null ? rawGcs.value : rawGcs;
  if (gcsVal !== undefined && gcsVal !== null) {
    const match = String(gcsVal).match(/^(\d{1,2})/);
    const gcsNum = match ? parseInt(match[1], 10) : NaN;
    let gcsSeverity: 'normal' | 'warning' | 'critical' = 'normal';
    if (!isNaN(gcsNum)) {
      if (gcsNum <= 8) {
        gcsSeverity = 'critical';
      } else if (gcsNum < 15) {
        gcsSeverity = 'warning';
      }
    }
    list.push({
      label: 'Glasgow',
      value: !isNaN(gcsNum) ? `${gcsNum}/15` : String(gcsVal),
      severity: gcsSeverity,
    });
  }

  return list;
}

function parseLabValue(resultStr: string): number {
  const normalized = resultStr
    .replace(/(\d+),(\d{1,2})(?!\d)/g, '$1.$2')
    .replace(/,/g, '');
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : NaN;
}

function parseLabResults(initialLabs?: Record<string, any> | any[]): LabRow[] {
  if (!initialLabs) return [];

  const rows: LabRow[] = [];

  if (Array.isArray(initialLabs)) {
    initialLabs.forEach((item, index) => {
      if (typeof item === 'string') {
        rows.push({
          test: `Panel ${index + 1}`,
          result: item,
          reference: 'Referencia estandar',
          severity:
            item.toLowerCase().includes('critico') ||
            item.toLowerCase().includes('urgente')
              ? 'critical'
              : item.toLowerCase().includes('elevad') ||
                  item.toLowerCase().includes('bajo') ||
                  item.toLowerCase().includes('anormal')
                ? 'warning'
                : 'normal',
        });
      } else if (typeof item === 'object' && item !== null) {
        const valStr = item.value || item.result || JSON.stringify(item);
        rows.push({
          test: item.test || item.name || `Examen ${index + 1}`,
          result: valStr,
          reference: item.reference || item.reference_range || 'Normal',
          severity: item.severity || (valStr.toLowerCase().includes('critico') ? 'critical' : 'normal'),
        });
      }
    });
    return rows;
  }

  if (typeof initialLabs === 'object') {
    Object.entries(initialLabs).forEach(([key, val]) => {
      let resultStr = '';
      let refStr = 'Normal';
      let sev: 'normal' | 'warning' | 'critical' = 'normal';

      if (typeof val === 'object' && val !== null) {
        resultStr = String(val.value ?? val.result ?? JSON.stringify(val));
        refStr = String(val.reference ?? val.reference_range ?? 'Rango estandar');
        if (val.severity) {
          sev = val.severity;
        } else if (val.is_critical || val.status === 'critical') {
          sev = 'critical';
        } else if (val.is_abnormal || val.status === 'warning') {
          sev = 'warning';
        }
      } else {
        resultStr = String(val);
      }

      const lowerKey = key.toLowerCase();
      const lowerRes = resultStr.toLowerCase();

      if (
        sev === 'normal' &&
        (lowerRes.includes('critico') ||
          lowerRes.includes('muy alto') ||
          lowerRes.includes('severo') ||
          lowerRes.includes('grave'))
      ) {
        sev = 'critical';
      } else if (
        sev === 'normal' &&
        (lowerRes.includes('alto') ||
          lowerRes.includes('elevad') ||
          lowerRes.includes('bajo') ||
          lowerRes.includes('anormal') ||
          lowerRes.includes('positivo'))
      ) {
        sev = 'warning';
      }

      if (lowerKey.includes('creatinina')) {
        refStr = '0.6 - 1.2 mg/dL';
        const num = parseLabValue(resultStr);
        if (!isNaN(num)) {
          if (num >= 3.0) sev = 'critical';
          else if (num > 1.3) sev = 'warning';
        }
      } else if (lowerKey.includes('potasio') || lowerKey === 'k') {
        refStr = '3.5 - 5.0 mEq/L';
        const num = parseLabValue(resultStr);
        if (!isNaN(num)) {
          if (num > 5.8 || num < 2.8) sev = 'critical';
          else if (num > 5.0 || num < 3.5) sev = 'warning';
        }
      } else if (lowerKey.includes('urea') || lowerKey.includes('bun')) {
        refStr = '15 - 45 mg/dL';
        const num = parseLabValue(resultStr);
        if (!isNaN(num) && num > 80) sev = 'warning';
      } else if (
        (lowerKey.includes('hemoglobina') || lowerKey === 'hb') &&
        !lowerKey.includes('glicosilada') &&
        !lowerKey.includes('a1c')
      ) {
        refStr = '12.0 - 16.0 g/dL';
        const num = parseLabValue(resultStr);
        if (!isNaN(num)) {
          if (num < 7.5) sev = 'critical';
          else if (num < 11.0) sev = 'warning';
        }
      } else if (lowerKey.includes('plaquetas') || lowerKey.includes('platelet')) {
        refStr = '150,000 - 450,000 /uL';
        const num = parseLabValue(resultStr);
        if (!isNaN(num)) {
          if (num < 50000) sev = 'critical';
          else if (num < 100000) sev = 'warning';
        }
      } else if (lowerKey.includes('leucocitos') || lowerKey.includes('wbc')) {
        refStr = '4,500 - 10,500 /uL';
        const num = parseLabValue(resultStr);
        if (!isNaN(num)) {
          if (num > 20000 || num < 2000) sev = 'critical';
          else if (num > 11000 || num < 4000) sev = 'warning';
        }
      } else if (lowerKey.includes('ph') && !lowerKey.includes('uro')) {
        refStr = '7.35 - 7.45';
        const num = parseLabValue(resultStr);
        if (!isNaN(num)) {
          if (num < 7.25 || num > 7.55) sev = 'critical';
          else if (num < 7.35 || num > 7.45) sev = 'warning';
        }
      }

      rows.push({
        test: key,
        result: resultStr,
        reference: refStr,
        severity: sev,
      });
    });
  }

  return rows;
}

function parsePhysicalExamSystems(examText: string): Array<{ title: string; detail: string }> {
  if (!examText) return [];

  const systemKeywords = [
    { key: 'General', regex: /(?:General|Estado general|Aspecto general)\s*:\s*/i },
    { key: 'Respiratorio', regex: /(?:Respiratorio|Aparato respiratorio|Pulmonar)\s*:\s*/i },
    { key: 'Cardiovascular', regex: /(?:Cardiovascular|Aparato cardiovascular|Cardiaco)\s*:\s*/i },
    { key: 'Abdomen', regex: /(?:Abdomen|Aparato gastrointestinal|Gastrointestinal)\s*:\s*/i },
    { key: 'Neurologico', regex: /(?:Neurologico|Neurológico|Sistema nervioso)\s*:\s*/i },
  ];

  const hasSystemHeaders = systemKeywords.some((item) => item.regex.test(examText));

  if (!hasSystemHeaders) {
    return examText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, idx) => ({
        title: idx === 0 ? 'Examen fisico general' : `Hallazgo clinico ${idx + 1}`,
        detail: p,
      }));
  }

  const result: Array<{ title: string; detail: string }> = [];
  const lines = examText.split(/\n|(?=(?:General|Respiratorio|Cardiovascular|Abdomen|Neurologico|Neurológico)\s*:)/i);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0 && colonIdx < 30) {
      const header = trimmed.substring(0, colonIdx).trim();
      const content = trimmed.substring(colonIdx + 1).trim();
      result.push({
        title: header,
        detail: content,
      });
    } else {
      result.push({
        title: 'Hallazgos adicionales',
        detail: trimmed,
      });
    }
  });

  return result.length > 0 ? result : [{ title: 'Examen fisico', detail: examText }];
}

export const VignettePlayer: React.FC<VignettePlayerProps> = ({
  caseDetail,
  isCollapsedDefaultOnMobile = true,
  className = '',
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(
    !isCollapsedDefaultOnMobile
  );

  const vitalsList = analyzeVitals(caseDetail.vitals);
  const labRows = parseLabResults(caseDetail.initial_labs);
  const physicalSystems = parsePhysicalExamSystems(caseDetail.physical_exam);

  const anamnesisParagraphs = caseDetail.anamnesis
    ? caseDetail.anamnesis.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  const formattedSpecialty = caseDetail.specialty_id
    ? caseDetail.specialty_id.replace(/_/g, ' ')
    : null;

  return (
    <article
      className={`rounded-3xl bg-white border border-[#DCE5E3] overflow-hidden transition-all ${className}`}
      aria-label="Expediente clinico del paciente"
    >
      {/* 1. Header: Patient Demographics & Chief Complaint */}
      <header className="p-5 sm:p-7 border-b border-[#E7EEEC] bg-[#FDFCFA]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5D64]">
              {formattedSpecialty && (
                <>
                  <span className="uppercase tracking-[0.16em] font-semibold text-[#0E6F65]">
                    {formattedSpecialty}
                  </span>
                  <span className="text-[#9AA8AD]">·</span>
                </>
              )}
              <span>
                Paciente de {caseDetail.patient_age} anos ({caseDetail.patient_gender})
              </span>
              <span className="text-[#9AA8AD]">·</span>
              <span className="text-[#6B7D83]">
                {caseDetail.difficulty_level || 'Nivel 1'}
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#0B252E] leading-snug">
              {caseDetail.display_title || caseDetail.title}
            </h2>
          </div>

          {/* Chief Complaint Soft Pastel Callout */}
          <div className="p-4 rounded-2xl bg-[#FBF1F1]/85 border border-[#EED7D7] max-w-md shrink-0">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#9E3F42] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E3F42] block">
                  Motivo principal de ingreso
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#0B252E] leading-relaxed">
                  {caseDetail.chief_complaint || 'Ingreso hospitalario para valoracion clinica.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Vital Signs Strip */}
        <div className="mt-5 pt-4 border-t border-[#EDF2F0]">
          <div className="flex items-center gap-2 mb-2.5">
            <HeartPulse className="w-4 h-4 text-[#0E6F65]" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#4A5D64] font-semibold">
              Constantes fisiologicas de ingreso
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {vitalsList.length > 0 ? (
              vitalsList.map((vital, idx) => (
                <VitalSignBadge
                  key={`${vital.label}-${idx}`}
                  label={vital.label}
                  value={vital.value}
                  unit={vital.unit}
                  severity={vital.severity}
                />
              ))
            ) : (
              <span className="text-xs text-[#6B7D83] italic">
                Constantes vitales no consignadas al ingreso.
              </span>
            )}
          </div>
        </div>

        {/* Mobile Accordion Toggle Button */}
        <div className="mt-4 lg:hidden pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            aria-expanded={isMobileExpanded}
            aria-controls="vignette-details-content"
            className="w-full py-2.5 px-4 rounded-full bg-[#F2F7F6] border border-[#DCE5E3] text-xs font-medium text-[#0E6F65] hover:bg-[#ECF6F4] flex items-center justify-center gap-2 transition-colors"
          >
            <span>
              {isMobileExpanded
                ? 'Ocultar historia clinica detallada'
                : 'Desplegar historia clinica y examenes'}
            </span>
            {isMobileExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* 3. Detailed Body: Anamnesis, Physical Exam, Labs */}
      <div
        id="vignette-details-content"
        className={`p-5 sm:p-7 space-y-6 ${
          isMobileExpanded ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* A. Anamnesis */}
        <section className="space-y-2.5" aria-label="Anamnesis y enfermedad actual">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0E6F65]" />
            <h3 className="font-serif text-base sm:text-lg font-semibold text-[#0B252E]">
              Anamnesis y evolucion del cuadro
            </h3>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7FAF9] border border-[#E7EEEC] space-y-2.5 text-xs sm:text-sm text-[#344850] leading-relaxed">
            {anamnesisParagraphs.length > 0 ? (
              anamnesisParagraphs.map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <p className="text-[#6B7D83] italic">
                Informacion clinica pendiente de anamnesis dirigida.
              </p>
            )}
          </div>
        </section>

        {/* B. Physical Examination */}
        <section className="space-y-2.5" aria-label="Examen fisico detallado">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#0E6F65]" />
            <h3 className="font-serif text-base sm:text-lg font-semibold text-[#0B252E]">
              Examen fisico por sistemas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {physicalSystems.length > 0 ? (
              physicalSystems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-[#FDFCFA] border border-[#E7EEEC] space-y-1"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0E6F65] block">
                    {item.title}
                  </span>
                  <p className="text-xs sm:text-sm text-[#344850] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-[#F7FAF9] border border-[#E7EEEC] text-xs text-[#6B7D83]">
                Sin hallazgos adicionales consignados en el examen fisico.
              </div>
            )}
          </div>
        </section>

        {/* C. Initial Laboratory Findings Table */}
        <section className="space-y-2.5" aria-label="Examenes de laboratorio iniciales">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTubes className="w-4 h-4 text-[#0E6F65]" />
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#0B252E]">
                Examenes auxiliares e imagenes iniciales
              </h3>
            </div>
            <span className="text-xs text-[#6B7D83]">
              {labRows.length} parametros
            </span>
          </div>

          {labRows.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-[#DCE5E3] bg-white">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F2F7F6] text-[#4A5D64] uppercase text-[10px] tracking-[0.12em] border-b border-[#DCE5E3]">
                  <tr>
                    <th scope="col" className="py-3 px-4 font-semibold">
                      Parametro
                    </th>
                    <th scope="col" className="py-3 px-4 font-semibold">
                      Resultado
                    </th>
                    <th scope="col" className="py-3 px-4 font-semibold hidden sm:table-cell">
                      Valor referencial
                    </th>
                    <th scope="col" className="py-3 px-4 font-semibold text-right">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF2F0]">
                  {labRows.map((lab, idx) => {
                    const rowHighlight =
                      lab.severity === 'critical'
                        ? 'bg-[#FBF1F1]/45 text-[#0B252E]'
                        : lab.severity === 'warning'
                          ? 'bg-[#FDF7E7]/50 text-[#0B252E]'
                          : 'text-[#344850] hover:bg-[#F7FAF9]';

                    const badgeClass =
                      lab.severity === 'critical'
                        ? 'bg-[#FBF1F1] text-[#9E3F42] border-[#EED7D7]'
                        : lab.severity === 'warning'
                          ? 'bg-[#FDF7E7] text-[#8A6116] border-[#EFE0B9]'
                          : 'bg-[#F2F7F6] text-[#4A5D64] border-[#DCE5E3]';

                    return (
                      <tr key={idx} className={`transition-colors ${rowHighlight}`}>
                        <td className="py-3 px-4 font-medium text-[#0B252E]">
                          {lab.test}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {lab.result}
                        </td>
                        <td className="py-3 px-4 text-[#6B7D83] hidden sm:table-cell">
                          {lab.reference}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass}`}
                          >
                            {lab.severity === 'critical' && (
                              <AlertCircle className="w-3 h-3 text-[#9E3F42]" />
                            )}
                            {lab.severity === 'critical'
                              ? 'Alterado critico'
                              : lab.severity === 'warning'
                                ? 'Observacion'
                                : 'En rango'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F7FAF9] border border-[#E7EEEC] text-center text-xs text-[#6B7D83]">
              No se adjuntan reportes de laboratorio iniciales en esta estacion.
            </div>
          )}
        </section>
      </div>
    </article>
  );
};

export default VignettePlayer;
