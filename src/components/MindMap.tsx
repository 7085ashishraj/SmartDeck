"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

type Card = { id: string; front: string; back: string; explanation: string | null };

// ── Layout constants (Left to Right structure) ──────────────────────────────
const CANVAS_W  = 1280;    // Increased total width to span full screen well
const BRAIN_CX  = 180;     // Brain node center X (Left)
const BRAIN_W   = 174;
const BRAIN_H   = 174;
const OVAL_CX   = 560;     // Oval pill center X (Middle)
const OVAL_W    = 220;     // Oval width
const OVAL_H    = 60;      // Oval height
const BOX_X     = 760;     // Content box left edge (Right)
const BOX_W     = 480;     // Content box width (Wider for better text fit)
const PAD_Y     = 60;      // Top/bottom padding
const ROW_GAP   = 24;      // Gap between rows
const MAX       = 12;

// ── Color palette — educational mind map style ──────────────────────────────
const COLORS = [
  { bg: "#fff0f3", border: "#ff4d6d", pill: ["#ff4d6d","#ff6b9d"],  line: "#ff4d6d" },
  { bg: "#f0f6ff", border: "#3b82f6", pill: ["#3b82f6","#60a5fa"],  line: "#3b82f6" },
  { bg: "#f0fff7", border: "#10b981", pill: ["#10b981","#34d399"],  line: "#10b981" },
  { bg: "#fffbf0", border: "#f59e0b", pill: ["#f59e0b","#fbbf24"],  line: "#f59e0b" },
  { bg: "#f5f0ff", border: "#8b5cf6", pill: ["#8b5cf6","#a78bfa"],  line: "#8b5cf6" },
  { bg: "#f0faff", border: "#06b6d4", pill: ["#06b6d4","#22d3ee"],  line: "#06b6d4" },
  { bg: "#fff5f5", border: "#ef4444", pill: ["#ef4444","#f87171"],  line: "#ef4444" },
  { bg: "#f0fff5", border: "#22c55e", pill: ["#22c55e","#4ade80"],  line: "#22c55e" },
  { bg: "#fff8f0", border: "#f97316", pill: ["#f97316","#fb923c"],  line: "#f97316" },
  { bg: "#fdf0ff", border: "#a855f7", pill: ["#a855f7","#c084fc"],  line: "#a855f7" },
  { bg: "#fff0fa", border: "#ec4899", pill: ["#ec4899","#f472b6"],  line: "#ec4899" },
  { bg: "#f0f2ff", border: "#6366f1", pill: ["#6366f1","#818cf8"],  line: "#6366f1" },
];

/** Estimate content box height based on text length (adjusted for wider box) */
function boxHeight(back: string, expl: string | null): number {
  const total = back.length + (expl ? expl.length + 4 : 0);
  return Math.max(90, Math.min(180, Math.ceil(total / 75) * 19 + 44));
}

/** Gradient id for each oval */
const gid = (i: number) => `og${i}`;

