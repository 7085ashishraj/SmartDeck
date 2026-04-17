"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitReview } from "@/app/study-actions";
import { CheckCircle2, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react";
import Link from "next/link";


type Card = {
  id: string;
  front: string;
  back: string;
  explanation: string | null;
  interval: number;
};

// imageQuery stores comma-separated real Wikipedia image URLs
function getImageUrl(imageQuery: string, index: number): string | null {
  if (!imageQuery) return null;
  const urls = imageQuery.split(",").map(u => u.trim()).filter(Boolean);
  if (urls.length === 0) return null;
  return urls[index % urls.length];
}

// Fallback gradient themes if image fails to load
const FALLBACK_GRADIENTS = [
  "from-violet-900 via-purple-900 to-indigo-950",
  "from-rose-900 via-pink-900 to-fuchsia-950",
  "from-sky-900 via-blue-900 to-cyan-950",
  "from-amber-900 via-orange-900 to-red-950",
  "from-emerald-900 via-teal-900 to-cyan-950",
];

export default function StudyDeck({
  cards,
  deckId,
  imageQuery,
}: {
  cards: Card[];
  deckId: string;
  imageQuery: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(cards.length === 0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const fallbackGradient = FALLBACK_GRADIENTS[currentIndex % FALLBACK_GRADIENTS.length];

  // Preload next image
  useEffect(() => {
    if (!imageQuery || currentIndex >= cards.length - 1) return;
    const nextUrl = getImageUrl(imageQuery, currentIndex + 1);
    if (!nextUrl) return;
    const img = new window.Image();
    img.src = nextUrl;
  }, [currentIndex, imageQuery, cards.length]);

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl max-w-lg w-full mt-10 z-10 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">Session Complete! 🎉</h2>
        <p className="text-gray-400 text-lg mb-8">
          Great work! Your deck is updated. Come back when cards are due.
        </p>
        <Link href="/">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Return to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const card = cards[currentIndex];
  const imageUrl = getImageUrl(imageQuery, currentIndex);
  const hasImage = !!imageUrl && !imgError[currentIndex];

  const handleNext = async (rating: number) => {
    if (submitting) return;
    setSubmitting(true);
    setDirection(1);
    await submitReview(card.id, rating).catch(console.error);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((c) => c + 1);
        setIsFlipped(false);
      } else {
        setFinished(true);
      }
      setSubmitting(false);
    }, 200);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 380 : -380, opacity: 0, scale: 0.93, rotate: d > 0 ? 3 : -3 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1, rotate: 0 },
    exit: (d: number) => ({ zIndex: 0, x: d < 0 ? 380 : -380, opacity: 0, scale: 0.93 }),
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col items-center z-10">

      {/* Progress Bar */}
      <div className="w-full flex items-center gap-3 mb-8">
        <div className="flex-1 bg-white/5 border border-white/10 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 rounded-full"
            animate={{ width: `${(currentIndex / cards.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <div className="relative w-full h-[440px] sm:h-[480px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex + (isFlipped ? "-back" : "-front")}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 280, damping: 26, opacity: { duration: 0.15 } }}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {!isFlipped ? (
              /* ===== FRONT: Topic Image Background ===== */
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50">
                {/* Background Image */}
                {hasImage ? (
                  <>
                    <img
                      src={imageUrl!}
                      alt="topic"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setImgError(prev => ({ ...prev, [currentIndex]: true }))}
                    />
                    {/* Strong dark overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/80" />
                  </>
                ) : (
                  /* Fallback gradient if image fails */
                  <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
                )}

                {/* Card content over image */}
                <div className="relative z-10 flex flex-col h-full p-8 sm:p-10 justify-between">
                  <div className="flex items-center gap-2">
                    {hasImage ? (
                      <ImageIcon className="h-4 w-4 text-white/50" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-white/50" />
                    )}
                    <span className="text-xs font-extrabold uppercase tracking-widest text-white/50">
                      Question {currentIndex + 1}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center py-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white leading-relaxed drop-shadow-lg">
                      {card.front}
                    </h3>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-white/40 animate-bounce">
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm font-semibold">Tap to reveal answer</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ===== BACK: Split layout - small image top, answer below ===== */
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-white flex flex-col">
                {/* Top strip: blurred topic image */}
                {hasImage && (
                  <div className="relative h-28 w-full shrink-0 overflow-hidden">
                    <img
                      src={imageUrl!}
                      alt="topic"
                      className="w-full h-full object-cover scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 flex items-center px-8">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-white/70 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                        ✓ Answer
                      </span>
                    </div>
                  </div>
                )}

                {/* Answer Content */}
                <div className={`flex-1 overflow-y-auto p-7 sm:p-8 flex flex-col justify-center ${!hasImage ? "pt-10" : ""}`}>
                  {!hasImage && (
                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">✓ Answer</span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed mb-4">
                    {card.back}
                  </h3>
                  {card.explanation && (
                    <div className="mt-3 pt-4 border-t border-gray-100">
                      <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
                        💡 {card.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* SM-2 Rating Buttons */}
      <div
        className={`w-full max-w-lg mt-8 grid grid-cols-4 gap-3 transition-all duration-300 ${
          isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {[
          { label: "Again", time: "< 1m", rate: 0, cls: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400" },
          { label: "Hard",  time: "1d",   rate: 1, cls: "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400" },
          { label: "Good",  time: "3d",   rate: 2, cls: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400" },
          { label: "Easy",  time: "7d+",  rate: 3, cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400" },
        ].map((btn) => (
          <motion.button
            key={btn.label}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleNext(btn.rate)}
            disabled={submitting}
            className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all ${btn.cls} disabled:opacity-40`}
          >
            <span className="font-bold text-base sm:text-lg leading-none mb-1">{btn.label}</span>
            <span className="text-[9px] uppercase font-extrabold tracking-widest opacity-60">{btn.time}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
