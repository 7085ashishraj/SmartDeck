"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? null : password.length < 6 ? "weak" : password.length < 10 ? "fair" : "strong";

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden items-center justify-center p-16">
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-sm"
        >
          <div className="flex items-center gap-3 mb-14">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
              <BrainCircuit className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tighter">Smart<span className="text-blue-400">Deck</span></span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Start mastering<br />
            <span className="text-blue-400">any subject.</span>
          </h1>
          <p className="text-white/50 text-lg font-medium leading-relaxed">
            Join thousands of students who turn lectures and PDFs into powerful flashcard decks with AI.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: "⚡", text: "Generate cards from any PDF in seconds" },
              { icon: "🧠", text: "Spaced repetition to lock in your memory" },
              { icon: "📊", text: "Track your mastery across every topic" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-white/60 text-sm font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="p-2.5 bg-black rounded-xl">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-black tracking-tighter">Smart<span className="text-blue-600">Deck</span></span>
          </div>

          <h2 className="text-3xl font-black text-black tracking-tight mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm font-medium mb-10">Free forever. No credit card required.</p>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">You're in!</h3>
                <p className="text-gray-500 text-sm font-medium">Account created. Redirecting to your dashboard…</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-black placeholder:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-black placeholder:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-11 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-black placeholder:text-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  {passwordStrength && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex gap-1 flex-1">
                        {["weak", "fair", "strong"].map((level, i) => {
                          const filled = passwordStrength === "weak" ? i === 0 : passwordStrength === "fair" ? i <= 1 : true;
                          const color = passwordStrength === "weak" ? "bg-red-400" : passwordStrength === "fair" ? "bg-yellow-400" : "bg-green-400";
                          return <div key={level} className={`h-1 flex-1 rounded-full transition-all ${filled ? color : "bg-gray-100"}`} />;
                        })}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength === "weak" ? "text-red-400" : passwordStrength === "fair" ? "text-yellow-500" : "text-green-500"}`}>
                        {passwordStrength}
                      </span>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  id="signup-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><UserPlus className="h-4 w-4" /> Create Account</>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-400 text-sm font-medium mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
