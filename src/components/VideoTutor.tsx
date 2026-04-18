"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Search, ExternalLink, ArrowUpRight, Video } from "lucide-react";

function extractKeywords(title: string): string {
  const stop = new Set([
    "chapter","lesson","unit","notes","pdf","my","the","and","of","for","in","a","an",
    "to","is","are","was","were","be","been","have","has","had","do","does","did","from",
    "with","by","at","as","on","or","its","this","that","all","can","not","but","so",
    "very","just","about","into","through","2020","2021","2022","2023","2024","2025",
    "class","school","college","course","subject","book","test","exam",
    "introduction","intro","basic","advanced","complete","guide","upload","generated",
    "untitled","deck","flashcard","set",
  ]);
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w));
  return words.slice(0, 3).join(" ") || title.slice(0, 20);
}

// Suggested search variants for a topic
function getSearchVariants(q: string) {
  return [
    { label: `${q} explained simply`, icon: "🎓" },
    { label: `${q} animation video`, icon: "🎬" },
    { label: `${q} for beginners`,    icon: "🟢" },
    { label: `${q} class notes`,      icon: "📝" },
    { label: `${q} in 5 minutes`,     icon: "⏱️" },
    { label: `${q} exam revision`,    icon: "📚" },
  ];
}

export default function VideoTutor({ deckTitle }: { deckTitle: string }) {
  const keywords          = extractKeywords(deckTitle);
  const [query, setQuery] = useState(keywords);

  const openYouTube = (q: string) => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    openYouTube(query);
  };

  const variants = getSearchVariants(keywords);

  return (
    <div className="w-full max-w-5xl px-4 pb-28 z-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <PlayCircle className="h-4 w-4 text-rose-400" />
          <span className="text-sm font-bold text-white/70 tracking-wide">Video Lessons</span>
        </div>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">🎬 Find Video Lessons</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Search YouTube directly for the best educational videos on your topic.
          All videos open in a new tab so you never lose your place.
        </p>
      </div>

      {/* Main search card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-3xl overflow-hidden border border-white/10 mb-8"
        style={{
          background: "linear-gradient(145deg, rgba(220,38,38,0.12), rgba(239,68,68,0.06), rgba(10,10,16,0.8))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(239,68,68,0.3)",
        }}
      >
        <div className="p-8 sm:p-10">
          {/* YouTube branding strip */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: "rgba(239,68,68,0.18)", border: "1.5px solid rgba(239,68,68,0.35)" }}
            >
              <Video className="h-5 w-5 text-red-400" />
              <span className="text-sm font-black text-red-300 tracking-wide">YouTube</span>
            </div>
            <span className="text-white/30 text-sm">educational video search</span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter topic to search…"
                className="w-full bg-white/6 border border-white/12 rounded-2xl pl-11 pr-4 py-4 text-white text-sm placeholder-white/25 outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white font-bold text-sm shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg,#dc2626,#ef4444)", boxShadow: "0 6px 20px rgba(239,68,68,0.40)" }}
            >
              <ArrowUpRight className="h-4 w-4" />
              Search
            </motion.button>
          </form>

          {/* Big open button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openYouTube(`${keywords} explained for students`)}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed transition-all"
            style={{
              background: "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.35)",
            }}
          >
            <PlayCircle className="h-6 w-6 text-red-400" />
            <div className="text-left">
              <div className="text-white font-extrabold text-base">Open YouTube Search</div>
              <div className="text-red-300/60 text-xs font-medium">"{keywords} explained for students"</div>
            </div>
            <ExternalLink className="h-5 w-5 text-white/25 ml-auto" />
          </motion.button>
        </div>
      </motion.div>

      {/* Suggested search pills */}
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">
          Suggested Searches
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {variants.map((v, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openYouTube(v.label)}
              className="flex items-center gap-3 p-4 rounded-2xl border text-left transition-all group"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-2xl shrink-0">{v.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                  {v.label}
                </p>
                <p className="text-xs text-white/30 mt-0.5">Opens on YouTube</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div
        className="mt-6 flex items-start gap-3 p-4 rounded-2xl border"
        style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.20)" }}
      >
        <span className="text-lg shrink-0">💡</span>
        <p className="text-indigo-200/60 text-sm leading-relaxed">
          <strong className="text-indigo-300">Tip:</strong> Search for "{keywords} animation" or "{keywords} whiteboard" for visually rich explanations that are great for visual learners.
        </p>
      </div>
    </div>
  );
}
