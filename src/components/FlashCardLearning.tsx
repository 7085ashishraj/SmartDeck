"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, Lightbulb, Star } from "lucide-react";

const HANDWRITING = "var(--font-caveat), 'Caveat', cursive";

type Card = {
  id: string;
  front: string;
  back: string;
  explanation: string | null;
  interval: number;
};

function pickLearningCards(cards: Card[], max = 15): Card[] {
  if (cards.length <= max) return [...cards];
  const step = cards.length / max;
  return Array.from({ length: max }, (_, i) => cards[Math.floor(i * step)]);
}

const TILTS = [-2.5, 1.8, -1.2, 2.1, -1.7, 0.8, -2.0, 1.4, -0.9, 2.3, -1.5, 0.6, -2.2, 1.1, -1.8];

const ACCENT_COLORS = [
  "#d97706", "#6366f1", "#db2777", "#059669", "#7c3aed",
  "#ea580c", "#2563eb", "#dc2626", "#0d9488", "#9333ea",
];

export default function FlashCardLearning({
  cards,
  onComplete,
}: {
  cards: Card[];
  onComplete: () => void;
}) {
  const learningCards = pickLearningCards(cards);
  const total = learningCards.length;

  const [fading, setFading] = useState<Set<string>>(new Set());
  const [understood, setUnderstood] = useState<Set<string>>(new Set());
  const [quizReady, setQuizReady] = useState(false);

  const understoodCount = understood.size;

  useEffect(() => {
    if (understoodCount === total && total > 0) {
      const t = setTimeout(() => setQuizReady(true), 400);
      return () => clearTimeout(t);
    }
  }, [understoodCount, total]);

  const handleGotIt = (id: string) => {
    if (understood.has(id) || fading.has(id)) return;
    setFading(prev => new Set(prev).add(id));
    setTimeout(() => {
      setUnderstood(prev => new Set(prev).add(id));
      setFading(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 900);
  };

  return (
    <div className="w-full max-w-5xl px-4 pb-28 z-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-bold text-white/70 tracking-wide">Learning Mode</span>
        </div>
        <div className="flex-1 h-px bg-white/5" />
        <div className="text-right">
          <div className="text-[10px] text-white/35 font-bold uppercase tracking-widest mb-0.5">Concepts Mastered</div>
          <div className="text-xl font-extrabold tabular-nums">
            <span className="text-emerald-400">{understoodCount}</span>
            <span className="text-white/25"> / {total}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden border border-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
          animate={{ width: `${(understoodCount / total) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Subtitle */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
          Let's master the concepts first
        </h2>
        <p className="text-white/40 text-sm font-medium max-w-lg mx-auto">
          Read every sticky note carefully. Tap{" "}
          <strong className="text-white/65">"Got it!"</strong> once you understand — the card turns grey.
          When all are grey, the Quiz tab unlocks.
        </p>
      </div>

      {/* Sticky Notes Grid */}
      <div
        className="grid gap-7"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(295px, 1fr))" }}
      >
        {learningCards.map((card, i) => {
          const isFading     = fading.has(card.id);
          const isUnderstood = understood.has(card.id);
          const tilt         = TILTS[i % TILTS.length];
          const accent       = ACCENT_COLORS[i % ACCENT_COLORS.length];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 36, scale: 0.92, rotate: tilt }}
              animate={{
                opacity:  isUnderstood ? 0.72 : 1,
                rotate:   isUnderstood ? 0 : tilt,
                scale:    isUnderstood ? 0.97 : isFading ? 0.985 : 1,
                filter:   isUnderstood
                  ? "grayscale(100%) brightness(0.60)"
                  : isFading
                  ? "grayscale(55%)  brightness(0.82)"
                  : "grayscale(0%)   brightness(1)",
              }}
              transition={{
                filter:  { duration: 0.85, ease: "easeInOut" },
                opacity: { duration: 0.85, ease: "easeInOut" },
                scale:   { duration: 0.85, ease: "easeInOut" },
                rotate:  { duration: 0.85, ease: "easeInOut" },
                default: { delay: i * 0.055, duration: 0.45, ease: "easeOut" },
              }}
              className="relative flex flex-col"
              style={{ zIndex: total - i }}
            >
              {/* Tape strip */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-16 h-5 rounded-sm"
                style={{
                  background: "rgba(252,248,180,0.60)",
                  border: "1px solid rgba(255,255,255,0.40)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.20)",
                  backdropFilter: "blur(3px)",
                }}
              />

              {/* Note body */}
              <div
                className="relative flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #fffef2 0%, #fffbe8 50%, #fff6cc 100%)",
                  boxShadow: `0 10px 40px rgba(0,0,0,0.42), 0 2px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.95)`,
                  borderLeft: `5px solid ${accent}`,
                  minHeight: "285px",
                }}
              >
                {/* Number badge */}
                <div
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-md"
                  style={{ background: accent }}
                >
                  {i + 1}
                </div>

                <div className="p-6 pt-7 flex flex-col flex-1 gap-3">

                  {/* Label */}
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3 w-3 fill-current shrink-0" style={{ color: accent }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>
                      Key Concept {i + 1}
                    </span>
                  </div>

                  {/* Question — dark, bold, large */}
                  <h3
                    className="text-gray-900 leading-snug"
                    style={{ fontFamily: HANDWRITING, fontSize: "1.38rem", fontWeight: 800, lineHeight: 1.35 }}
                  >
                    {card.front}
                  </h3>

                  {/* Ruled divider */}
                  <div className="w-full h-px" style={{ background: `${accent}55` }} />

                  {/* Answer — dark, readable */}
                  <p
                    className="text-gray-800 leading-relaxed flex-1"
                    style={{ fontFamily: HANDWRITING, fontSize: "1.13rem", fontWeight: 700, lineHeight: 1.5 }}
                  >
                    {card.back}
                  </p>

                  {/* Explanation — WHITE bg so it pops off the yellow */}
                  {card.explanation && (
                    <div
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{
                        background: "rgba(255,255,255,0.90)",
                        border: `1.5px solid ${accent}55`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" style={{ color: accent }} />
                      <p
                        className="leading-snug text-gray-700"
                        style={{ fontFamily: HANDWRITING, fontSize: "0.97rem", fontWeight: 700 }}
                      >
                        {card.explanation}
                      </p>
                    </div>
                  )}

                  {/* Got it! button — DARK background so it's always readable on yellow */}
                  <motion.button
                    whileHover={!isUnderstood && !isFading ? { scale: 1.03, y: -1 } : {}}
                    whileTap={!isUnderstood && !isFading ? { scale: 0.94 } : {}}
                    onClick={() => handleGotIt(card.id)}
                    disabled={isUnderstood || isFading}
                    className="w-full mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all select-none disabled:cursor-default"
                    style={{
                      background: isUnderstood
                        ? "#9ca3af"
                        : isFading
                        ? "#374151"
                        : "#1c1917",
                      color: isUnderstood ? "#e5e7eb" : "#ffffff",
                      fontFamily: HANDWRITING,
                      fontSize: "1.12rem",
                      fontWeight: 800,
                      boxShadow: isUnderstood ? "none" : "0 2px 12px rgba(0,0,0,0.35)",
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {isUnderstood ? "Learned ✓" : isFading ? "Learned! ✓" : "Got it!"}
                  </motion.button>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* All mastered banner */}
      {understoodCount === total && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-14 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">All concepts mastered! 🎉</h3>
          <p className="text-white/40 text-sm">Switch to Quiz using the panel on the left to test yourself.</p>
        </motion.div>
      )}
    </div>
  );
}
