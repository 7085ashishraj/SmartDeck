"use client";

import { useState } from "react";
import { UploadCloud, Loader2, Sparkles } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="px-8 py-10 bg-white rounded-[2rem] border border-gray-200 shadow-xl max-w-lg w-full transition-all relative overflow-hidden">

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
          <Sparkles className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-black font-sans tracking-tight">
          Create Deck
        </h2>
      </div>
      
      <div className="mb-6">
        <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2.5">Topic / Title</label>
        <div className="relative">
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Intro to Machine Learning..." 
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
            required
          />
        </div>
      </div>

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="mt-4 flex flex-col justify-center items-center rounded-2xl border border-dashed border-gray-300 px-6 py-14 bg-gray-50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group relative overflow-hidden"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all duration-300 shadow-sm relative">
          <UploadCloud className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="text-center relative z-10">
          <div className="flex text-sm font-medium justify-center items-center">
            <span className="text-blue-600 group-hover:text-blue-700 transition-colors">
              Click to browse
            </span>
            <p className="pl-1.5 text-gray-500">or drag a PDF here</p>
            <input id="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFile} />
          </div>
          <div className="mt-4 flex justify-center">
             {file ? (
               <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 {file.name}
               </span>
             ) : (
               <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">PDF only</span>
             )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-xs font-bold text-center">{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={!file || loading}
        className="mt-8 w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm font-black tracking-wide text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
      >
        {loading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Parsing AI Flashcards...</> : "Generate SmartDeck"}
      </button>
    </form>
  );
}
