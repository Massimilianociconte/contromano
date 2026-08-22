"use client";

import { useId } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function ConsensusDonut({
  score,
  size = 84,
  stroke = 8,
  color,
  label,
  ariaLabel,
}: {
  score: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  ariaLabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const dash = useTransform(spring, (v) => `${(v / 100) * c} ${c}`);
  const text = useTransform(spring, (v) => String(Math.round(v)));

  useEffect(() => {
    const t = setTimeout(() => mv.set(score), 80);
    return () => clearTimeout(t);
  }, [score, mv]);

  const ringColor = color ?? (score >= 70 ? "var(--consensus)" : score >= 45 ? "var(--gold)" : "var(--signal)");

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `${label ? label + " " : ""}${score}/100`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ strokeDasharray: dash }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="tabular font-display font-semibold leading-none"
          style={{ fontSize: size * 0.3 }}
          aria-hidden
        >
          {text}
        </motion.span>
        {label && (
          <span
            className="mt-0.5 uppercase tracking-wider"
            style={{ fontSize: size * 0.09, color: "var(--faint)" }}
            aria-hidden
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function VoteBars({
  agree,
  disagree,
  height = 6,
  ariaLabel,
}: {
  agree: number;
  disagree: number;
  height?: number;
  ariaLabel?: string;
}) {
  const total = agree + disagree;

  if (total === 0) {
    return (
      <div
        className="w-full rounded-full"
        style={{ height, background: "var(--surface2)" }}
        role="img"
        aria-label={ariaLabel ?? "—"}
      />
    );
  }

  const pct = (agree / total) * 100;
  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      style={{ height, background: "var(--surface2)" }}
      role="img"
      aria-label={ariaLabel ?? `${Math.round(pct)}%`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        style={{ background: "var(--consensus)" }}
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${100 - pct}%` }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1], delay: 0.08 }}
        style={{ background: "var(--oppose)" }}
      />
    </div>
  );
}

export function Sparkline({
  points,
  width = 220,
  height = 56,
  color = "var(--trend)",
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const gradientId = useId();
  if (points.length < 2) points = [0, ...points];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => [
    i * stepX,
    height - 4 - ((p - min) / range) * (height - 10),
  ]);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r={3.5} fill={color} />
    </svg>
  );
}
