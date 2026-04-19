import { PrismaClient } from "@prisma/client";
import StudyDeck from "@/components/StudyDeck";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/common/ScrollReveal";

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
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center pt-8 pb-32">
      
      <ScrollReveal className="w-full max-w-5xl px-4 flex items-center justify-between mb-12 z-10">
        <Link href="/" className="flex items-center text-gray-600 hover:text-black transition-colors px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-black text-black tracking-tight mb-1">{deck.title}</h1>
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] uppercase font-black tracking-widest border border-emerald-100 shadow-sm">
            {dueCardsCount} Due
          </div>
        </div>
      </ScrollReveal>

      <div className="w-full relative z-10 flex flex-col items-center flex-1">
        <StudyDeck cards={cardsToReview} deckId={deck.id} imageQuery={deck.imageQuery || ""} deckTitle={deck.title} />
      </div>
    </main>
  );
}
