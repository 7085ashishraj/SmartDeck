import { getDecks } from "./actions";
import UploadForm from "@/components/UploadForm";
import DeckList from "@/components/DeckList";
import AuthHeader from "@/components/AuthHeader";
import { BrainCircuit } from "lucide-react";
import ScrollReveal from "@/components/common/ScrollReveal";

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
            <AuthHeader />
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
            <DeckList initialDecks={decks} />
          </div>

        </div>
      </div>
    </main>
  );
}
