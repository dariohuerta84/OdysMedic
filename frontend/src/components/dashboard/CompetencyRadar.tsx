import React, { useState } from 'react';
import type { CognitiveGapTag } from '../../types/api';

export interface CompetencyRadarProps {
  scores: Record<CognitiveGapTag, number>;
  size?: number;
  className?: string;
}

interface AxisDefinition {
  key: CognitiveGapTag;
  title: string;
  shortTitle: string;
  dx: number;
  dy: number;
  labelAnchor: 'middle' | 'start' | 'end';
}

const AXES: AxisDefinition[] = [
  {
    key: 'GAP_TRIAGE_SEVERITY',
    title: 'Triaje y Reconocimiento de Gravedad',
    shortTitle: 'Triaje / Gravedad',
    dx: 0,
    dy: -1, // Top
    labelAnchor: 'middle',
  },
  {
    key: 'GAP_DIAGNOSTIC_REASONING',
    title: 'Razonamiento Diagnostico Clinico',
    shortTitle: 'Razonamiento Diagnostico',
    dx: 1,
    dy: 0, // Right
    labelAnchor: 'start',
  },
  {
    key: 'GAP_LAB_INTERPRETATION',
    title: 'Interpretacion de Examenes y Labs',
    shortTitle: 'Interpretacion de Labs',
    dx: 0,
    dy: 1, // Bottom
    labelAnchor: 'middle',
  },
  {
    key: 'GAP_INITIAL_MANAGEMENT',
    title: 'Manejo Terapeutico Inicial',
    shortTitle: 'Manejo Terapeutico',
    dx: -1,
    dy: 0, // Left
    labelAnchor: 'end',
  },
];

