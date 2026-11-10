import React, { useEffect, useRef, useState } from 'react';
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
}

const AXES: AxisDefinition[] = [
  {
    key: 'GAP_TRIAGE_SEVERITY',
    title: 'Triaje y Reconocimiento de Gravedad',
    shortTitle: 'Triaje y Gravedad',
    dx: 0,
    dy: -1,
  },
  {
    key: 'GAP_DIAGNOSTIC_REASONING',
    title: 'Razonamiento Diagnostico Clinico',
    shortTitle: 'Razonamiento Diagnostico',
    dx: 1,
    dy: 0,
  },
  {
    key: 'GAP_LAB_INTERPRETATION',
    title: 'Interpretacion de Examenes y Laboratorio',
    shortTitle: 'Interpretacion Auxiliar',
    dx: 0,
    dy: 1,
  },
  {
    key: 'GAP_INITIAL_MANAGEMENT',
    title: 'Manejo Terapeutico Inicial',
    shortTitle: 'Manejo Terapeutico',
    dx: -1,
    dy: 0,
  },
];

interface RgbStop {
  pct: number;
  r: number;
  g: number;
  b: number;
}

// Continuous Red -> Terracotta -> Amber -> Classic Medical Teal stop scale
const COLOR_STOPS: RgbStop[] = [
  { pct: 0, r: 182, g: 34, b: 42 },    // Deep clinical crimson (#B6222A)
  { pct: 32, r: 198, g: 56, b: 62 },   // Clinical red (#C6383E)
  { pct: 48, r: 196, g: 92, b: 48 },   // Terracotta red-orange (#C45C30)
  { pct: 64, r: 174, g: 122, b: 30 },  // Warm ochre amber (#AE7A1E)
  { pct: 80, r: 14, g: 111, b: 101 },  // Classic medical teal (#0E6F65)
  { pct: 100, r: 11, g: 98, b: 88 },   // Deep sage teal (#0B6258)
];

function interpolateScoreRgb(score: number): { r: number; g: number; b: number; hex: string } {
  const clamped = Math.min(100, Math.max(0, score));
  let lower = COLOR_STOPS[0];
  let upper = COLOR_STOPS[COLOR_STOPS.length - 1];

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (clamped >= COLOR_STOPS[i].pct && clamped <= COLOR_STOPS[i + 1].pct) {
      lower = COLOR_STOPS[i];
      upper = COLOR_STOPS[i + 1];
      break;
    }
  }

  const span = upper.pct - lower.pct || 1;
  const t = (clamped - lower.pct) / span;
  const r = Math.round(lower.r + (upper.r - lower.r) * t);
  const g = Math.round(lower.g + (upper.g - lower.g) * t);
  const b = Math.round(lower.b + (upper.b - lower.b) * t);
  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  return { r, g, b, hex };
}

function getScoreStatusMeta(score: number): {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  auraInner: string;
  auraMid: string;
  gridStroke: string;
} {
  if (score < 40) {
    return {
      label: 'Refuerzo urgente',
      badgeBg: 'bg-[#FDECEC]',
      badgeBorder: 'border-[#E8BDBD]',
      auraInner: '#FADADA',
      auraMid: '#FDF3F3',
      gridStroke: '#EAD2D2',
    };
  }
  if (score < 60) {
    return {
      label: 'Brecha marcada',
      badgeBg: 'bg-[#FDF1EC]',
      badgeBorder: 'border-[#ECCBBF]',
      auraInner: '#FBE4DA',
      auraMid: '#FDF6F2',
      gridStroke: '#EAD7CE',
    };
  }
  if (score < 75) {
    return {
      label: 'En nivelacion',
      badgeBg: 'bg-[#FDF7E7]',
      badgeBorder: 'border-[#EFE0B9]',
      auraInner: '#F9EED2',
      auraMid: '#FCF9EE',
      gridStroke: '#EAE0C8',
    };
  }
  return {
    label: 'Equilibrio solido',
    badgeBg: 'bg-[#ECF6F4]',
    badgeBorder: 'border-[#CFE7E2]',
    auraInner: '#E2F3EF',
    auraMid: '#F4FAF8',
    gridStroke: '#D5E5E1',
  };
}

