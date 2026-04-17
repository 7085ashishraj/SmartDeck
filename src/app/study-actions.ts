"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Basic SM-2 Implementation
// Ratings: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
export async function submitReview(cardId: string, rating: number) {
  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Card not found");

  let { interval, repetition, easeFactor } = card;

  // Convert 0-3 scale to logic
  if (rating >= 2) {
    // Correct-ish response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Incorrect response
    repetition = 0;
    interval = 1;
  }

  // Update ease factor: EFI := EFI + (0.1 - (3-q) * (0.08 + (3-q) * 0.02))
  easeFactor = easeFactor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  // We add 'interval' days
  // For demo testing, we could add minutes, but let's stick to days natively
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  await prisma.card.update({
    where: { id: cardId },
    data: {
      interval,
      repetition,
      easeFactor,
      nextReviewDate
    }
  });

  return { success: true };
}
