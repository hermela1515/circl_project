"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export default function Home() {
  const [showButton, setShowButton] = useState(false);
  const [showWordmark, setShowWordmark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t1 = setTimeout(() => setShowWordmark(true), 900);
    const t2 = setTimeout(() => setShowButton(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleContinue = () => {
    router.push("/login");
  };

  return (
    <main
      className={`${fraunces.variable} ${mono.variable} h-screen w-full bg-[#15121F] relative overflow-hidden flex items-center justify-center`}
    >
      <style jsx>{`
        @keyframes ringIn {
          from {
            opacity: 0;
            transform: scale(1.6);
          }
          to {
            opacity: var(--ring-opacity, 1);
            transform: scale(1);
          }
        }
        @keyframes wordmarkIn {
          from {
            opacity: 0;
            transform: translateY(8px);
            letter-spacing: 0.3em;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.02em;
          }
        }
        .ring {
          animation: ringIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .wordmark {
          animation: wordmarkIn 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* ambient background rings, always faint */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.05]">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[#FF5C7C]" />
        <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full border border-[#9D8DF1]" />
      </div>

      <div className="relative flex flex-col items-center justify-center px-4">
        {/* converging rings — the entrance moment */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 flex items-center justify-center">
          <div
            className="ring absolute inset-0 rounded-full border-2 border-[#FF5C7C]"
            style={{ "--ring-opacity": 0.9, animationDelay: "0.1s" }}
          />
          <div
            className="ring absolute inset-3 rounded-full border-2 border-[#FFC145]"
            style={{ "--ring-opacity": 0.75, animationDelay: "0.3s" }}
          />
          <div
            className="ring absolute inset-6 rounded-full border-2 border-[#9D8DF1]"
            style={{ "--ring-opacity": 0.6, animationDelay: "0.5s" }}
          />
          <span
            className="ring w-4 h-4 rounded-full bg-[#F5F1EA]"
            style={{ "--ring-opacity": 1, animationDelay: "0.8s" }}
          />
        </div>

        {showWordmark && (
          <h1 className="wordmark [font-family:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-semibold text-[#F5F1EA] tracking-tight mt-8">
            circl
          </h1>
        )}
        {showWordmark && (
          <p className="wordmark [font-family:var(--font-mono)] text-[11px] sm:text-xs text-[#ABA3C4] tracking-[0.25em] uppercase mt-3">
            one circle, no borders
          </p>
        )}
      </div>

      <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 w-full flex justify-center px-4">
        <button
          onClick={handleContinue}
          className={`flex items-center justify-center gap-2 px-7 py-3 bg-[#F5F1EA] text-[#15121F] font-medium rounded-full w-44 sm:w-52 md:w-60 text-sm sm:text-base transition-all duration-500 hover:bg-white ${
            showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          Continue
          <span className="text-lg">&#8594;</span>
        </button>
      </div>
    </main>
  );
}