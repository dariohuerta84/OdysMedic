import React from 'react';
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  FileText,
  Compass,
} from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinical-bg text-gray-100 p-6 md:p-10 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-clinical-border pb-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-clinical-teal/20 border border-clinical-teal flex items-center justify-center text-clinical-teal">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  OdyssMedic
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded border border-clinical-teal/40 bg-clinical-teal/10 text-clinical-teal">
                  v0.1.0-alpha
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-400">
                Simulador Clinico Adaptativo y Evaluador Retrospectivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-clinical-surface border border-clinical-border font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-clinical-mint animate-pulse" />
              <span className="text-gray-300">MOTOR ADAPTATIVO: ONLINE</span>
            </div>
            <button className="px-4 py-1.5 rounded-md bg-clinical-teal hover:bg-clinical-teal-hover transition-colors text-white text-xs font-medium tracking-wide">
              Iniciar Guardia
            </button>
          </div>
        </div>
      </header>

      {/* Main Clinical Palette & Component Check */}
      <main className="max-w-7xl mx-auto w-full flex-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Diagnostic Focus */}
          <div className="p-5 rounded-xl bg-clinical-surface border border-clinical-border backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-clinical-cyan">
                Foco Diagnostico
              </span>
              <Radio className="w-4 h-4 text-clinical-cyan" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Razonamiento Clinico
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Integracion fisiopatologica de hallazgos semiologicos y formulacion de hipotesis.
            </p>
            <div className="p-3 rounded-lg bg-black/40 border border-clinical-cyan/20 font-mono text-xs text-clinical-cyan space-y-1">
              <div>TRIAGE: EMERGENCIA II</div>
              <div>MAP: 65 mmHg | LACTATO: 3.2 mmol/L</div>
            </div>
          </div>

          {/* Mastery & Pearls */}
          <div className="p-5 rounded-xl bg-clinical-surface border border-clinical-border backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-clinical-mint">
                Dominio Alcanzado
              </span>
              <CheckCircle2 className="w-4 h-4 text-clinical-mint" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Perla Clinica
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              En cetoacidosis diabetica, la reposicion de potasio precede a la insulina si K menor a 3.3 mEq/L.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-clinical-mint">
              <Zap className="w-4 h-4" />
              <span>RETENCION ESTIMADA: 94%</span>
            </div>
          </div>

          {/* Cognitive Gap Alert */}
          <div className="p-5 rounded-xl bg-clinical-surface border border-clinical-border backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-clinical-amber">
                Brecha Cognitiva
              </span>
              <AlertTriangle className="w-4 h-4 text-clinical-amber" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              GAP_INITIAL_MANAGEMENT
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Se priorizo ecografia sobre estabilizacion hemodinamica en shock hipovolemico.
            </p>
            <div className="p-3 rounded-lg bg-clinical-amber/10 border border-clinical-amber/30 text-xs text-clinical-amber font-mono">
              AJUSTE DE RUTA: Caso complementario inyectado
            </div>
          </div>

          {/* Critical Triage Alert */}
          <div className="p-5 rounded-xl bg-clinical-surface border border-clinical-border backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-clinical-coral">
                Alerta Critica
              </span>
              <ShieldAlert className="w-4 h-4 text-clinical-coral" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              GAP_TRIAGE_SEVERITY
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Omision de signos vitales inestables. Frecuencia respiratoria mayor a 30 rpm inadvertida.
            </p>
            <div className="text-xs font-mono text-clinical-coral">
              SEVERIDAD: ALTA PRIORIDAD
            </div>
          </div>

          {/* Exploration Trail */}
          <div className="p-5 rounded-xl bg-clinical-surface border border-clinical-border backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-clinical-violet">
                Mundo Clinico
              </span>
              <Compass className="w-4 h-4 text-clinical-violet" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Medicina de Emergencia
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Ruta adaptativa: 12 casos resueltos, 3 brechas remediadas en tiempo real.
            </p>
            <div className="text-xs font-mono text-clinical-violet">
              NIVEL DE DIFICULTAD: ENAM / RESIDENTADO
            </div>
          </div>

          {/* Telemetry Lab Bento */}
          <div className="p-5 rounded-xl bg-clinical-surface border border-clinical-border backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Telemetria
              </span>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Monitor Clinico
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-gray-500 text-[10px]">FC</div>
                  <div className="text-white font-bold">78 LPM</div>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-gray-500 text-[10px]">PA</div>
                  <div className="text-white font-bold">118/74</div>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-gray-500 text-[10px]">SpO2</div>
                  <div className="text-clinical-cyan font-bold">98%</div>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-gray-500 text-[10px]">TEMP</div>
                  <div className="text-white font-bold">36.7 C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-clinical-border text-center">
        <p className="text-xs font-mono text-gray-500">
          ODYSSMEDIC PRECISION ENGINE - BIOINCUBADORA CAYETANO 2026
        </p>
      </footer>
    </div>
  );
};

export default App;
