"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center flex flex-col">
      {/* Overlay */}
      <div className="flex-1 flex items-center justify-center bg-black/40">
        <div className="h-auto w-[700px] p-10 bg-white/10 rounded-4xl shadow-lg">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white text-center mb-6">
            About <span className="text-blue-400">Circl</span>
          </h1>

          {/* Description */}
          <p className="text-gray-200 text-lg leading-relaxed text-center mb-8">
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
              className="bg-blue-950 hover:bg-blue-900 px-8 py-3 rounded-3xl text-xl text-white font-semibold shadow"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/70 text-gray-200 py-6 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
        <p>Email: <a href="mailto:support@circl.com" className="text-blue-400 hover:underline">support@circl.com</a></p>
        <p>Phone: <a href="tel:+251900000000" className="text-blue-400 hover:underline">+251 900 000 000</a></p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-blue-400 transition">🌐 Website</a>
          <a href="#" className="hover:text-blue-400 transition">📘 Facebook</a>
          <a href="#" className="hover:text-blue-400 transition">🐦 Twitter</a>
          <a href="#" className="hover:text-blue-400 transition">📸 Instagram</a>
        </div>
        <p className="mt-4 text-sm text-gray-400">
          © {new Date().getFullYear()} Circl. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
