"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(".pdf", ""));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) setTitle(selected.name.replace(".pdf", ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", title || "Untitled Deck");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      if (data.deckId) {
        router.push(`/deck/${data.deckId}`);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to process PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full transition-all">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 mb-6 font-sans">
        New Smart Deck
      </h2>
      
      <div className="mb-5">
        <label className="block text-sm font-semibold text-blue-100 mb-2">Subject / Title</label>
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Intro to Machine Learning" 
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          required
        />
      </div>

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="mt-2 flex flex-col justify-center items-center rounded-2xl border-2 border-dashed border-white/20 px-6 py-12 bg-black/20 hover:bg-black/40 hover:border-blue-400/50 transition-all cursor-pointer group"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <UploadCloud className="h-14 w-14 text-blue-400/70 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300 mb-4" />
        <div className="text-center">
          <div className="mt-2 flex text-sm leading-6 text-gray-300 justify-center items-center">
            <span className="relative rounded-md font-semibold text-blue-400 hover:text-blue-300 focus-within:outline-none cursor-pointer">
              <span>Choose a PDF file</span>
              <input id="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFile} />
            </span>
            <p className="pl-2">or drag it here</p>
          </div>
          <p className="text-xs leading-5 text-gray-400/80 mt-2">
            {file ? <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-md">{file.name}</span> : "File must be a .pdf"}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
          <p className="text-red-300 text-sm font-medium text-center">{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={!file || loading}
        className="mt-8 w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
      >
        {loading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Parsing AI Flashcards...</> : "Generate SmartDeck"}
      </button>
    </form>
  );
}