export const CompetencyRadar: React.FC<CompetencyRadarProps> = ({
  scores,
  size = 380,
  className = '',
}) => {
  const [hoveredGap, setHoveredGap] = useState<CognitiveGapTag | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = Math.round(size * 0.33);

  const rings = [25, 50, 75, 100];

  // Helper to calculate vertex point on an axis for a given percentage (0..100)
  const getPoint = (axis: AxisDefinition, scorePercent: number) => {
    const clamped = Math.min(100, Math.max(0, scorePercent));
    const r = (clamped / 100) * maxRadius;
    return {
      x: cx + axis.dx * r,
      y: cy + axis.dy * r,
    };
  };

  // Student scores polygon points
  const polygonPoints = AXES.map((axis) => {
    const score = scores[axis.key] ?? 0;
    const pt = getPoint(axis, score);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  const activeAxis = AXES.find((a) => a.key === hoveredGap);
  const activeScore = activeAxis ? Math.round(scores[activeAxis.key] ?? 0) : null;

  return (
    <div className={`flex flex-col items-center w-full select-none ${className}`}>
      <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Radar de Competencias Clinicas OCRI de 4 Brechas"
        >
          <defs>
            {/* Cyan glow for radar polygon */}
            <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="4"
                floodColor="#06B6D4"
                floodOpacity="0.45"
              />
            </filter>
            {/* Subtle radial background gradient */}
            <radialGradient id="radar-bg-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0D665D" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#0E1117" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#090A0F" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={maxRadius}
            fill="url(#radar-bg-radial)"
            className="transition-colors"
          />

          {/* Concentric diamond grid rings (25%, 50%, 75%, 100%) */}
          {rings.map((pct) => {
            const r = (pct / 100) * maxRadius;
            const pts = [
              `${cx},${cy - r}`, // Top
              `${cx + r},${cy}`, // Right
              `${cx},${cy + r}`, // Bottom
              `${cx - r},${cy}`, // Left
            ].join(' ');

            return (
              <g key={`ring-${pct}`}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth={pct === 100 ? '1.5' : '1'}
                  strokeDasharray={pct === 100 ? undefined : '3 3'}
                />
                {/* Monospace percentage markers on top axis */}
                <text
                  x={cx + 4}
                  y={cy - r + 3}
                  fill="#64748B"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="start"
                  className="opacity-70 pointer-events-none"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* Cardinal axes lines from center */}
          {AXES.map((axis) => {
            const outer = getPoint(axis, 100);
            return (
              <line
                key={`axis-line-${axis.key}`}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="1"
              />
            );
          })}

          {/* Student scores polygon */}
          <polygon
            points={polygonPoints}
            fill="#0D665D"
            fillOpacity="0.25"
            stroke="#06B6D4"
            strokeWidth="2.5"
            filter="url(#radar-glow)"
            className="transition-all duration-300 ease-out"
          />

          {/* Vertex circles with interactive hover */}
          {AXES.map((axis) => {
            const score = Math.round(scores[axis.key] ?? 0);
            const pt = getPoint(axis, score);
            const isHovered = hoveredGap === axis.key;

            return (
              <g
                key={`vertex-${axis.key}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredGap(axis.key)}
                onMouseLeave={() => setHoveredGap(null)}
                tabIndex={0}
                role="button"
                aria-label={`${axis.title}: ${score}%`}
                onFocus={() => setHoveredGap(axis.key)}
                onBlur={() => setHoveredGap(null)}
              >
                {/* Expanded invisible hit target */}
                <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />

                {/* Aura pulse ring when hovered */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={11}
                    fill="#06B6D4"
                    fillOpacity="0.2"
                    stroke="#06B6D4"
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                )}

                {/* Visible vertex dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#06B6D4"
                  stroke="#090A0F"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Cardinal labels around the 4 axes */}
          {/* Top: GAP_TRIAGE_SEVERITY */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_TRIAGE_SEVERITY')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx}
              y={cy - maxRadius - 26}
              textAnchor="middle"
              className="font-sans font-semibold text-[11px] fill-slate-200 tracking-wide"
            >
              Triaje / Gravedad
            </text>
            <text
              x={cx}
              y={cy - maxRadius - 12}
              textAnchor="middle"
              className="font-mono font-bold text-[11px] fill-cyan-400"
            >
              {Math.round(scores.GAP_TRIAGE_SEVERITY ?? 0)}%
            </text>
          </g>

          {/* Right: GAP_DIAGNOSTIC_REASONING */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_DIAGNOSTIC_REASONING')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx + maxRadius + 14}
              y={cy - 6}
              textAnchor="start"
              className="font-sans font-semibold text-[11px] fill-slate-200 tracking-wide"
            >
              Razonamiento
            </text>
            <text
              x={cx + maxRadius + 14}
              y={cy + 8}
              textAnchor="start"
              className="font-sans font-semibold text-[11px] fill-slate-200 tracking-wide"
            >
              Diagnostico
            </text>
            <text
              x={cx + maxRadius + 14}
              y={cy + 23}
              textAnchor="start"
              className="font-mono font-bold text-[11px] fill-cyan-400"
            >
              {Math.round(scores.GAP_DIAGNOSTIC_REASONING ?? 0)}%
            </text>
          </g>

          {/* Bottom: GAP_LAB_INTERPRETATION */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_LAB_INTERPRETATION')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx}
              y={cy + maxRadius + 18}
              textAnchor="middle"
              className="font-mono font-bold text-[11px] fill-cyan-400"
            >
              {Math.round(scores.GAP_LAB_INTERPRETATION ?? 0)}%
            </text>
            <text
              x={cx}
              y={cy + maxRadius + 32}
              textAnchor="middle"
              className="font-sans font-semibold text-[11px] fill-slate-200 tracking-wide"
            >
              Interpretacion de Labs
            </text>
          </g>

          {/* Left: GAP_INITIAL_MANAGEMENT */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_INITIAL_MANAGEMENT')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx - maxRadius - 14}
              y={cy - 6}
              textAnchor="end"
              className="font-sans font-semibold text-[11px] fill-slate-200 tracking-wide"
            >
              Manejo
            </text>
            <text
              x={cx - maxRadius - 14}
              y={cy + 8}
              textAnchor="end"
              className="font-sans font-semibold text-[11px] fill-slate-200 tracking-wide"
            >
              Terapeutico
            </text>
            <text
              x={cx - maxRadius - 14}
              y={cy + 23}
              textAnchor="end"
              className="font-mono font-bold text-[11px] fill-cyan-400"
            >
              {Math.round(scores.GAP_INITIAL_MANAGEMENT ?? 0)}%
            </text>
          </g>
        </svg>

        {/* Central interactive HUD readout */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-2 py-1 rounded-lg bg-clinical-surface/80 border border-white/5 backdrop-blur-sm max-w-[130px]">
            {activeAxis ? (
              <>
                <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 truncate">
                  {activeAxis.shortTitle}
                </div>
                <div className="text-sm font-mono font-bold text-white">
                  {activeScore}%
                </div>
                <div className="text-[9px] text-gray-400 font-sans">
                  {activeScore! >= 80
                    ? 'Dominio Solido'
                    : activeScore! >= 60
                      ? 'Nivel Estable'
                      : 'Refuerzo OCRI'}
                </div>
              </>
            ) : (
              <>
                <div className="text-[9px] font-mono uppercase tracking-wider text-gray-400">
                  Precision OCRI
                </div>
                <div className="text-xs font-mono font-bold text-white">
                  {Math.round(
                    (scores.GAP_TRIAGE_SEVERITY +
                      scores.GAP_DIAGNOSTIC_REASONING +
                      scores.GAP_LAB_INTERPRETATION +
                      scores.GAP_INITIAL_MANAGEMENT) /
                      4 || 0
                  )}
                  %
                </div>
                <div className="text-[8.5px] text-gray-500 font-mono">
                  4 Brechas
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend and performance pills */}
      <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-clinical-border text-xs">
        {AXES.map((axis) => {
          const score = Math.round(scores[axis.key] ?? 0);
          const isSelected = hoveredGap === axis.key;

          return (
            <button
              type="button"
              key={`legend-${axis.key}`}
              onMouseEnter={() => setHoveredGap(axis.key)}
              onMouseLeave={() => setHoveredGap(null)}
              onClick={() =>
                setHoveredGap(hoveredGap === axis.key ? null : axis.key)
              }
              className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-clinical-teal/20 border-clinical-cyan text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-clinical-surface/40 border-clinical-border text-gray-300 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    score >= 80
                      ? 'bg-emerald-400'
                      : score >= 60
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                  }`}
                />
                <span className="text-[11px] truncate font-medium">
                  {axis.shortTitle}
                </span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-white ml-2">
                {score}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CompetencyRadar;
