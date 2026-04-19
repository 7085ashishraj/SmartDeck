"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked, Download, ExternalLink, Search,
  Loader2, BookOpen, AlertCircle
} from "lucide-react";

// Extract clean topics from deck title for the visible search bar
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
  return words.slice(0, 4).join(" ") || "study notes";
}

type UnifiedBook = {
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  year?: string;
  infoLink: string;
  downloadLink?: string | null;
  source: string;
};

export default function BookLibrary({ query }: { query: string }) {
  const cleanQuery = extractBookKeywords(query);
  const [books, setBooks] = useState<UnifiedBook[]>([]);
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
      // 1. Force the search to prioritize NCERT and Indian syllabus books secretly
      const optimizedQuery = `${q.trim()} NCERT CBSE textbook India`;
      
      const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(optimizedQuery)}&maxResults=15&printType=books`;
      const gRes = await fetch(gUrl, { signal: abortRef.current.signal });
      
      if (!gRes.ok) {
        throw new Error(`Google API failed with status ${gRes.status}`);
      }
      
      const gData = await gRes.json();
      
      if (gData.items && gData.items.length > 0) {
        const mappedBooks: UnifiedBook[] = gData.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo?.title || "Unknown Title",
          authors: item.volumeInfo?.authors || ["Unknown Author"],
          coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace("http:", "https:"),
          year: item.volumeInfo?.publishedDate?.split("-")[0],
          infoLink: item.volumeInfo?.infoLink || "#",
          downloadLink: null,
          source: "Google Books"
        }));
        setBooks(mappedBooks);
        setLoading(false);
        return;
      }
      
      throw new Error("No results found in Google Books");

    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.log("Falling back to Open Library API:", e.message);

      // 2. Fallback to Open Library if Google fails or has no results
      try {
        // Indian context for Open Library (more broad due to its limited metadata)
        const fallbackQuery = `${q.trim()} India`;
        const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(fallbackQuery)}&limit=15&fields=title,author_name,cover_i,key,ia,first_publish_year`;
        const olRes = await fetch(olUrl, { signal: abortRef.current.signal });
        
        if (!olRes.ok) throw new Error("Open Library API failed");
        
        const olData = await olRes.json();
        const mappedBooks: UnifiedBook[] = (olData.docs || []).map((doc: any) => ({
          id: doc.key || Math.random().toString(),
          title: doc.title || "Unknown Title",
          authors: doc.author_name || ["Unknown Author"],
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
          year: doc.first_publish_year?.toString(),
          infoLink: `https://openlibrary.org${doc.key}`,
          downloadLink: doc.ia && doc.ia.length > 0 ? `https://archive.org/download/${doc.ia[0]}/${doc.ia[0]}.pdf` : null,
          source: "Open Library"
        }));

        setBooks(mappedBooks);
        setLoading(false);

      } catch (fallbackErr: any) {
        if (fallbackErr.name !== "AbortError") {
          setError("Could not load books. Please check your connection and try again.");
          setLoading(false);
        }
      }
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
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm">
          <BookMarked className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-bold text-emerald-800 tracking-wide">Library</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-black mb-2 leading-tight tracking-tight">📚 Recommended Books</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
          Discover school and college level textbooks tailored to your study topic.
        </p>
      </div>

      {/* Search Input Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 mb-10 shadow-xl relative"
      >
        <form onSubmit={handleSearch} className="flex gap-3 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search for textbooks, authors, or subjects..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-black text-sm placeholder-gray-400 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all font-semibold shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white font-bold text-sm shrink-0 shadow-lg hover:scale-105 active:scale-95 transition-transform"
            style={{ background: "#059669", boxShadow: "0 4px 14px rgba(5, 150, 105, 0.4)" }}
          >
            Find Books
          </button>
        </form>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-emerald-700 font-bold animate-pulse">Searching global libraries...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-10 text-center shadow-sm">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-black font-bold text-lg mb-1 tracking-tight">No books found</h3>
          <p className="text-gray-500 text-sm font-medium">Try adjusting your search terms.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {books.map((book, i) => {
              return (
                <motion.div
                  key={book.id + "-" + i}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                  className="group relative rounded-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl"
                >
                  <div className="h-48 w-full bg-gray-50 relative p-4 flex items-center justify-center border-b border-gray-100">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-full object-contain rounded drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-gray-200 rounded flex items-center justify-center border border-gray-300 shadow-inner">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-black border border-gray-200 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                      {book.year}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-black font-extrabold text-[15px] leading-snug line-clamp-2" title={book.title}>
                        {book.title}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-xs font-semibold mb-4 line-clamp-1">
                      {book.authors.join(", ")}
                    </p>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                       <a
                          href={book.infoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 text-xs font-bold transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Info
                        </a>
                        {book.downloadLink ? (
                          <a
                            href={book.downloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-[0_4px_14px_rgba(5,150,105,0.4)]"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </a>
                        ) : (
                          <a
                            href={book.infoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-[0_4px_14px_rgba(5,150,105,0.4)]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Source
                          </a>
                        )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
