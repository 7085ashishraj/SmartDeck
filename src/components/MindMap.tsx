"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

type Card = { id: string; front: string; back: string; explanation: string | null };

// ── Constants ──────────────────────────────────────────────────────────────
const W       = 920;   // SVG / inner canvas width
const H       = 740;   // SVG / inner canvas height
const CX      = 460;   // canvas center X
const CY      = 370;   // canvas center Y
const R       = 295;   // spoke radius
const CARD_W  = 170;   // card width
const CARD_H  = 148;   // card height
const CTR_W   = 160;   // center node width
const CTR_H   = 72;    // center node height
const MAX     = 10;    // max cards shown radially

const COLORS = [
  { bg: "rgba(99,102,241,0.18)",  border: "#6366f1", text: "#a5b4fc", badge: "#4f46e5" },
  { bg: "rgba(236,72,153,0.18)",  border: "#ec4899", text: "#f9a8d4", badge: "#db2777" },
  { bg: "rgba(16,185,129,0.18)",  border: "#10b981", text: "#6ee7b7", badge: "#059669" },
  { bg: "rgba(245,158,11,0.18)",  border: "#f59e0b", text: "#fcd34d", badge: "#d97706" },
  { bg: "rgba(139,92,246,0.18)",  border: "#8b5cf6", text: "#c4b5fd", badge: "#7c3aed" },
  { bg: "rgba(239,68,68,0.18)",   border: "#ef4444", text: "#fca5a5", badge: "#dc2626" },
  { bg: "rgba(6,182,212,0.18)",   border: "#06b6d4", text: "#67e8f9", badge: "#0891b2" },
  { bg: "rgba(249,115,22,0.18)",  border: "#f97316", text: "#fdba74", badge: "#ea580c" },
  { bg: "rgba(20,184,166,0.18)",  border: "#14b8a6", text: "#5eead4", badge: "#0d9488" },
  { bg: "rgba(168,85,247,0.18)",  border: "#a855f7", text: "#d8b4fe", badge: "#9333ea" },
];

/** Point on the card rect edge that faces the canvas center. */
function edgePoint(cx: number, cy: number): [number, number] {
  const dx = CX - cx;
  const dy = CY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return [cx, cy];
  const nx = dx / dist;
  const ny = dy / dist;
  // how far along the unit vector until we first hit the rect edge
  const tx = Math.abs(nx) > 1e-9 ? (CARD_W / 2) / Math.abs(nx) : Infinity;
  const ty = Math.abs(ny) > 1e-9 ? (CARD_H / 2) / Math.abs(ny) : Infinity;
  const t  = Math.min(tx, ty) + 4; // +4 → tiny gap before card
  return [cx + nx * t, cy + ny * t];
}

function clip(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function MindMap({ cards, deckTitle }: { cards: Card[]; deckTitle: string }) {
  const nodes = cards.slice(0, MAX);
  const n     = nodes.length;

  // Pre-compute radial positions once
  const items = useMemo(() =>
    nodes.map((card, i) => {
      const angle = (2 * Math.PI * i / n) - Math.PI / 2;
      const cx    = CX + R * Math.cos(angle);
      const cy    = CY + R * Math.sin(angle);
      const [ex, ey] = edgePoint(cx, cy);
      return { card, cx, cy, ex, ey };
    }), [n]);

  return (
    <div className="w-full max-w-5xl px-4 pb-28 z-10">

      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <GitBranch className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-bold text-white/70 tracking-wide">Mind Map</span>
        </div>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2">🧠 Concept Mind Map</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          All key concepts radiating from the central topic — lines connect directly to each card.
        </p>
      </div>

      {/* Canvas — cards are overlaid ABOVE the SVG so lines never cross text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full overflow-auto rounded-2xl border border-white/10"
        style={{ background: "rgba(4,4,12,0.72)", backdropFilter: "blur(14px)", maxWidth: "100%" }}
      >
        {/* Fixed-size inner canvas */}
        <div style={{ width: W, height: H, position: "relative" }}>

          {/* ── Layer 0: SVG lines (behind everything) ─────────────────── */}
          <svg
            width={W} height={H}
            style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
          >
            {/* Subtle radial glow at center */}
            <defs>
              <radialGradient id="cg" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={CX} cy={CY} r={R + 10} fill="url(#cg)" />

            {/* Spoke lines — drawn as animated paths so they grow outward */}
            {items.map((item, i) => (
              <motion.path
                key={`spoke-${i}`}
                d={`M ${CX} ${CY} L ${item.ex} ${item.ey}`}
                stroke={COLORS[i % COLORS.length].border}
                strokeWidth="1.6"
                strokeOpacity="0.45"
                strokeDasharray="8 5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.65, delay: 0.12 + i * 0.07, ease: "easeOut" }}
              />
            ))}
          </svg>

          {/* ── Layer 1: Center node ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: "absolute",
              left:     CX - CTR_W / 2,
              top:      CY - CTR_H / 2,
              width:    CTR_W,
              zIndex:   2,
            }}
          >
            <div
              className="flex flex-col items-center justify-center rounded-2xl text-center px-4 py-3"
              style={{
                background:  "linear-gradient(135deg,#1e1b4b,#312e81)",
                border:      "2px solid #6366f1",
                boxShadow:   "0 0 40px rgba(99,102,241,0.50), 0 8px 24px rgba(0,0,0,0.6)",
                height:      CTR_H,
              }}
            >
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-indigo-400 mb-0.5">
                Topic
              </span>
              <span className="text-[13px] font-extrabold text-white leading-tight">
                {clip(deckTitle, 22)}
              </span>
            </div>
          </motion.div>

          {/* ── Layer 2: Concept cards (above SVG) ──────────────────────── */}
          {items.map((item, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <motion.div
                key={item.card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  position: "absolute",
                  left:     item.cx - CARD_W / 2,
                  top:      item.cy - CARD_H / 2,
                  width:    CARD_W,
                  height:   CARD_H,
                  zIndex:   2,
                }}
              >
                <div
                  className="w-full h-full flex flex-col rounded-xl overflow-hidden"
                  style={{
                    background:  c.bg,
                    border:      `1.5px solid ${c.border}55`,
                    boxShadow:   `0 6px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                >
                  {/* Colored header strip */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 shrink-0"
                    style={{ background: `${c.border}20`, borderBottom: `1px solid ${c.border}35` }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0"
                      style={{ background: c.badge }}
                    >
                      {i + 1}
                    </div>
                    <span
                      className="text-[10px] font-black uppercase tracking-wider leading-none truncate"
                      style={{ color: c.text }}
                    >
                      {clip(item.card.front, 20)}
                    </span>
                  </div>

                  {/* Body — full back text, scrollable if long */}
                  <div className="flex-1 px-3 py-2 overflow-hidden">
                    <p
                      className="text-[10.5px] text-white/68 leading-[1.42] font-medium"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.card.back}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Legend below — shows full text for all concepts */}
      <div className="mt-8">
        <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4 text-center">
          Full Concept Details
        </p>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {nodes.map((card, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="flex flex-col p-4 rounded-xl border"
                style={{ background: c.bg, borderColor: `${c.border}40` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                    style={{ background: c.badge }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="text-sm font-bold leading-snug" style={{ color: c.text }}>
                    {card.front}
                  </h3>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{card.back}</p>
                {card.explanation && (
                  <p className="text-[11px] mt-2 pt-2 leading-relaxed border-t"
                    style={{ color: c.text + "99", borderColor: `${c.border}25` }}>
                    💡 {card.explanation}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
