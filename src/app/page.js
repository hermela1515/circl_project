"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push("/login"); 
  };

  return (
    <main className="h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center">
      
      <div className="flex h-full w-full items-center justify-center bg-black/40 relative px-4">
      
        <div className="relative flex flex-col items-center justify-center">
          <img
            src="/images/circle.png"
            alt="Circl Logo"
            className="w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] xl:w-[36rem] h-auto max-w-full rounded-lg shadow-lg"
          />
          <h1
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 
            translate-x-6 sm:translate-x-8 md:translate-x-10 lg:translate-x-12 
            -translate-y-1/2 translate-y-6 sm:translate-y-8 md:translate-y-10
            text-lg sm:text-xl md:text-2xl font-bold font-serif text-white text-center"
          >
            Circl
          </h1>
        </div>
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2 w-full flex justify-center">
          <button
            onClick={handleContinue}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-3xl w-40 sm:w-48 md:w-60 transition-all duration-500
            ${showButton ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
          >
            Continue
            <span className="text-xl">&#8594;</span>
          </button>
        </div>
      </div>
    </main>
  );
}
