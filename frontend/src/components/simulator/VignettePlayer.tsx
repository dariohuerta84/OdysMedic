import React, { useState } from 'react';
import {
  User,
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
      if (rrNum > 30) {
        rrSeverity = 'critical';
      } else if (rrNum > 22) {
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
    const gcsNum = parseInt(String(gcsVal).replace(/[^\d]/g, ''), 10);
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

/**
 * Normalizes initial lab results into standardized clinical table rows
 */
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

      // Heuristic detection based on common lab keywords and numerical thresholds
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

      // Numerical lab heuristics
      if (lowerKey.includes('creatinina')) {
        refStr = '0.6 - 1.2 mg/dL';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          if (num >= 3.0) sev = 'critical';
          else if (num > 1.3) sev = 'warning';
        }
      } else if (lowerKey.includes('potasio') || lowerKey === 'k') {
        refStr = '3.5 - 5.0 mEq/L';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          if (num > 5.8 || num < 2.8) sev = 'critical';
          else if (num > 5.0 || num < 3.5) sev = 'warning';
        }
      } else if (lowerKey.includes('urea') || lowerKey.includes('bun')) {
        refStr = '15 - 45 mg/dL';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
        if (!isNaN(num) && num > 80) sev = 'warning';
      } else if (lowerKey.includes('hemoglobina') || lowerKey === 'hb') {
        refStr = '12.0 - 16.0 g/dL';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          if (num < 7.5) sev = 'critical';
          else if (num < 11.0) sev = 'warning';
        }
      } else if (lowerKey.includes('plaquetas') || lowerKey.includes('platelet')) {
        refStr = '150,000 - 450,000 /uL';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          if (num < 50000) sev = 'critical';
          else if (num < 100000) sev = 'warning';
        }
      } else if (lowerKey.includes('leucocitos') || lowerKey.includes('wbc')) {
        refStr = '4,500 - 10,500 /uL';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          if (num > 20000 || num < 2000) sev = 'critical';
          else if (num > 11000 || num < 4000) sev = 'warning';
        }
      } else if (lowerKey.includes('ph') && !lowerKey.includes('uro')) {
        refStr = '7.35 - 7.45';
        const num = parseFloat(resultStr.replace(/[^\d.]/g, ''));
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

/**
 * Parses physical exam section into clinical systems
 */
function parsePhysicalExamSystems(examText: string): Array<{ title: string; detail: string }> {
  if (!examText) return [];

  const systemKeywords = [
    { key: 'General', regex: /(?:General|Estado general|Aspecto general)\s*:\s*/i },
    { key: 'Respiratorio', regex: /(?:Respiratorio|Aparato respiratorio|Pulmonar)\s*:\s*/i },
    { key: 'Cardiovascular', regex: /(?:Cardiovascular|Aparato cardiovascular|Cardiaco)\s*:\s*/i },
    { key: 'Abdomen', regex: /(?:Abdomen|Aparato gastrointestinal|Gastrointestinal)\s*:\s*/i },
    { key: 'Neurologico', regex: /(?:Neurologico|Neurológico|Sistema nervioso)\s*:\s*/i },
  ];

  // Check if text contains colon-separated systems
  const hasSystemHeaders = systemKeywords.some((item) => item.regex.test(examText));

  if (!hasSystemHeaders) {
    // Return clean paragraphs
    return examText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, idx) => ({
        title: idx === 0 ? 'Examen Fisico General' : `Hallazgo Clinico ${idx + 1}`,
        detail: p,
      }));
  }

  // Tokenize by headers
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
        title: 'Hallazgos Adicionales',
        detail: trimmed,
      });
    }
  });

  return result.length > 0 ? result : [{ title: 'Examen Fisico', detail: examText }];
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

  return (
    <article
      className={`rounded-2xl bg-clinical-surface/95 border border-clinical-border overflow-hidden shadow-2xl backdrop-blur-md transition-all ${className}`}
      aria-label="Expediente Clinico y Vineta del Paciente"
    >
      {/* 1. Header: Patient Demographics & Chief Complaint */}
      <header className="p-4 sm:p-6 border-b border-clinical-border bg-gradient-to-r from-slate-900/90 via-clinical-surface to-slate-900/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-clinical-cyan" />
                <span>
                  Paciente: {caseDetail.patient_age} anos | Sexo {caseDetail.patient_gender}
                </span>
              </span>

              <span className="px-2.5 py-0.5 rounded-md bg-clinical-teal/20 border border-clinical-teal/40 font-mono text-[11px] text-teal-300">
                {caseDetail.difficulty_level || 'Nivel 1'}
              </span>

              {caseDetail.specialty_id && (
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 font-mono text-[11px] text-cyan-300 uppercase">
                  {caseDetail.specialty_id}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {caseDetail.display_title || caseDetail.title}
            </h2>
          </div>

          {/* Chief Complaint Alert Box */}
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 max-w-md shadow-sm">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400 block">
                  Motivo de Ingreso / Alerta de Guardia
                </span>
                <p className="text-xs font-semibold text-white leading-snug">
                  {caseDetail.chief_complaint || 'Ingreso por emergencia para evaluacion clinica.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Vital Signs Monospace Banner */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2.5">
            <HeartPulse className="w-3.5 h-3.5 text-clinical-cyan" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
              Constantes Fisiologicas en Triaje (Monitoreo Continuo)
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
              <span className="text-xs font-mono text-gray-500 italic">
                Constantes vitales no registradas al ingreso.
              </span>
            )}
          </div>
        </div>

        {/* Mobile Accordion Toggle Button */}
        <div className="mt-3 lg:hidden pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="w-full py-2 px-3 rounded-lg bg-clinical-surface border border-clinical-border text-xs font-mono font-semibold text-clinical-cyan hover:bg-white/5 flex items-center justify-center gap-2 transition-colors"
          >
            <span>
              {isMobileExpanded
                ? 'Ocultar Historia Clinica Detallada'
                : 'Ver Historia Clinica Completa / Constantes'}
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
        className={`p-4 sm:p-6 space-y-6 ${
          isMobileExpanded ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* A. Anamnesis / History of Present Illness */}
        <section className="space-y-3" aria-label="Anamnesis y Enfermedad Actual">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-clinical-teal-light">
            <FileText className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-white">
              Anamnesis y Evolucion del Cuadro Clinico
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
            {anamnesisParagraphs.length > 0 ? (
              anamnesisParagraphs.map((para, i) => (
                <p key={i} className="text-justify sm:text-left">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">
                Informacion de anamnesis pendiente de anamnesis dirigida.
              </p>
            )}
          </div>
        </section>

        {/* B. Physical Examination */}
        <section className="space-y-3" aria-label="Examen Fisico Detallado">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-clinical-cyan">
            <Stethoscope className="w-4 h-4 text-clinical-cyan" />
            <h3 className="font-bold text-white">
              Examen Fisico Dirigido por Sistemas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {physicalSystems.length > 0 ? (
              physicalSystems.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-clinical-border space-y-1"
                >
                  <span className="text-[11px] font-mono font-bold uppercase text-clinical-cyan tracking-wide">
                    {item.title}
                  </span>
                  <p className="text-xs text-gray-300 leading-normal">
                    {item.detail}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-clinical-border text-xs text-gray-400">
                Sin hallazgos especificos consignados en el examen fisico.
              </div>
            )}
          </div>
        </section>

        {/* C. Initial Laboratory Findings Table */}
        <section className="space-y-3" aria-label="Examenes de Laboratorio Iniciales">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <TestTubes className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white">
                Pruebas de Laboratorio e Imagenes Iniciales
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              {labRows.length} parametros analizados
            </span>
          </div>

          {labRows.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-clinical-border bg-slate-950/70">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-gray-400 uppercase text-[10px] tracking-wider border-b border-clinical-border">
                  <tr>
                    <th scope="col" className="py-2.5 px-4 font-semibold">
                      Prueba / Parametro
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold">
                      Resultado Hallado
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold hidden sm:table-cell">
                      Rango Referencial
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                      Alerta Clinica
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {labRows.map((lab, idx) => {
                    const rowHighlight =
                      lab.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-200'
                        : lab.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-200'
                          : 'text-gray-300 hover:bg-white/[0.02]';

                    const badgeClass =
                      lab.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : lab.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/80 text-gray-400 border-slate-700';

                    return (
                      <tr key={idx} className={`transition-colors ${rowHighlight}`}>
                        <td className="py-2.5 px-4 font-semibold text-white">
                          {lab.test}
                        </td>
                        <td className="py-2.5 px-4 font-bold">
                          {lab.result}
                        </td>
                        <td className="py-2.5 px-4 text-gray-400 hidden sm:table-cell">
                          {lab.reference}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${badgeClass}`}
                          >
                            {lab.severity === 'critical' && (
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                            )}
                            {lab.severity === 'critical'
                              ? 'Critico'
                              : lab.severity === 'warning'
                                ? 'Alerta'
                                : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center text-xs font-mono text-gray-400">
              No hay reportes de laboratorio adjuntos para este caso.
            </div>
          )}
        </section>
      </div>
    </article>
  );
};

export default VignettePlayer;