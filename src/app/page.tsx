import { getDecks } from "./actions";
import UploadForm from "@/components/UploadForm";
import Link from "next/link";
import { BrainCircuit, Play, Layers, Flame, BookOpen, CheckCircle2 } from "lucide-react";

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
    <main className="min-h-screen bg-[#0A0A0B] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
              <BrainCircuit className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">SmartDeck</h1>
              <p className="text-blue-200/60 text-sm font-medium">Flashcards powered by Spaced Repetition</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Form */}
          <div className="flex flex-col">
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Turn any PDF into a <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mastery Deck.</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-md">
              Upload your class notes or textbook chapters. Our AI tutor will instantly extract key concepts and build a smart spaced-repetition deck for you.
            </p>
            <UploadForm />
          </div>

          {/* Right Column: Decks */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <Layers className="h-6 w-6 text-indigo-400" />
              <h3 className="text-2xl font-bold text-white">Your Decks ({decks.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decks.length === 0 ? (
                <div className="col-span-full p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md text-center">
                  <BookOpen className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No decks yet. Upload a PDF to generate your first one!</p>
                </div>
              ) : (
                decks.map(deck => {
                  const stats = getMasteryStats(deck.cards);
                  const masteryPct = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                  return (
                    <div key={deck.id} className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-blue-500/40 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-bold text-white line-clamp-1 flex-1 pr-2">{deck.title}</h4>
                          {stats.due > 0 && (
                            <span className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-orange-300 bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 rounded-full">
                              <Flame className="h-3 w-3" /> {stats.due} due
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-3">{deck.description}</p>

                        {/* Mastery Progress Bar */}
                        <div className="mb-1 flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mastery</span>
                          <span className="text-[10px] font-bold text-emerald-400">{masteryPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                            style={{ width: `${masteryPct}%` }}
                          />
                        </div>

                        {/* Card Stats */}
                        <div className="flex items-center gap-2 text-[10px] font-semibold mb-4">
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">{stats.mastered} mastered</span>
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{stats.learning} learning</span>
                          <span className="px-1.5 py-0.5 bg-gray-500/10 text-gray-400 rounded">{stats.newCards} new</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{stats.total} cards total</span>
                        </div>
                        <Link href={`/deck/${deck.id}`}>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95">
                            <Play className="h-3 w-3 ml-0.5" />
                            {stats.due > 0 ? "Review Now" : "Study"}
                          </button>
                        </Link>
                      </div>
                    </div>
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
