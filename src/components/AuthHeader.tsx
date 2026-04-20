"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-24 h-9 bg-gray-100 rounded-xl animate-pulse" />;
  }

  if (session?.user) {
    const initial = session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U";
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pl-1 pr-4 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">
            {initial}
          </div>
          <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
            {session.user.name || session.user.email}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all border border-gray-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all"
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign In
        </motion.button>
      </Link>
      <Link href="/signup">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-900 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-black/10"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Get Started
        </motion.button>
      </Link>
    </div>
  );
}
