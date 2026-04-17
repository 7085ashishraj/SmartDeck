# 🧠 SmartDeck — AI-Powered Flashcard Engine

<div align="center">

![SmartDeck Banner](https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Brain_layers.png/320px-Brain_layers.png)

**Turn any PDF into a smart, spaced-repetition study deck — powered by Mistral AI.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Mistral AI](https://img.shields.io/badge/Mistral-AI-orange?style=for-the-badge)](https://mistral.ai)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?style=for-the-badge&logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

</div>

---

## ✨ Features

### 📥 Intelligent PDF Ingestion
Upload any class notes, textbook chapters, or study material in PDF format. SmartDeck extracts text and sends it through a carefully crafted **pedagogical prompt** to Mistral AI, generating 20–30 deep, teacher-quality flashcards covering:
- Key concepts & definitions
- Cause-and-effect relationships
- Dates, events, and significance  
- Comparison and application questions

### 🧠 SM-2 Spaced Repetition Algorithm
Every card is powered by the **SuperMemo-2 (SM-2)** algorithm — the gold standard in cognitive science for long-term memory retention:
- Rate cards as **Again / Hard / Good / Easy**
- The algorithm calculates the exact next review date per card
- Cards you struggle with appear more often; mastered cards fade away

### 📊 Progress & Mastery Dashboard
- Live **mastery progress bar** per deck (% mastered)
- **Mastered / Learning / New** pill badges per deck
- 🔥 **Due count badge** — see which decks need review right now
- Button dynamically changes to "Review Now" when cards are overdue

### 🖼️ Topic-Aware Card Backgrounds
- Mistral identifies the topic of your uploaded document
- Server-side fetches **real Wikipedia educational images** for those topics
- Card fronts show immersive **topic photographs** as backgrounds
- Card backs show a blurred image strip with clean answer text below

### 🎨 Premium UI / UX
- Dark glassmorphism design with animated gradient flares
- **Framer Motion** card flip & swipe animations
- Responsive layout — works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| AI | Mistral AI (`mistral-small-latest`) |
| ORM | Prisma v5 |
| Database | SQLite (local) / PostgreSQL (production) |
| PDF Parsing | pdf2json |
| Images | Wikipedia REST API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Mistral AI API key](https://console.mistral.ai)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/7085ashishraj/SmartDeck.git
cd SmartDeck

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your MISTRAL_API_KEY

# 4. Set up the database
npx prisma db push
npx prisma generate

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the root with:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
DATABASE_URL="file:./dev.db"
```

---

## 📁 Project Structure

```
smartdeck/
├── prisma/
│   └── schema.prisma          # Database models (Deck, Card with SM-2 fields)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard - deck listing with mastery stats
│   │   ├── actions.ts          # Server actions (getDecks)
│   │   ├── study-actions.ts    # SM-2 algorithm implementation
│   │   ├── api/generate/       # PDF parsing + Mistral AI + Wikipedia images
│   │   └── deck/[id]/          # Study session page
│   └── components/
│       ├── UploadForm.tsx      # Drag-and-drop PDF upload
│       └── StudyDeck.tsx       # Flashcard flip UI with Framer Motion
├── next.config.ts
└── tailwind.config.ts
```

---

## 🏗️ How It Works

```
PDF Upload → pdf2json parses text → Mistral AI generates cards + topic keywords
→ Wikipedia API fetches real images → Cards + images saved to SQLite
→ Student studies with flip animations → SM-2 ratings update nextReviewDate
→ Dashboard shows mastery progress live
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT License — feel free to use this for your own learning tools!

---

<div align="center">
  Built with ❤️ for the <strong>Cuemath Build Challenge</strong>
</div>
