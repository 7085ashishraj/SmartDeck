export const maxDuration = 120;
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import PDFParser from "pdf2json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Fetch up to `count` real image URLs from Wikipedia for given search terms
async function fetchWikipediaImages(keywords: string[], count: number = 8): Promise<string[]> {
  const urls: string[] = [];

  for (const kw of keywords) {
    if (urls.length >= count) break;
    try {
      const searchTerm = encodeURIComponent(kw.trim().replace(/\s+/g, "_"));
      // Wikipedia summary API — returns thumbnail for an article
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${searchTerm}`,
        { headers: { "User-Agent": "SmartDeck/1.0 (educational flashcard app)" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const img = data?.originalimage?.source || data?.thumbnail?.source;
      if (img) urls.push(img);
    } catch {
      // silently continue
    }
  }

  // Fallback with Wikimedia search if not enough images
  if (urls.length < 3 && keywords.length > 0) {
    try {
      const query = encodeURIComponent(keywords.slice(0, 3).join(" "));
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&format=json&origin=*`,
        { headers: { "User-Agent": "SmartDeck/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        const pages = Object.values(data?.query?.pages || {}) as any[];
        for (const page of pages) {
          const img = page?.original?.source || page?.thumbnail?.source;
          if (img && !urls.includes(img)) urls.push(img);
          if (urls.length >= count) break;
        }
      }
    } catch {
      // silently continue
    }
  }

  return urls;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email
      ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
      : null;

    const formData = await req.formData();
    const file = formData.get("pdf") as File;
    const title = (formData.get("title") as string) || "Untitled Deck";

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // 1. Parse PDF using pdf2json
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
      pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
      pdfParser.parseBuffer(buffer);
    });

    // Trim text to avoid token limits
    if (text.length > 15000) text = text.substring(0, 15000);

    // 2. Query Mistral
    const prompt = `You are a world-class educator creating flashcards EXCLUSIVELY from the student's uploaded notes below.

STRICT RULES:
- Every single card MUST be based DIRECTLY on content present in the TEXT provided below.
- Do NOT use any outside knowledge, general facts, or assumptions not found in the text.
- Generate 20-30 flashcards that cover the material COMPREHENSIVELY.
- Cover: key concepts, definitions, named entities, dates, cause-and-effect relationships, comparisons, and significance.
- "front": A specific, clear question referencing something from the text. Not vague.
- "back": A precise, complete answer drawn directly from the text. Not just one word.
- "explanation": WHY this is important based on what the text says, and how it connects to other ideas in the text.
- Vary question types: definitions, cause-and-effect, significance, comparisons, timeline events.
- Cards must feel handcrafted by an expert teacher — NOT scraped by a bot.

Also identify 4-8 Wikipedia article titles (exact article names that exist on Wikipedia) that are most visually and topically relevant to this document (e.g. for French Revolution notes: ["French Revolution","Marie Antoinette","Bastille","Reign of Terror"]).

Output ONLY raw JSON in this exact structure:
{ "wikiTopics": ["Topic1","Topic2","Topic3","Topic4"], "cards": [ { "front": "...", "back": "...", "explanation": "..." } ] }

STUDENT'S UPLOADED TEXT:
${text}`;

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" },
    });

    const content = chatResponse.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "Failed to generate cards from AI." }, { status: 500 });

    // 3. Parse JSON
    let cardsData: any[] = [];
    let wikiTopics: string[] = [];
    try {
      const parsed = JSON.parse(content as string);
      cardsData = parsed.cards || [];
      wikiTopics = parsed.wikiTopics || [];
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    if (cardsData.length === 0) {
      return NextResponse.json({ error: "No flashcards were generated." }, { status: 500 });
    }

    // 4. Fetch real images from Wikipedia (server-side, no CORS issues)
    const imageUrls = await fetchWikipediaImages(wikiTopics, 10);
    const imageQuery = imageUrls.join(","); // store as comma-separated actual URLs

    console.log(`[generate] Got ${imageUrls.length} Wikipedia images for topics: ${wikiTopics.join(", ")}`);

    // 5. Save to DB
    const deck = await prisma.deck.create({
      data: {
        title,
        description: `Generated from ${file.name}`,
        imageQuery,
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
    return NextResponse.json({ success: true, deckId: deck.id });
  } catch (err: any) {
    console.error("[/api/generate] Error:", err);
    return NextResponse.json({ error: err.message || "Unknown server error" }, { status: 500 });
  }
}
