"use client";
import Link from "next/link";
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
    router.push("/feed"); 
  };
  return (
    <main className="h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center">
       <div className="absolute top-4 left-4 flex gap-15 ml-360 mt-10">
              <Link href="login" className="px-4 py-2  rounded-4xl shadow hover:bg-blue-950 transition">
                Login
              </Link>
              
              </div>
      <div className="flex h-full w-full items-center justify-center bg-black/40">
        
          <img
        src="/images/circle.png"
        alt="My Photo"
        className="w-150 h-auto rounded-lg shadow-lg justify-center"
      />
       
           <div className="absolute top-10 left-10 text-white mt-95 ml-210">
          <h1 className="text-4xl font-bold mb-2 font-serif">Circl</h1>
          
          </div>
          
           <div className="absolute top-10 left-10 text-black mt-120 ml-210 ">
           <button
             onClick={handleContinue}
        className={`flex items-center gap-2 px-6 py-3 bg-white text-black rounded-4xl h-10 w-60 pl-15 transition-all duration-500
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
