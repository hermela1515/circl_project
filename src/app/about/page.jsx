"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat flex flex-col">
      {/* Overlay */}
      <div className="flex-1 flex items-center justify-center bg-black/40 p-4">
        <div className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-[700px] p-6 sm:p-8 md:p-10 bg-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-lg">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4 sm:mb-6">
            About <span className="text-blue-400">Circl</span>
          </h1>

          {/* Description */}
          <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed text-center mb-6 sm:mb-8">
            Welcome to <span className="font-semibold text-white">Circl</span> 🎉
            <br />
            A social media platform designed to bring people closer together.  
            Share your moments, connect with friends, and enjoy real-time updates
            with a simple, clean, and fun experience 🚀
          </p>

          {/* Back to home */}
          <div className="text-center">
            <Link
              href="/"
              className="bg-blue-950 hover:bg-blue-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl text-lg sm:text-xl text-white font-semibold shadow"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/70 text-gray-200 py-4 sm:py-6 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">Contact Us</h2>
        <p className="text-sm sm:text-base mb-1">Email: <a href="mailto:support@circl.com" className="text-blue-400 hover:underline">support@circl.com</a></p>
        <p className="text-sm sm:text-base mb-3 sm:mb-4">Phone: <a href="tel:+251900000000" className="text-blue-400 hover:underline">+251 900 000 000</a></p>
        <div className="mt-3 sm:mt-4 flex justify-center gap-3 sm:gap-6 flex-wrap">
          <a href="#" className="hover:text-blue-400 transition text-sm sm:text-base">🌐 Website</a>
          <a href="#" className="hover:text-blue-400 transition text-sm sm:text-base">📘 Facebook</a>
          <a href="#" className="hover:text-blue-400 transition text-sm sm:text-base">🐦 Twitter</a>
          <a href="#" className="hover:text-blue-400 transition text-sm sm:text-base">📸 Instagram</a>
        </div>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
          © {new Date().getFullYear()} Circl. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
