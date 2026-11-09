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
    shortTitle: 'Triaje y Gravedad',
    dx: 0,
    dy: -1,
    labelAnchor: 'middle',
  },
  {
    key: 'GAP_DIAGNOSTIC_REASONING',
    title: 'Razonamiento Diagnostico Clinico',
    shortTitle: 'Razonamiento Diagnostico',
    dx: 1,
    dy: 0,
    labelAnchor: 'start',
  },
  {
    key: 'GAP_LAB_INTERPRETATION',
    title: 'Interpretacion de Examenes y Laboratorio',
    shortTitle: 'Interpretacion de Labs',
    dx: 0,
    dy: 1,
    labelAnchor: 'middle',
  },
  {
    key: 'GAP_INITIAL_MANAGEMENT',
    title: 'Manejo Terapeutico Inicial',
    shortTitle: 'Manejo Terapeutico',
    dx: -1,
    dy: 0,
    labelAnchor: 'end',
  },
];

export const CompetencyRadar: React.FC<CompetencyRadarProps> = ({
  scores,
  size = 360,
  className = '',
}) => {
  const [hoveredGap, setHoveredGap] = useState<CognitiveGapTag | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = Math.round(size * 0.33);

  const rings = [25, 50, 75, 100];

  const getPoint = (axis: AxisDefinition, scorePercent: number) => {
    const clamped = Math.min(100, Math.max(0, scorePercent));
    const r = (clamped / 100) * maxRadius;
    return {
      x: cx + axis.dx * r,
      y: cy + axis.dy * r,
    };
  };

  const polygonPoints = AXES.map((axis) => {
    const score = scores[axis.key] ?? 0;
    const pt = getPoint(axis, score);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  const activeAxis = AXES.find((a) => a.key === hoveredGap);
  const activeScore = activeAxis ? Math.round(scores[activeAxis.key] ?? 0) : null;

  return (
    <div className={`flex flex-col items-center w-full select-none ${className}`}>
      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Mapa de competencias clinicas"
        >
          <defs>
            <radialGradient id="classic-radar-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ECF6F4" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#F7FAF9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          <circle
            cx={cx}
            cy={cy}
            r={maxRadius}
            fill="url(#classic-radar-bg)"
          />

          {rings.map((pct) => {
            const r = (pct / 100) * maxRadius;
            const pts = [
              `${cx},${cy - r}`,
              `${cx + r},${cy}`,
              `${cx},${cy + r}`,
              `${cx - r},${cy}`,
            ].join(' ');

            return (
              <g key={`ring-${pct}`}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke="#DCE5E3"
                  strokeWidth={pct === 100 ? '1.5' : '1'}
                  strokeDasharray={pct === 100 ? undefined : '3 3'}
                />
                <text
                  x={cx + 5}
                  y={cy - r + 3}
                  fill="#6B7D83"
                  fontSize="8.5"
                  fontFamily="Inter, sans-serif"
                  textAnchor="start"
                  className="pointer-events-none"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {AXES.map((axis) => {
            const outer = getPoint(axis, 100);
            return (
              <line
                key={`axis-line-${axis.key}`}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#CFE0DC"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={polygonPoints}
            fill="#0E6F65"
            fillOpacity="0.16"
            stroke="#0E6F65"
            strokeWidth="2.2"
            className="transition-all duration-300 ease-out"
          />

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
                <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={10}
                    fill="#0E6F65"
                    fillOpacity="0.15"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#0E6F65"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Top */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_TRIAGE_SEVERITY')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx}
              y={cy - maxRadius - 24}
              textAnchor="middle"
              className="font-sans font-medium text-[11px] fill-[#344850]"
            >
              Triaje y Gravedad
            </text>
            <text
              x={cx}
              y={cy - maxRadius - 9}
              textAnchor="middle"
              className="font-serif font-semibold text-[13px] fill-[#0E6F65]"
            >
              {Math.round(scores.GAP_TRIAGE_SEVERITY ?? 0)}%
            </text>
          </g>

          {/* Right */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_DIAGNOSTIC_REASONING')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx + maxRadius + 14}
              y={cy - 6}
              textAnchor="start"
              className="font-sans font-medium text-[11px] fill-[#344850]"
            >
              Razonamiento
            </text>
            <text
              x={cx + maxRadius + 14}
              y={cy + 8}
              textAnchor="start"
              className="font-sans font-medium text-[11px] fill-[#344850]"
            >
              Diagnostico
            </text>
            <text
              x={cx + maxRadius + 14}
              y={cy + 24}
              textAnchor="start"
              className="font-serif font-semibold text-[13px] fill-[#0E6F65]"
            >
              {Math.round(scores.GAP_DIAGNOSTIC_REASONING ?? 0)}%
            </text>
          </g>

          {/* Bottom */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_LAB_INTERPRETATION')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx}
              y={cy + maxRadius + 18}
              textAnchor="middle"
              className="font-serif font-semibold text-[13px] fill-[#0E6F65]"
            >
              {Math.round(scores.GAP_LAB_INTERPRETATION ?? 0)}%
            </text>
            <text
              x={cx}
              y={cy + maxRadius + 33}
              textAnchor="middle"
              className="font-sans font-medium text-[11px] fill-[#344850]"
            >
              Interpretacion Auxiliar
            </text>
          </g>

          {/* Left */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_INITIAL_MANAGEMENT')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx - maxRadius - 14}
              y={cy - 6}
              textAnchor="end"
              className="font-sans font-medium text-[11px] fill-[#344850]"
            >
              Manejo
            </text>
            <text
              x={cx - maxRadius - 14}
              y={cy + 8}
              textAnchor="end"
              className="font-sans font-medium text-[11px] fill-[#344850]"
            >
              Terapeutico
            </text>
            <text
              x={cx - maxRadius - 14}
              y={cy + 24}
              textAnchor="end"
              className="font-serif font-semibold text-[13px] fill-[#0E6F65]"
            >
              {Math.round(scores.GAP_INITIAL_MANAGEMENT ?? 0)}%
            </text>
          </g>
        </svg>

        {/* Central Readout */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-3 py-2 rounded-2xl bg-white/95 border border-[#DCE5E3] shadow-2xs max-w-[136px]">
            {activeAxis ? (
              <>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#0E6F65] font-semibold truncate">
                  {activeAxis.shortTitle}
                </div>
                <div className="font-serif text-base font-semibold text-[#0B252E]">
                  {activeScore}%
                </div>
                <div className="text-[10px] text-[#6B7D83]">
                  {activeScore! >= 80
                    ? 'Dominio solido'
                    : activeScore! >= 60
                      ? 'En progreso'
                      : 'Prioridad'}
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D83] font-medium">
                  Promedio global
                </div>
                <div className="font-serif text-base font-semibold text-[#0B252E]">
                  {Math.round(
                    (scores.GAP_TRIAGE_SEVERITY +
                      scores.GAP_DIAGNOSTIC_REASONING +
                      scores.GAP_LAB_INTERPRETATION +
                      scores.GAP_INITIAL_MANAGEMENT) /
                      4 || 0
                  )}
                  %
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Clean Legend */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-[#EDF2F0] text-xs">
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
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-colors ${
                isSelected
                  ? 'bg-[#ECF6F4] border-[#0E6F65] text-[#0B252E]'
                  : 'bg-[#FDFCFA] border-[#E7EEEC] text-[#344850] hover:bg-[#F2F7F6]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    score >= 80
                      ? 'bg-[#0E6F65]'
                      : score >= 60
                        ? 'bg-[#8A6116]'
                        : 'bg-[#9E3F42]'
                  }`}
                />
                <span className="text-xs truncate">{axis.shortTitle}</span>
              </div>
              <span className="font-semibold text-xs text-[#0B252E] ml-2">
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
