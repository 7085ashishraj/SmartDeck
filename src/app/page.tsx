import { getDecks } from "./actions";
import UploadForm from "@/components/UploadForm";
import Link from "next/link";
import { BrainCircuit, Play, Layers, Flame, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";

function getMasteryStats(cards: any[]) {
  const now = new Date();
  const mastered = cards.filter(c => c.repetition >= 3 && c.easeFactor >= 2.2).length;
  const learning = cards.filter(c => c.repetition > 0 && c.repetition < 3).length;
  const due = cards.filter(c => c.nextReviewDate <= now).length;
  const newCards = cards.filter(c => c.repetition === 0).length;
  return { mastered, learning, due, newCards, total: cards.length };
}

export default async function Home() {
  const decks = await getDecks();

  return (
    <main className="min-h-screen relative overflow-hidden font-sans pb-20">

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-24 pb-20">
        
        {/* Header Logo Area */}
        <ScrollReveal>
          <header className="mb-24 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-black rounded-2xl shadow-xl">
                <BrainCircuit className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-black tracking-tighter">Smart<span className="text-blue-600">Deck</span></h1>
                <p className="text-gray-500 text-[11px] font-bold tracking-[0.2em] uppercase mt-1">Spaced Repetition AI</p>
              </div>
            </div>
          </header>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Hero & Form */}
          <div className="lg:col-span-5 flex flex-col">
            <ScrollReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-blue-600 text-xs font-bold w-fit mb-8 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
                Intelligence Applied
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h2 className="text-6xl sm:text-7xl font-black text-black leading-[1.05] tracking-tight mb-8">
                Master any topic <br />
                <span className="text-blue-600">
                  in record time.
                </span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-gray-600 border-l-4 border-gray-200 pl-4 text-lg mb-12 max-w-md leading-relaxed font-medium">
                Upload your class notes, textbooks, or PDFs. Our AI instantly transforms them into high-yield flashcards optimized for your memory.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.4}>
              <UploadForm />
            </ScrollReveal>
          </div>

          {/* Right Column: Decks */}
          <div className="lg:col-span-7 flex flex-col pt-8 lg:pt-0">
            <ScrollReveal delay={0.5}>
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Layers className="h-5 w-5 text-gray-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-black tracking-tight">Your Decks <span className="text-gray-400 font-medium ml-2">({decks.length})</span></h3>
                </div>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {decks.length === 0 ? (
                <ScrollReveal delay={0.6}>
                  <div className="col-span-full py-20 px-8 rounded-[2rem] border border-gray-200 bg-white text-center shadow-xl">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-inner">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-black font-black text-xl mb-3">No decks to study</h4>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto font-medium">Your mastery journey hasn't started yet. Upload your first PDF on the left to generate a smart deck.</p>
                  </div>
                </ScrollReveal>
              ) : (
                decks.map((deck, idx) => {
                  const stats = getMasteryStats(deck.cards);
                  const masteryPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                  
                  return (
                    <ScrollReveal delay={0.6 + (idx * 0.1)} key={deck.id}>
                      <div 
                        className="group relative p-8 rounded-[2rem] bg-[#0A0A0A] border border-black hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-2xl"
                      >
                        {/* Vedika-style accent circle for high contrast cards */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-colors duration-500" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors line-clamp-1 pr-3 leading-tight tracking-tight">{deck.title}</h4>
                            {stats.due > 0 && (
                              <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0A0A0A] bg-emerald-400 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                                <Flame className="h-3 w-3" /> {stats.due} DUE
                              </div>
                            )}
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
                          <div className="text-xs text-gray-400 font-bold tracking-wide">
                            {stats.total} CARDS
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
                      </div>
                    </ScrollReveal>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