export const CompetencyRadar: React.FC<CompetencyRadarProps> = ({
  scores,
  size = 360,
  className = '',
}) => {
  const [hoveredGap, setHoveredGap] = useState<CognitiveGapTag | null>(null);

  const [animatedScores, setAnimatedScores] = useState<Record<CognitiveGapTag, number>>({
    GAP_TRIAGE_SEVERITY: 0,
    GAP_DIAGNOSTIC_REASONING: 0,
    GAP_LAB_INTERPRETATION: 0,
    GAP_INITIAL_MANAGEMENT: 0,
  });
  const prevScoresRef = useRef<Record<CognitiveGapTag, number>>({
    GAP_TRIAGE_SEVERITY: 0,
    GAP_DIAGNOSTIC_REASONING: 0,
    GAP_LAB_INTERPRETATION: 0,
    GAP_INITIAL_MANAGEMENT: 0,
  });

  useEffect(() => {
    const target: Record<CognitiveGapTag, number> = {
      GAP_TRIAGE_SEVERITY: Math.min(100, Math.max(0, scores.GAP_TRIAGE_SEVERITY ?? 0)),
      GAP_DIAGNOSTIC_REASONING: Math.min(100, Math.max(0, scores.GAP_DIAGNOSTIC_REASONING ?? 0)),
      GAP_LAB_INTERPRETATION: Math.min(100, Math.max(0, scores.GAP_LAB_INTERPRETATION ?? 0)),
      GAP_INITIAL_MANAGEMENT: Math.min(100, Math.max(0, scores.GAP_INITIAL_MANAGEMENT ?? 0)),
    };

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      prevScoresRef.current = target;
      setAnimatedScores(target);
      return;
    }

    const from = { ...prevScoresRef.current };
    const duration = 950;
    const startTime = performance.now();
    let rafId = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);

      const nextFrame: Record<CognitiveGapTag, number> = {
        GAP_TRIAGE_SEVERITY:
          from.GAP_TRIAGE_SEVERITY +
          (target.GAP_TRIAGE_SEVERITY - from.GAP_TRIAGE_SEVERITY) * eased,
        GAP_DIAGNOSTIC_REASONING:
          from.GAP_DIAGNOSTIC_REASONING +
          (target.GAP_DIAGNOSTIC_REASONING - from.GAP_DIAGNOSTIC_REASONING) * eased,
        GAP_LAB_INTERPRETATION:
          from.GAP_LAB_INTERPRETATION +
          (target.GAP_LAB_INTERPRETATION - from.GAP_LAB_INTERPRETATION) * eased,
        GAP_INITIAL_MANAGEMENT:
          from.GAP_INITIAL_MANAGEMENT +
          (target.GAP_INITIAL_MANAGEMENT - from.GAP_INITIAL_MANAGEMENT) * eased,
      };

      prevScoresRef.current = nextFrame;
      setAnimatedScores(nextFrame);

      if (p < 1) {
        rafId = window.requestAnimationFrame(animate);
      } else {
        prevScoresRef.current = target;
        setAnimatedScores(target);
      }
    };

    rafId = window.requestAnimationFrame(animate);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [
    scores.GAP_TRIAGE_SEVERITY,
    scores.GAP_DIAGNOSTIC_REASONING,
    scores.GAP_LAB_INTERPRETATION,
    scores.GAP_INITIAL_MANAGEMENT,
  ]);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = Math.round(size * 0.33);
  const rings = [25, 50, 75, 100];

  const getPoint = (axis: AxisDefinition, scorePercent: number) => {
    const clamped = Math.min(100, Math.max(4, scorePercent));
    const r = (clamped / 100) * maxRadius;
    return {
      x: cx + axis.dx * r,
      y: cy + axis.dy * r,
    };
  };

  const avgAnimated =
    (animatedScores.GAP_TRIAGE_SEVERITY +
      animatedScores.GAP_DIAGNOSTIC_REASONING +
      animatedScores.GAP_LAB_INTERPRETATION +
      animatedScores.GAP_INITIAL_MANAGEMENT) /
    4;

  const avgTarget = Math.round(
    ((scores.GAP_TRIAGE_SEVERITY ?? 0) +
      (scores.GAP_DIAGNOSTIC_REASONING ?? 0) +
      (scores.GAP_LAB_INTERPRETATION ?? 0) +
      (scores.GAP_INITIAL_MANAGEMENT ?? 0)) /
      4
  );

  // Use the lower of average and minimum axis bias so weak axes visibly pull the diamond toward red
  const minAnimated = Math.min(
    animatedScores.GAP_TRIAGE_SEVERITY,
    animatedScores.GAP_DIAGNOSTIC_REASONING,
    animatedScores.GAP_LAB_INTERPRETATION,
    animatedScores.GAP_INITIAL_MANAGEMENT
  );
  const effectiveToneScore = avgAnimated * 0.72 + minAnimated * 0.28;
  const diamondColor = interpolateScoreRgb(effectiveToneScore);
  const statusMeta = getScoreStatusMeta(avgTarget);

  const polygonPoints = AXES.map((axis) => {
    const pt = getPoint(axis, animatedScores[axis.key] ?? 0);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  const echoPolygonPoints = AXES.map((axis) => {
    const boosted = Math.min(100, (animatedScores[axis.key] ?? 0) + 5);
    const pt = getPoint(axis, boosted);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  const activeAxis = AXES.find((a) => a.key === hoveredGap);
  const activeScore = activeAxis ? Math.round(animatedScores[activeAxis.key] ?? 0) : null;
  const activeColor =
    activeScore !== null ? interpolateScoreRgb(activeScore) : diamondColor;

  return (
    <div className={`flex flex-col items-center w-full select-none ${className}`}>
      {/* Dynamic Color Indicator Strip */}
      <div className="w-full flex items-center justify-between gap-2 px-3.5 py-2 mb-2 rounded-2xl bg-[#FDFCFA] border border-[#EDF2F0] text-[11px]">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300"
            style={{ backgroundColor: diamondColor.hex }}
          />
          <span className="font-semibold text-[#0B252E]">{statusMeta.label}</span>
        </div>
        <div className="flex items-center gap-2 text-[#6B7D83]">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C6383E]" />
            <span>&lt;50% Critico</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#AE7A1E]" />
            <span>50-74%</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0E6F65]" />
            <span>&ge;75%</span>
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Mapa dinamico de equilibrio de razonamiento clinico"
        >
          <defs>
            <radialGradient id="dynamic-radar-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={statusMeta.auraInner} stopOpacity="0.9" />
              <stop offset="72%" stopColor={statusMeta.auraMid} stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
            </radialGradient>

            <linearGradient id="dynamic-diamond-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={diamondColor.hex} stopOpacity="0.30" />
              <stop offset="100%" stopColor={diamondColor.hex} stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Soft Radial Backdrop Shifting from Rose (Low) to Sage (High) */}
          <circle cx={cx} cy={cy} r={maxRadius} fill="url(#dynamic-radar-aura)" />

          {/* Concentric Diamond Reference Rings */}
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
                  stroke={pct === 50 && avgTarget < 50 ? '#E5B8B8' : statusMeta.gridStroke}
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

          {/* 4 Cardinal Axes */}
          {AXES.map((axis) => {
            const outer = getPoint(axis, 100);
            const isAxisActive = hoveredGap === axis.key;
            const axisCol = interpolateScoreRgb(animatedScores[axis.key] ?? 0);
            return (
              <line
                key={`axis-line-${axis.key}`}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke={isAxisActive ? axisCol.hex : statusMeta.gridStroke}
                strokeWidth={isAxisActive ? '1.8' : '1'}
              />
            );
          })}

          {/* Subtle Breathing Echo Diamond */}
          <polygon
            points={echoPolygonPoints}
            fill="none"
            stroke={diamondColor.hex}
            strokeWidth="1"
            strokeOpacity="0.28"
            strokeDasharray="4 4"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.14;0.42;0.14"
              dur={avgTarget < 50 ? '1.8s' : '3.2s'}
              repeatCount="indefinite"
            />
          </polygon>

          {/* Primary Animated Competency Diamond */}
          <polygon
            points={polygonPoints}
            fill="url(#dynamic-diamond-fill)"
            stroke={diamondColor.hex}
            strokeWidth="2.6"
            strokeLinejoin="round"
          >
            <animate
              attributeName="fill-opacity"
              values="0.88;1;0.88"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </polygon>

          {/* Interactive Axis Vertices + Red Low-Score Pulse Rings */}
          {AXES.map((axis) => {
            const animVal = animatedScores[axis.key] ?? 0;
            const targetVal = Math.round(scores[axis.key] ?? 0);
            const pt = getPoint(axis, animVal);
            const vertexColor = interpolateScoreRgb(animVal);
            const isHovered = hoveredGap === axis.key;
            const isLowCritical = targetVal < 50;

            return (
              <g
                key={`vertex-${axis.key}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredGap(axis.key)}
                onMouseLeave={() => setHoveredGap(null)}
                onClick={() => setHoveredGap(hoveredGap === axis.key ? null : axis.key)}
                tabIndex={0}
                role="button"
                aria-label={`${axis.title}: ${targetVal}%`}
                onFocus={() => setHoveredGap(axis.key)}
                onBlur={() => setHoveredGap(null)}
              >
                <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />

                {/* Automatic Crimson Warning Pulse on Low (< 50%) Vertices */}
                {isLowCritical && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={6}
                    fill="none"
                    stroke={vertexColor.hex}
                    strokeWidth="1.6"
                  >
                    <animate
                      attributeName="r"
                      values="5;14"
                      dur="1.7s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.65;0"
                      dur="1.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={11}
                    fill={vertexColor.hex}
                    fillOpacity="0.18"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6.5 : 5}
                  fill={vertexColor.hex}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Top Axis Label */}
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
              y={cy - maxRadius - 8}
              textAnchor="middle"
              className="font-serif font-bold text-[13.5px]"
              fill={interpolateScoreRgb(animatedScores.GAP_TRIAGE_SEVERITY).hex}
            >
              {Math.round(animatedScores.GAP_TRIAGE_SEVERITY)}%
            </text>
          </g>

          {/* Right Axis Label */}
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
              className="font-serif font-bold text-[13.5px]"
              fill={interpolateScoreRgb(animatedScores.GAP_DIAGNOSTIC_REASONING).hex}
            >
              {Math.round(animatedScores.GAP_DIAGNOSTIC_REASONING)}%
            </text>
          </g>

          {/* Bottom Axis Label */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredGap('GAP_LAB_INTERPRETATION')}
            onMouseLeave={() => setHoveredGap(null)}
          >
            <text
              x={cx}
              y={cy + maxRadius + 18}
              textAnchor="middle"
              className="font-serif font-bold text-[13.5px]"
              fill={interpolateScoreRgb(animatedScores.GAP_LAB_INTERPRETATION).hex}
            >
              {Math.round(animatedScores.GAP_LAB_INTERPRETATION)}%
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

          {/* Left Axis Label */}
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
              className="font-serif font-bold text-[13.5px]"
              fill={interpolateScoreRgb(animatedScores.GAP_INITIAL_MANAGEMENT).hex}
            >
              {Math.round(animatedScores.GAP_INITIAL_MANAGEMENT)}%
            </text>
          </g>
        </svg>

        {/* Central Dynamic Score Pill */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center px-3.5 py-2 rounded-2xl bg-white/95 border shadow-2xs max-w-[144px] transition-all duration-300"
            style={{ borderColor: `${activeColor.hex}55` }}
          >
            {activeAxis ? (
              <>
                <div
                  className="text-[10px] uppercase tracking-[0.12em] font-semibold truncate"
                  style={{ color: activeColor.hex }}
                >
                  {activeAxis.shortTitle}
                </div>
                <div
                  className="font-serif text-lg font-bold leading-tight"
                  style={{ color: activeColor.hex }}
                >
                  {activeScore}%
                </div>
                <div className="text-[10px] text-[#5C737C]">
                  {activeScore! >= 75
                    ? 'Dominio solido'
                    : activeScore! >= 50
                      ? 'En nivelacion'
                      : 'Refuerzo urgente'}
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#6B7D83] font-medium">
                  Promedio global
                </div>
                <div
                  className="font-serif text-lg font-bold leading-tight"
                  style={{ color: diamondColor.hex }}
                >
                  {Math.round(avgAnimated)}%
                </div>
                <div className="text-[10px] text-[#5C737C]">{statusMeta.label}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive 4-Axis Legend with Dynamic Color Progress Bars */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-[#EDF2F0] text-xs">
        {AXES.map((axis) => {
          const animVal = Math.round(animatedScores[axis.key] ?? 0);
          const axisColor = interpolateScoreRgb(animVal);
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
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 space-y-1.5 ${
                isSelected
                  ? 'bg-white shadow-2xs'
                  : 'bg-[#FDFCFA] border-[#E7EEEC] hover:bg-[#F7FAF9]'
              }`}
              style={isSelected ? { borderColor: axisColor.hex } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: axisColor.hex }}
                  />
                  <span className="text-xs font-medium text-[#2C424B] truncate">
                    {axis.shortTitle}
                  </span>
                </div>
                <span
                  className="font-serif font-bold text-xs ml-2 shrink-0"
                  style={{ color: axisColor.hex }}
                >
                  {animVal}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EAECEB] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(4, animVal))}%`,
                    backgroundColor: axisColor.hex,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CompetencyRadar;
