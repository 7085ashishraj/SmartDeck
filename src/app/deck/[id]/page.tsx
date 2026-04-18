import { PrismaClient } from "@prisma/client";
import StudyDeck from "@/components/StudyDeck";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function DeckPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const deck = await prisma.deck.findUnique({
    where: { id: params.id },
    include: {
      cards: {
        orderBy: { nextReviewDate: "asc" }
      }
    }
  });

  if (!deck) return notFound();

  const now = new Date();
  const cardsToReview = deck.cards;
  const dueCardsCount = deck.cards.filter(c => c.nextReviewDate <= now).length;

  return (
    <main className="min-h-screen bg-[#0A0A0B] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative overflow-hidden flex flex-col items-center pt-8">
      <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl px-4 flex items-center justify-between mb-12 z-10">
        <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Decks
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white mb-1">{deck.title}</h1>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            {dueCardsCount} Due for Review
          </div>
        </div>
      </div>

      <StudyDeck cards={cardsToReview} deckId={deck.id} imageQuery={deck.imageQuery || ""} deckTitle={deck.title} />
    </main>
  );
}
