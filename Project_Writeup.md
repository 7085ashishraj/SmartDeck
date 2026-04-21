# SmartDeck: Project Write-up

SmartDeck is an intelligent, spaced-repetition flashcard application that leverages modern AI to transform static educational materials (PDFs) into interactive, high-yield learning experiences.

## 🏗️ Architectural Decisions

1. **Next.js & Vercel Ecosystem**: Chosen for its seamless integration of edge/serverless API routes and React server components. This allowed us to build a full-stack application within a single cohesive codebase, optimizing developer velocity.
2. **Mistral AI Integration**: We opted to use Mistral's LLM (`mistral-small-latest`) configured to enforce strict JSON schemas. This provided an excellent balance of speed and reasoning, ensuring the flashcards generated were highly structured and immediately consumable by the database without complex post-processing.
3. **Prisma & PostgreSQL**: Used Prisma ORM for type-safe database interactions. This ensures that the relationship between Users, Decks, and Cards is strictly typed and maintainable.
4. **Server-Side PDF Parsing**: Implemented `pdf2json` entirely on the server to prevent heavy client-side processing, reducing the performance burden on the user's local device.

## ⚖️ Trade-offs

1. ⚠️ **File Size Limits vs. Infrastructure Complexity**
   - **Trade-off**: By utilizing Next.js/Vercel serverless functions to handle PDF uploads, we are naturally bounded by a strict `4.5MB` payload limit. 
   - **Reasoning**: We chose to implement a hard 4MB client-side limit rather than building an asynchronous chunked upload system with AWS S3. This kept the architecture simple and lean for initial rollout, though it sacrifices the ability to upload massive textbooks.
2. ⚠️ **Context Window Truncation**
   - **Trade-off**: To prevent exceeding Mistral's token limitations, the extracted text from PDFs is forcibly truncated (e.g., to ~15,000 - 40,000 characters). 
   - **Reasoning**: This heavily reduces API latency and prevents crashes, but means larger PDFs might only have their beginning sections turned into flashcards.
3. ⚠️ **Synchronous AI Processing**
   - **Trade-off**: The PDF parsing and Mistral API generation happen synchronously within a single HTTP request lifecycle. If the AI takes longer than Vercel's timeout limit, the request drops. 

## 🚀 Future Improvements

1. **RAG (Retrieval-Augmented Generation) Architecture**
   Instead of injecting raw, truncated text into the LLM, we should implement a vector database (like Pinecone) to chunk and store document embeddings. This would allow the system to intelligently query across hundreds of textbook pages and generate flashcards covering the entirety of the material.
2. **Asynchronous Processing Pipeline**
   Move file uploads directly to AWS S3/Supabase Storage, and trigger a background worker (e.g., using Upstash QStash or Inngest) to process the PDF. This entirely bypasses Vercel's 4.5MB payload limit and HTTP timeouts.
3. **Advanced Spaced Repetition Logic**
   Implement the FSRS (Free Spaced Repetition Scheduler) algorithm or a dynamic SuperMemo-2 adaptation that allows users to independently rate the "ease" of flashcards to fine-tune exactly when a card should reappear.
