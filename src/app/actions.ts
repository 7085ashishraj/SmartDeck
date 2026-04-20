"use server";

if (typeof global !== "undefined" && typeof (global as any).DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {};
}

import PDFParser from "pdf2json";
import { Mistral } from "@mistralai/mistralai";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export async function processPdf(formData: FormData) {
  const session = await getServerSession(authOptions);
  const file = formData.get("pdf") as File;
  const title = (formData.get("title") as string) || "Untitled Deck";

  if (!file) throw new Error("No file uploaded");

  // 1. Parse PDF
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  let text = await new Promise<string>((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
    pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
    pdfParser.parseBuffer(buffer);
  });

  // Trim text if it's very long
  if (text.length > 40000) text = text.substring(0, 40000);

  // 2. Query Mistral
  const prompt = `You are an expert tutor. Create a set of high-quality flashcards based ONLY on the following text.
Extract the key concepts, definitions, and important relationships.
Output the result EXACTLY as a JSON object containing a single key "cards" which maps to an array of objects.
Each object MUST have three string fields: "front" (the question or term), "back" (the answer or definition), and "explanation" (brief context).
Do not return anything except the raw JSON.

TEXT:
${text}`;

  const chatResponse = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" },
  });

  // Mistral SDK types content as `string | ContentChunk[]` — extract plain string safely
  const rawContent = chatResponse.choices?.[0]?.message?.content;
  const content = typeof rawContent === "string"
    ? rawContent
    : Array.isArray(rawContent)
      ? rawContent.map((c: any) => c.text ?? "").join("")
      : null;
  if (!content) throw new Error("Failed to generate cards from AI.");

  // 3. Parse and Save
  let cardsData;
  try {
    const parsed = JSON.parse(content);
    cardsData = parsed.cards || [];
  } catch (e) {
    throw new Error("Failed to parse AI response.");
  }

  if (cardsData.length === 0) {
    throw new Error("No flashcards were generated.");
  }

  // Link deck to the logged-in user if available
  const userId = session?.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
    : null;

  const deck = await prisma.deck.create({
    data: {
      title,
      description: `Generated from ${file.name}`,
      ...(userId ? { userId } : {}),
    },
  });

  for (const card of cardsData) {
    await prisma.card.create({
      data: {
        front: card.front || "Missing",
        back: card.back || "Missing",
        explanation: card.explanation || "",
        deckId: deck.id,
      },
    });
  }

  revalidatePath("/");
  return { success: true, deckId: deck.id };
}

export async function getDecks() {
  const session = await getServerSession(authOptions);

  // If not logged in, return empty — users must be authenticated to see decks
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return [];

  return prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cards: true } },
      cards: {
        select: {
          repetition: true,
          easeFactor: true,
          nextReviewDate: true,
        }
      }
    },
  });
}

export async function deleteDeck(deckId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Ensure the deck belongs to this user before deleting
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
  });

  if (!deck) throw new Error("Deck not found or access denied");

  await prisma.deck.delete({ where: { id: deckId } });
  revalidatePath("/");
  return { success: true };
}
