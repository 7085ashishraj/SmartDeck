"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReview } from "@/app/study-actions";
import {
  CheckCircle2, XCircle, ArrowRight, BookOpen, Brain,
  BookMarked, GitBranch, PlayCircle, Home, Sparkles, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import FlashCardLearning from "@/components/FlashCardLearning";
import BookLibrary      from "@/components/BookLibrary";
import MindMap          from "@/components/MindMap";
import VideoTutor       from "@/components/VideoTutor";

const HANDWRITING = "var(--font-caveat), 'Caveat', cursive";
const OPT_LABELS  = ["A", "B", "C", "D"];

const QUIZ_GRADIENTS = [
  ["#0f0c29", "#302b63", "#24243e"],
  ["#1a0533", "#4a044e", "#1a0533"],
  ["#0a1628", "#1e3a8a", "#0a1628"],
  ["#1a0a00", "#7c2d12", "#2d1200"],
  ["#003333", "#1a4a3a", "#003333"],
];

const QUIZ_ACCENTS = ["#818cf8","#c084fc","#60a5fa","#fb923c","#34d399"];

type Card = { id: string; front: string; back: string; explanation: string | null; interval: number };
type Phase = "learn" | "quiz" | "books" | "mindmap" | "video";
type Opt   = { text: string; isCorrect: boolean };

// ── helpers ────────────────────────────────────────────────────────────────
function getImageUrl(iq: string, idx: number): string | null {
  if (!iq) return null;
  const urls = iq.split(",").map(u => u.trim()).filter(Boolean);
  return urls.length ? urls[idx % urls.length] : null;
}

function shortOpt(s: string, max = 100): string {
  if (s.length <= max) return s;
  const trunc = s.slice(0, max);
  return trunc.slice(0, trunc.lastIndexOf(" ") || max) + "…";
}

function buildOptions(allCards: Card[], currentCard: Card): Opt[] {
  const correct = currentCard.back;
  const distractors = allCards
    .filter(c => c.id !== currentCard.id)
    .map(c => c.back)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [{ text: correct, isCorrect: true }, ...distractors.map(t => ({ text: t, isCorrect: false }))]
    .sort(() => Math.random() - 0.5);
}

// ── Left-side mode toggle (5 modes) ───────────────────────────────────────
function ModeToggle({ phase, onChange }: { phase: Phase; onChange: (p: Phase) => void }) {
  const tabs: { id: Phase; label: string; Icon: React.FC<any> }[] = [
    { id: "learn",   label: "Cards",   Icon: BookOpen   },
    { id: "quiz",    label: "Quiz",    Icon: Brain      },
    { id: "books",   label: "Books",   Icon: BookMarked },
    { id: "mindmap", label: "Map",     Icon: GitBranch  },
    { id: "video",   label: "Video",   Icon: PlayCircle },
  ];
  return (
    <motion.div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0.5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md"
      style={{ background: "rgba(8,8,16,0.82)" }}
      initial={{ opacity: 0, x: -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = phase === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors select-none overflow-hidden"
            style={{ color: active ? "#fff" : "rgba(255,255,255,0.30)", width: 68 }}
          >
            {active && (
              <motion.div
                layoutId="mode-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow: "0 4px 18px rgba(99,102,241,0.55)",
                }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <Icon className="h-[18px] w-[18px] relative z-10" strokeWidth={active ? 2.3 : 1.6} />
            <span className="relative z-10 leading-none">{label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

// ── Quiz Setup Screen ──────────────────────────────────────────────────────
function QuizSetup({ total, onStart }: { total: number; onStart: (n: number) => void }) {
  const opts = [5, 10, 15, 20].filter(n => n <= total);
  if (!opts.includes(total) && total > 0) opts.push(total);
  const [sel, setSel] = useState(Math.min(10, total));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg px-4 flex flex-col items-center py-12 z-10"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-7 shadow-2xl shadow-indigo-500/30">
        <Brain className="h-10 w-10 text-white" />
      </div>

      <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Set Up Your Quiz</h2>
      <p className="text-white/40 text-sm text-center mb-10 max-w-xs">
        Choose how many questions you want to tackle. Each is a multiple-choice question with 4 options.
      </p>

      {/* Count picker */}
      <div className="w-full mb-10">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest text-center mb-4">
          How many questions? ({total} available)
        </p>
        <div className="grid grid-cols-3 gap-3">
          {opts.map(n => (
            <button
              key={n}
              onClick={() => setSel(n)}
              className="flex flex-col items-center py-4 rounded-2xl border-2 transition-all font-extrabold text-lg"
              style={
                sel === n
                  ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderColor: "#818cf8", color: "#fff", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }
              }
            >
              {n === total && !([5,10,15,20].includes(n)) ? "All" : n}
              <span className="text-[10px] font-semibold mt-1 opacity-60">
                {n === total && !([5,10,15,20].includes(n)) ? `${n} Qs` : "Questions"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Start CTA */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onStart(sel)}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-lg text-white shadow-2xl shadow-indigo-500/30"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
      >
        Start {sel}-Question Quiz
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}

// ── Score Screen — dramatic real-life reveal ─────────────────────────────
const CONFETTI_COLORS = [
  "#6366f1","#ec4899","#10b981","#f59e0b","#3b82f6","#a855f7","#ef4444","#06b6d4","#f97316","#84cc16",
];

function ScoreScreen({ correct, total, onRetry }: { correct: number; total: number; onRetry: () => void }) {
  const pct = total > 0 ? correct / total : 0;
  const R   = 82;
  const C   = 2 * Math.PI * R;

  // Counter: counts up from 0 → correct over ~1.5 s
  const [displayCount, setDisplayCount] = useState(0);
  const [counterDone,  setCounterDone]  = useState(false);

  useEffect(() => {
    if (correct === 0) { setCounterDone(true); return; }
    const DURATION = 1600; // ms
    const STEPS    = Math.min(correct, 40);
    const interval = DURATION / STEPS;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setDisplayCount(Math.round((step / STEPS) * correct));
      if (step >= STEPS) { clearInterval(t); setCounterDone(true); }
    }, interval);
    return () => clearInterval(t);
  }, [correct]);

  // Stable confetti config
  const confetti = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      tx:       (Math.random() - 0.5) * 560,
      ty:       -(90 + Math.random() * 380),
      rotate:   Math.random() * 720 - 360,
      color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      w:        6  + Math.random() * 8,
      h:        8  + Math.random() * 5,
      delay:    0.5 + Math.random() * 0.6,
      duration: 1.3 + Math.random() * 0.9,
    })), []);

  const { grade, color, emoji } =
    pct >= 0.9  ? { grade: "Outstanding",   color: "#10b981", emoji: "🌟" } :
    pct >= 0.75 ? { grade: "Great Job",     color: "#6366f1", emoji: "🎉" } :
    pct >= 0.5  ? { grade: "Good Work",     color: "#f59e0b", emoji: "👍" } :
                  { grade: "Keep Practising", color: "#ef4444", emoji: "💪" };

  const percent = Math.round(pct * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-8 z-10 w-full max-w-lg px-4 relative"
    >
      {/* ── Confetti burst (fires once counter is done on ≥50%) ── */}
      {pct >= 0.5 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          {confetti.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{ width: p.w, height: p.h, background: p.color, top: "50%", left: "50%" }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ x: p.tx, y: p.ty, opacity: 0, rotate: p.rotate, scale: 0.4 }}
              transition={{ duration: p.duration, delay: p.delay, ease: [0.22, 0.68, 0, 1.2] }}
            />
          ))}
        </div>
      )}

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-8"
      >
        <p className="text-white/35 text-[11px] font-black uppercase tracking-[0.25em] mb-1">Quiz Complete</p>
        <h2 className="text-3xl font-extrabold text-white">Your Results Are In</h2>
      </motion.div>

      {/* ── SVG Circle + Counter ── */}
      <div className="relative w-60 h-60 mb-8">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="sgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color + "aa"} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track ring */}
          <circle cx="100" cy="100" r={R} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="16" />

          {/* Glow ring */}
          <motion.circle cx="100" cy="100" r={R} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - pct) }}
            transition={{ duration: 1.8, ease: [0.34, 1.2, 0.64, 1], delay: 0.2 }}
            style={{
              transform: "rotate(-90deg)", transformOrigin: "100px 100px",
              filter: "url(#glow)", opacity: 0.7,
            }}
          />

          {/* Main ring */}
          <motion.circle cx="100" cy="100" r={R} fill="none"
            stroke="url(#sgGrad)" strokeWidth="16" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - pct) }}
            transition={{ duration: 1.8, ease: [0.34, 1.2, 0.64, 1], delay: 0.2 }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
          />
        </svg>

        {/* Handwriting score inside circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          {/* Animated counter */}
          <div
            style={{
              fontFamily: HANDWRITING,
              fontSize: "3.8rem",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              filter: counterDone ? "none" : "blur(0.5px)",
              transition: "filter 0.3s",
            }}
          >
            {displayCount}
          </div>
          <div
            style={{
              fontFamily: HANDWRITING,
              fontSize: "1.35rem",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            / {total}
          </div>
          {/* Percent — fades in after counter done */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: counterDone ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: HANDWRITING,
              fontSize: "1rem",
              color,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {percent}%
          </motion.div>
        </div>
      </div>

      {/* ── Grade banner — slides in after circle ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 1.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center mb-10"
      >
        <div
          className="flex items-center gap-3 px-7 py-4 rounded-2xl border-2 mb-3"
          style={{
            background: `${color}18`,
            borderColor: `${color}55`,
            boxShadow: `0 8px 32px ${color}30`,
          }}
        >
          <span className="text-3xl">{emoji}</span>
          <span className="text-2xl font-extrabold" style={{ color }}>{grade}!</span>
        </div>
        <p className="text-white/40 text-sm text-center">
          {correct} correct answer{correct !== 1 ? "s" : ""} out of {total} questions
        </p>

        {/* Score bar */}
        <div className="w-full max-w-xs mt-4 h-2 bg-white/6 rounded-full overflow-hidden border border-white/8">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.2, delay: 1.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* ── Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="flex gap-3"
      >
        <Link href="/">
          <button className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-white/60 font-bold rounded-xl hover:bg-white/10 transition-all text-sm">
            <Home className="h-4 w-4" /> Dashboard
          </button>
        </Link>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-white text-sm transition-all shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            boxShadow: `0 6px 20px ${color}44`,
          }}
        >
          Try Again <RefreshCw className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── MCQ Question Card ──────────────────────────────────────────────────────
function MCQCard({
  card, index, total, opts, selectedIdx, answered, imageUrl, accent, gradient,
  onSelect, onNext,
}: {
  card: Card; index: number; total: number;
  opts: Opt[]; selectedIdx: number | null; answered: boolean;
  imageUrl: string | null; accent: string;
  gradient: string[];
  onSelect: (i: number) => void;
  onNext: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const hasImg = !!imageUrl && !imgErr;

  // Reset img error when card changes
  useEffect(() => { setImgErr(false); }, [imageUrl]);

  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-2xl px-4 flex flex-col items-center z-10"
    >
      {/* Progress */}
      <div className="w-full flex items-center gap-3 mb-6">
        <div className="flex-1 bg-white/5 border border-white/10 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}, ${accent}bb)` }}
            animate={{ width: `${(index / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">{index + 1} / {total}</span>
      </div>

      {/* Question card with background image */}
      <div
        className="relative w-full rounded-3xl overflow-hidden mb-5 flex flex-col justify-between"
        style={{
          minHeight: 220,
          background: hasImg ? undefined : `linear-gradient(145deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`,
        }}
      >
        {hasImg && (
          <>
            <img
              src={imageUrl!}
              alt="topic"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgErr(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
          </>
        )}
        {!hasImg && (
          <>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)",
              }}
            />
          </>
        )}

        <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full" style={{ minHeight: 220 }}>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
              style={{ background: `${accent}22`, borderColor: `${accent}55`, color: accent }}
            >
              <Sparkles className="h-3 w-3" />
              Question {index + 1}
            </div>
          </div>

          {/* Question text */}
          <div className="flex-1 flex items-center">
            <h3
              className="text-white leading-relaxed drop-shadow-lg"
              style={{ fontFamily: HANDWRITING, fontSize: "1.55rem", fontWeight: 800, lineHeight: 1.4 }}
            >
              {card.front}
            </h3>
          </div>

          {/* Hint */}
          {!answered && (
            <p className="text-white/35 text-xs font-semibold mt-3">Choose the correct answer below →</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="w-full grid grid-cols-1 gap-3 mb-5">
        {opts.map((opt, i) => {
          const isSelected  = selectedIdx === i;
          const isCorrectOp = opt.isCorrect;

          let bg = "rgba(255,255,255,0.06)";
          let border = "rgba(255,255,255,0.12)";
          let textColor = "rgba(255,255,255,0.85)";
          let icon = null;

          if (answered) {
            if (isSelected && isCorrectOp)  { bg = "rgba(16,185,129,0.22)";  border = "rgba(52,211,153,0.60)";  textColor = "#6ee7b7"; icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />; }
            else if (isSelected && !isCorrectOp) { bg = "rgba(239,68,68,0.22)";  border = "rgba(248,113,113,0.60)"; textColor = "#fca5a5"; icon = <XCircle className="h-5 w-5 text-red-400 shrink-0" />; }
            else if (!isSelected && isCorrectOp) { bg = "rgba(16,185,129,0.10)";  border = "rgba(52,211,153,0.35)";  textColor = "#6ee7b7"; icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 opacity-70" />; }
            else { bg = "rgba(255,255,255,0.02)"; border = "rgba(255,255,255,0.06)"; textColor = "rgba(255,255,255,0.25)"; }
          }

          return (
            <motion.button
              key={i}
              onClick={() => !answered && onSelect(i)}
              disabled={answered}
              whileHover={!answered ? { scale: 1.01, x: 2 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              animate={
                answered && isSelected && !isCorrectOp
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : answered && isSelected && isCorrectOp
                  ? { scale: [1, 1.03, 1] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all disabled:cursor-default"
              style={{ background: bg, borderColor: border, cursor: answered ? "default" : "pointer" }}
            >
              {/* Label badge */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                style={{
                  background: answered
                    ? (isCorrectOp ? "rgba(16,185,129,0.25)" : isSelected ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.05)")
                    : "rgba(255,255,255,0.10)",
                  color: answered
                    ? (isCorrectOp ? "#6ee7b7" : isSelected ? "#fca5a5" : "rgba(255,255,255,0.2)")
                    : "rgba(255,255,255,0.7)",
                }}
              >
                {OPT_LABELS[i]}
              </div>

              {/* Option text */}
              <span className="text-sm font-semibold leading-snug flex-1" style={{ color: textColor }}>
                {shortOpt(opt.text)}
              </span>

              {/* Right/wrong icon */}
              {answered && icon}
            </motion.button>
          );
        })}
      </div>

      {/* Explanation (shown after answer) */}
      {answered && card.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex items-start gap-3 p-4 rounded-2xl mb-4"
          style={{ background: "rgba(99,102,241,0.12)", border: "1.5px solid rgba(99,102,241,0.30)" }}
        >
          <span className="text-lg shrink-0">💡</span>
          <p className="text-indigo-200 text-sm font-medium leading-relaxed">{card.explanation}</p>
        </motion.div>
      )}

      {/* Next button */}
      {answered && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-extrabold text-base text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 8px 24px ${accent}44` }}
        >
          {index + 1 < total ? "Next Question" : "See Results"}
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Main StudyDeck ─────────────────────────────────────────────────────────
export default function StudyDeck({
  cards, deckId, imageQuery, deckTitle,
}: {
  cards: Card[];
  deckId: string;
  imageQuery: string;
  deckTitle: string;
}) {
  const [phase, setPhase] = useState<Phase>("learn");

  // Quiz state
  const [quizReady,    setQuizReady]    = useState(false);  // setup done
  const [quizCards,    setQuizCards]    = useState<Card[]>([]);
  const [currentQIdx,  setCurrentQIdx]  = useState(0);
  const [qOpts,        setQOpts]        = useState<Opt[]>([]);
  const [selectedIdx,  setSelectedIdx]  = useState<number | null>(null);
  const [answered,     setAnswered]     = useState(false);
  const [scores,       setScores]       = useState<boolean[]>([]);
  const [showScore,    setShowScore]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // Build options whenever question changes
  useEffect(() => {
    if (!quizReady || quizCards.length === 0) return;
    setQOpts(buildOptions(cards, quizCards[currentQIdx]));
    setSelectedIdx(null);
    setAnswered(false);
  }, [currentQIdx, quizReady, quizCards.length]);

  const startQuiz = (count: number) => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, count);
    setQuizCards(shuffled);
    setCurrentQIdx(0);
    setScores([]);
    setShowScore(false);
    setQuizReady(true);
    setQOpts(buildOptions(cards, shuffled[0]));
    setSelectedIdx(null);
    setAnswered(false);
  };

  const handleSelect = async (idx: number) => {
    if (answered || submitting) return;
    setSubmitting(true);
    setSelectedIdx(idx);
    setAnswered(true);
    const isCorrect = qOpts[idx].isCorrect;
    setScores(prev => [...prev, isCorrect]);
    await submitReview(quizCards[currentQIdx].id, isCorrect ? 3 : 0).catch(console.error);
    setSubmitting(false);
  };

  const handleNext = () => {
    if (currentQIdx < quizCards.length - 1) {
      setCurrentQIdx(i => i + 1);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setQuizReady(false);
    setQuizCards([]);
    setCurrentQIdx(0);
    setScores([]);
    setShowScore(false);
    setPhase("learn");
  };

  // Current quiz card helpers
  const curCard   = quizCards[currentQIdx];
  const imgUrl    = quizReady && curCard ? getImageUrl(imageQuery, currentQIdx) : null;
  const gradient  = QUIZ_GRADIENTS[currentQIdx % QUIZ_GRADIENTS.length];
  const accent    = QUIZ_ACCENTS[currentQIdx % QUIZ_ACCENTS.length];

  const correct = scores.filter(Boolean).length;

  return (
    <>
      {/* Left mode toggle */}
      <ModeToggle phase={phase} onChange={setPhase} />

      {/* Phase content */}
      <AnimatePresence mode="wait">

        {/* ── LEARN ── */}
        {phase === "learn" && (
          <motion.div key="learn"
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <FlashCardLearning cards={cards} onComplete={() => setPhase("quiz")} />
          </motion.div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && (
          <motion.div key="quiz"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            {/* Score screen */}
            {showScore && (
              <ScoreScreen correct={correct} total={quizCards.length} onRetry={resetQuiz} />
            )}

            {/* Setup screen */}
            {!showScore && !quizReady && (
              <QuizSetup total={cards.length} onStart={startQuiz} />
            )}

            {/* MCQ Questions */}
            {!showScore && quizReady && curCard && (
              <AnimatePresence mode="wait">
                <MCQCard
                  key={currentQIdx}
                  card={curCard}
                  index={currentQIdx}
                  total={quizCards.length}
                  opts={qOpts}
                  selectedIdx={selectedIdx}
                  answered={answered}
                  imageUrl={imgUrl}
                  accent={accent}
                  gradient={gradient}
                  onSelect={handleSelect}
                  onNext={handleNext}
                />
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* ── BOOKS ── */}
        {phase === "books" && (
          <motion.div key="books"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <BookLibrary query={deckTitle} />
          </motion.div>
        )}

        {/* ── MIND MAP ── */}
        {phase === "mindmap" && (
          <motion.div key="mindmap"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <MindMap cards={cards} deckTitle={deckTitle} />
          </motion.div>
        )}

        {/* ── VIDEO ── */}
        {phase === "video" && (
          <motion.div key="video"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <VideoTutor deckTitle={deckTitle} />
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}
