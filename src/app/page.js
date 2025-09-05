"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push("/feed");
  };

  return (
    <main className="h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center">
      {/* Dark overlay for readability */}
      <div className="flex h-full w-full items-center justify-center bg-black/50 relative">
        {/* Logo + Title */}
        <div
          className={`flex items-center gap-4 sm:gap-6 text-white transition-all duration-1000 ${
            showButton ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          <img
            src="/images/circle.png"
            alt="Circl Logo"
            className="w-48 sm:w-64 md:w-80 lg:w-[26rem] xl:w-[30rem] h-auto drop-shadow-xl"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif tracking-wide">
            Circl
          </h1>
        </div>

        {/* Continue Button */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleContinue}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full w-36 sm:w-44 md:w-56 lg:w-60 font-medium shadow-md hover:shadow-xl hover:bg-gray-100 active:scale-95 transition-all duration-500
            ${showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            Continue
            <span className="text-lg sm:text-xl">&#8594;</span>
          </button>
        </div>
      </div>
    </main>
  );
}
