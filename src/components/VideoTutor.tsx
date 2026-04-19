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
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 shadow-sm">
          <PlayCircle className="h-4 w-4 text-rose-500" />
          <span className="text-sm font-bold text-rose-800 tracking-wide">Video Lessons</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-black mb-2 leading-tight tracking-tight">🎬 Find Video Lessons</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
          Search YouTube directly for the best educational videos on your topic.
          All videos open in a new tab so you never lose your place.
        </p>
      </div>

      {/* Main search card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-[2rem] overflow-hidden border border-gray-200 mb-8 bg-white shadow-xl relative"
      >
        <div className="p-8 sm:p-10 relative z-10">
          {/* YouTube branding strip */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-100 shadow-sm"
            >
              <Video className="h-5 w-5 text-red-500" />
              <span className="text-sm font-black text-red-700 tracking-wide">YouTube</span>
            </div>
            <span className="text-gray-400 text-sm font-semibold tracking-wide uppercase text-[11px]">educational video search</span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter topic to search…"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-black text-sm placeholder-gray-400 outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 transition-all font-semibold shadow-inner"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white font-bold text-sm shrink-0 shadow-lg bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-100 transition-all"
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
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 transition-all cursor-pointer shadow-sm"
          >
            <PlayCircle className="h-6 w-6 text-red-500" />
            <div className="text-left">
              <div className="text-black font-extrabold text-base">Open YouTube Search</div>
              <div className="text-red-700 text-xs font-semibold mt-0.5">"{keywords} explained for students"</div>
            </div>
            <ExternalLink className="h-5 w-5 text-red-400 ml-auto" />
          </motion.button>
        </div>
      </motion.div>

      {/* Suggested search pills */}
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 pl-2">
          Suggested Searches
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {variants.map((v, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ scale: 1.01, x: 4, backgroundColor: "#f9fafb" }} // hover:bg-gray-50 equivalent but exact hex per frame motion reqs
              whileTap={{ scale: 0.98 }}
              onClick={() => openYouTube(v.label)}
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 text-left transition-all group bg-white shadow-sm hover:shadow-md"
            >
              <span className="text-2xl shrink-0">{v.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-black transition-colors truncate">
                  {v.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Opens on YouTube</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div
        className="mt-8 flex items-start gap-4 p-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 shadow-sm"
      >
        <span className="text-2xl shrink-0 leading-none">💡</span>
        <p className="text-indigo-900 text-sm leading-relaxed font-medium">
          <strong className="text-indigo-700 font-extrabold mr-1">Tip:</strong> Search for "{keywords} animation" or "{keywords} whiteboard" for visually rich explanations that are great for visual learners.
        </p>
      </div>
    </div>
  );
}
