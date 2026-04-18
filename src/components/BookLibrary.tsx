"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked, Download, ExternalLink, Search,
  Loader2, BookOpen, AlertCircle
} from "lucide-react";

// Extract 2-3 meaningful keywords from deck title for better book search
function extractBookKeywords(title: string): string {
  const stop = new Set([
    "chapter","lesson","unit","notes","pdf","my","the","and","of","for","in","a","an",
    "to","is","are","was","were","be","been","have","has","had","do","does","did","from",
    "with","by","at","as","on","or","its","this","that","all","can","not","but","so",
    "very","just","about","into","through","2020","2021","2022","2023","2024","2025",
    "class","school","college","university","course","subject","book","test","exam",
    "introduction","intro","basic","advanced","complete","guide","upload","generated",
    "untitled","deck","flashcard","set",
  ]);
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stop.has(w));
  // Take up to 3 keywords and add "textbook" for school-level results
  const keywords = words.slice(0, 3).join(" ");
  return keywords ? `${keywords} textbook` : title.slice(0, 20) + " textbook";
}

type OLBook = {
  title: string;
  author_name?: string[];
  cover_i?: number;
  key: string;
  ia?: string[];
  first_publish_year?: number;
};

function getCoverUrl(id: number) {
  return `https://covers.openlibrary.org/b/id/${id}-M.jpg`;
}
function getBookUrl(key: string) {
  return `https://openlibrary.org${key}`;
}
function getDownloadUrl(ia: string) {
  return `https://archive.org/download/${ia}/${ia}.pdf`;
}

const CARD_ACCENTS = [
  "from-indigo-900 via-purple-900 to-violet-900",
  "from-rose-900 via-pink-900 to-fuchsia-900",
  "from-sky-900 via-blue-900 to-cyan-900",
  "from-amber-900 via-orange-900 to-yellow-900",
  "from-emerald-900 via-teal-900 to-green-900",
];

export default function BookLibrary({ query }: { query: string }) {
  const cleanQuery = extractBookKeywords(query);
  const [books, setBooks] = useState<OLBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(cleanQuery);
  const [activeQuery, setActiveQuery] = useState(cleanQuery);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBooks = async (q: string) => {
    if (!q.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setBooks([]);

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=15&fields=title,author_name,cover_i,key,ia,first_publish_year`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setBooks(data.docs ?? []);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError("Could not load books. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(activeQuery); }, [activeQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(inputValue);
  };

  return (
    <div className="w-full max-w-5xl px-4 pb-28 z-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
          <BookMarked className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-bold text-white/70 tracking-wide">Book Library</span>
        </div>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
          📚 Discover Related Books
        </h2>
        <p className="text-white/40 text-sm font-medium max-w-md mx-auto">
          Explore real books related to your study topic. Read online or download free PDFs from the Open Library.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-xl mx-auto">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search any topic, author, or title…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm font-medium placeholder-white/25 outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 shrink-0"
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-9 w-9 text-violet-400 animate-spin mb-4" />
          <p className="text-white/40 text-sm">Searching Open Library…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center py-16 gap-3">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 text-sm text-center max-w-sm">{error}</p>
          <button
            onClick={() => fetchBooks(activeQuery)}
            className="mt-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs font-bold hover:bg-white/10 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && books.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <BookOpen className="h-12 w-12 text-white/10 mb-4" />
          <p className="text-white/25 text-sm">No books found. Try a different search term.</p>
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && books.length > 0 && (
        <motion.div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
        >
          {books.map((book, i) => (
            <motion.div
              key={book.key + i}
              variants={{ hidden: { opacity: 0, y: 24, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }}
              className="flex flex-col rounded-2xl overflow-hidden border border-white/8 backdrop-blur-sm group transition-all hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10"
              style={{ background: "rgba(255,255,255,0.04)", boxShadow: "0 4px 24px rgba(0,0,0,0.32)" }}
            >
              {/* Cover */}
              <div
                className={`relative h-52 bg-gradient-to-br ${CARD_ACCENTS[i % CARD_ACCENTS.length]} overflow-hidden`}
              >
                {book.cover_i ? (
                  <img
                    src={getCoverUrl(book.cover_i)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-14 w-14 text-white/15" />
                  </div>
                )}

                {/* Year badge */}
                {book.first_publish_year && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white/60 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">
                    {book.first_publish_year}
                  </div>
                )}

                {/* Free badge */}
                {book.ia && book.ia.length > 0 && (
                  <div className="absolute top-2 left-2 bg-emerald-500/85 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                    Free PDF
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                  {book.title}
                </h3>
                {book.author_name && (
                  <p className="text-xs text-white/35 font-medium line-clamp-1">
                    {book.author_name.slice(0, 2).join(", ")}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-2 mt-auto pt-3">
                  <a
                    href={getBookUrl(book.key)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-500/12 border border-indigo-500/25 text-indigo-300 text-xs font-bold hover:bg-indigo-500/22 hover:border-indigo-400/40 transition-all"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Read
                  </a>
                  {book.ia && book.ia.length > 0 ? (
                    <a
                      href={getDownloadUrl(book.ia[0])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-300 text-xs font-bold hover:bg-emerald-500/22 hover:border-emerald-400/40 transition-all"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/4 border border-white/8 text-white/18 text-xs font-bold cursor-not-allowed">
                      <Download className="h-3 w-3" />
                      N/A
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