export default function MindMap({ cards, deckTitle }: { cards: Card[]; deckTitle: string }) {
  const nodes = cards.slice(0, MAX);
  const n     = nodes.length;

  const { items, CANVAS_H, BRAIN_Y } = useMemo(() => {
    // pre-compute row heights
    let yOffset = PAD_Y;
    const rows = nodes.map((card, i) => {
      const bh     = boxHeight(card.back, card.explanation);
      const rowH   = bh + ROW_GAP;
      const oval_cy = yOffset + rowH / 2;
      const box_y  = oval_cy - bh / 2;
      yOffset += rowH;
      return { card, bh, oval_cy, box_y, c: COLORS[i % COLORS.length] };
    });

    const totalH   = yOffset + PAD_Y;
    const CANVAS_H = Math.max(totalH, BRAIN_H + PAD_Y * 2);
    const BRAIN_Y  = CANVAS_H / 2;

    // Build path data for each branch (Left-to-Right layout)
    const items = rows.map(row => {
      const { oval_cy, c } = row;
      const brainRX = BRAIN_CX + BRAIN_W / 2 + 4;   // right edge of brain
      const ovalLX  = OVAL_CX  - OVAL_W  / 2;       // left edge of oval
      const ovalRX  = OVAL_CX  + OVAL_W  / 2;       // right edge of oval
      const boxLX   = BOX_X;                        // left edge of box

      // Brain → Oval — smooth bezier fan
      const midX = (brainRX + ovalLX) / 2;
      const branchD = `M ${brainRX} ${BRAIN_Y} C ${midX} ${BRAIN_Y} ${midX} ${oval_cy} ${ovalLX} ${oval_cy}`;

      // Oval → Box — straight horizontal line
      const connD = `M ${ovalRX} ${oval_cy} L ${boxLX} ${oval_cy}`;

      return { ...row, branchD, connD };
    });

    return { items, CANVAS_H, BRAIN_Y };
  }, [n]);

  return (
    <div className="w-full max-w-[1400px] px-4 pb-28 z-10 mx-auto">

      {/* Section header */}
      <div className="flex items-center gap-4 mb-10 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-sm">
          <GitBranch className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-bold text-gray-800 tracking-wide">Mind Map</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-500 font-semibold">{nodes.length} concepts</span>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">🧠 Concept Mind Map</h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto font-medium">
          All concepts branch out from the central topic — providing a clear mental model with full details.
        </p>
      </div>

      {/* ── Canvas Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full overflow-x-auto overflow-y-hidden rounded-3xl hide-scrollbar"
        style={{
          background: "linear-gradient(160deg, #fafbff 0%, #f7f5ff 100%)",
          border:     "1.5px solid rgba(99,102,241,0.18)",
          boxShadow:  "0 20px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <svg
          width="100%"
          height={CANVAS_H}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", minWidth: 1080 }}
        >
          <defs>
            {/* Gradient per oval */}
            {items.map((item, i) => (
              <linearGradient key={gid(i)} id={gid(i)} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor={item.c.pill[0]} />
                <stop offset="100%" stopColor={item.c.pill[1]} />
              </linearGradient>
            ))}
            {/* Brain glow radial gradient */}
            <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0"    />
            </radialGradient>
            {/* Subtle grid dot pattern */}
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(99,102,241,0.12)" />
            </pattern>
          </defs>

          {/* Background dot pattern */}
          <rect width={CANVAS_W} height={CANVAS_H} fill="url(#dots)" />

          {/* ── Bezier branch lines (brain → oval) ── */}
          {items.map((item, i) => (
            <motion.path
              key={`branch-${i}`}
              d={item.branchD}
              fill="none"
              stroke={item.c.line}
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: "easeOut" }}
            />
          ))}

          {/* ── Connector lines (oval → box) ── */}
          {items.map((item, i) => (
            <motion.path
              key={`conn-${i}`}
              d={item.connD}
              fill="none"
              stroke={item.c.line}
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.07, ease: "easeOut" }}
            />
          ))}

          {/* ── Brain / Central node (Left Side) ── */}
          <g>
            {/* Glow halo */}
            <circle cx={BRAIN_CX} cy={BRAIN_Y} r={105} fill="url(#brainGlow)" />
            <circle cx={BRAIN_CX} cy={BRAIN_Y} r={88}
              fill="white"
              stroke="rgba(99,102,241,0.22)"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 8px 24px rgba(99,102,241,0.25))" }}
            />
            {/* Brain emoji */}
            <text x={BRAIN_CX} y={BRAIN_Y - 14}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="48" style={{ userSelect: "none" }}>
              🧠
            </text>
            {/* Deck title under brain */}
            <foreignObject
              x={BRAIN_CX - 90}
              y={BRAIN_Y + 28}
              width={180}
              height={50}
            >
              {/* @ts-ignore */}
              <div xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: 12.5,
                  color: "#1e1b4b",
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                  padding: "0 6px",
                }}
              >
                {deckTitle.length > 40 ? deckTitle.slice(0, 40) + "…" : deckTitle}
              </div>
            </foreignObject>
          </g>

          {/* ── Oval pills ── */}
          {items.map((item, i) => (
            <g key={`oval-${i}`}>
              <motion.rect
                x={OVAL_CX - OVAL_W / 2}
                y={item.oval_cy - OVAL_H / 2}
                width={OVAL_W}
                height={OVAL_H}
                rx={OVAL_H / 2}
                fill={`url(#${gid(i)})`}
                style={{ filter: `drop-shadow(0 6px 14px ${item.c.line}40)` }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
              />
              <foreignObject
                x={OVAL_CX - OVAL_W / 2 + 10}
                y={item.oval_cy - OVAL_H / 2}
                width={OVAL_W - 20}
                height={OVAL_H}
              >
                {/* @ts-ignore */}
                <div xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width:          "100%",
                    height:         "100%",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "#ffffff",
                    fontWeight:     800,
                    fontSize:       12.5,
                    textAlign:      "center",
                    lineHeight:     1.25,
                    overflow:       "hidden",
                    padding:        "4px 0",
                  }}
                >
                  {item.card.front}
                </div>
              </foreignObject>
            </g>
          ))}

          {/* ── Content boxes ── */}
          {items.map((item, i) => (
            <g key={`box-${i}`}>
              <motion.rect
                x={BOX_X}
                y={item.box_y}
                width={BOX_W}
                height={item.bh}
                rx={16}
                fill="#ffffff"
                stroke={item.c.border}
                strokeWidth="2.2"
                style={{ filter: `drop-shadow(0 4px 14px ${item.c.line}25)` }}
                initial={{ x: BOX_X - 20, opacity: 0 }}
                animate={{ x: BOX_X, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.07, ease: "easeOut" }}
              />
              <foreignObject
                x={BOX_X + 16}
                y={item.box_y + 12}
                width={BOX_W - 32}
                height={item.bh - 24}
              >
                {/* @ts-ignore */}
                <div xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width:    "100%",
                    height:   "100%",
                    overflow: "hidden",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {/* Concept label */}
                  <div style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          8,
                    marginBottom: 8,
                  }}>
                    <div style={{
                      width:        10,
                      height:       10,
                      borderRadius: "50%",
                      background:   item.c.line,
                      flexShrink:   0,
                    }} />
                    <div style={{
                      fontWeight:    800,
                      fontSize:      12.5,
                      color:         item.c.border,
                      whiteSpace:    "nowrap",
                      overflow:      "hidden",
                      textOverflow:  "ellipsis",
                    }}>
                      {item.card.front}
                    </div>
                  </div>

                  {/* Explanation body */}
                  <div style={{
                    fontSize:   12.5,
                    color:      "#1a1a2e",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}>
                    {item.card.back}
                  </div>

                  {/* Optional extra explanation */}
                  {item.card.explanation && (
                    <div style={{
                      marginTop:  8,
                      fontSize:   11.5,
                      color:      "#4a4570",
                      lineHeight: 1.55,
                      fontStyle:  "italic",
                    }}>
                      💡 {item.card.explanation}
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Tip */}
      <p className="text-center text-gray-400 font-medium tracking-wide text-xs mt-4">
        Scroll right on small screens to view the full mind map.
      </p>
    </div>
  );
}

