import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import ParticleNetwork from "@/components/common/ParticleNetwork";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "SmartDeck",
  description: "Advanced AI Spaced Repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-black selection:bg-blue-200">
        <Providers>
          <ParticleNetwork />
          
          {/* Subtle Vignette for White Theme */}
          <div className="fixed inset-0 pointer-events-none z-50 mix-blend-multiply opacity-20"
               style={{ background: "radial-gradient(circle, transparent 50%, #e0e0e0 150%)" }} />
               
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
