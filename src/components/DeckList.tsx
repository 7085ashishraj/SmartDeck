"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Layers, BookOpen, Flame, ChevronRight, Search, Trash2, Loader2 
} from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";
import { deleteDeck } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";

function getMasteryStats(cards: any[]) {
  const now = new Date();
  const mastered = cards.filter(c => c.repetition >= 3 && c.easeFactor >= 2.2).length;
  const learning = cards.filter(c => c.repetition > 0 && c.repetition < 3).length;
  const due = cards.filter(c => new Date(c.nextReviewDate) <= now).length;
  const newCards = cards.filter(c => c.repetition === 0).length;
  return { mastered, learning, due, newCards, total: cards.length };
}

export default function DeckList({ initialDecks }: { initialDecks: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredDecks = initialDecks.filter(deck => 
    deck.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const executeDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDeck(id);
    } catch (err) {
      console.error("Failed to delete deck", err);
      alert("Failed to delete deck. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col">
      <ScrollReveal delay={0.5}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Layers className="h-5 w-5 text-gray-800" />
            </div>
            <h3 className="text-2xl font-bold text-black tracking-tight">
              Your Decks <span className="text-gray-400 font-medium ml-2">({filteredDecks.length})</span>
            </h3>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search decks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </ScrollReveal>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[400px] content-start relative">
        <AnimatePresence mode="popLayout">
          {filteredDecks.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="col-span-full py-20 px-8 rounded-[2rem] border border-gray-200 bg-white text-center shadow-xl h-fit"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-inner">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-black font-black text-xl mb-3">No matching decks</h4>
              <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Try adjusting your search query, or upload a new PDF to generate one.</p>
            </motion.div>
          ) : (
            filteredDecks.map((deck, idx) => {
              const stats = getMasteryStats(deck.cards);
              const masteryPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
              const isDeleting = deletingId === deck.id;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={deck.id}
                  className={`group relative p-8 rounded-[2rem] bg-[#0A0A0A] border border-black transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-2xl ${isDeleting ? 'opacity-50 pointer-events-none' : 'hover:-translate-y-2'}`}
                >
                  {/* Vedika-style accent circle for high contrast cards */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-colors duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors line-clamp-1 pr-3 leading-tight tracking-tight">{deck.title}</h4>
                      <div className="flex items-center gap-2">
                        {stats.due > 0 && (
                          <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A] bg-emerald-400 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                            <Flame className="h-3 w-3" /> {stats.due} DUE
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-8 font-medium leading-relaxed">{deck.description}</p>

                    {/* Progress */}
                    <div className="mb-2 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block">Mastery</span>
                      <span className="text-[10px] font-black text-white px-2 py-0.5 bg-white/10 rounded-sm block">{masteryPct}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                      <div
                        className="h-full bg-blue-500 transition-all duration-700 ease-out relative"
                        style={{ width: `${masteryPct}%` }}
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                      <span className="px-2.5 py-1.5 bg-white/5 text-gray-300 rounded-md">
                        <span className="text-white mr-1">{stats.mastered}</span> mastered
                      </span>
                      <span className="px-2.5 py-1.5 bg-white/5 text-gray-300 rounded-md">
                        <span className="text-white mr-1">{stats.learning}</span> learning
                      </span>
                    </div>
                  </div>

                  {/* Action Area */}
                  <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="text-xs text-gray-400 font-bold tracking-wide flex items-center gap-3">
                      {stats.total} CARDS
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(deck.id); }}
                        disabled={isDeleting}
                        className="p-2 -ml-2 rounded-full hover:bg-red-50 border border-transparent hover:border-red-100 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        title="Delete Deck"
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                    <Link href={`/deck/${deck.id}`}>
                      <button 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all active:scale-95 ${
                          stats.due > 0 
                          ? "bg-white text-black hover:bg-gray-200" 
                          : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {stats.due > 0 ? (
                          <>REVIEW <ChevronRight className="h-3 w-3" /></>
                        ) : (
                          "OPEN"
                        )}
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Modern Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-200 shadow-2xl rounded-[2rem] p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2 tracking-tight">Delete Deck?</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">This action cannot be undone. All flashcards within this deck will be permanently removed.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-bold rounded-xl transition-all active:scale-95 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    executeDelete(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 border border-red-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(239,68,68,0.4)] transition-all active:scale-95 text-sm"
                >
                  Yes, delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
