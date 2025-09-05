"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSignIn = (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // For now, just log values (replace with API call later)
    console.log("Signing in with:", { username, password });

    // Example: redirect after signup (replace with real logic)
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat relative">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-105"
        title="Go Back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>
      
      <div className="flex min-h-screen w-full items-center justify-center bg-black/40 p-4">
        <form
          onSubmit={handleSignIn}
          className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-[500px] p-4 sm:p-6 md:p-8 bg-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-lg"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent text-center mb-6 sm:mb-8 drop-shadow-lg">
            ✨ Sign In
          </h1>

          {/* Username */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-white mb-2 ml-2 text-sm sm:text-base drop-shadow-lg font-semibold">👤 Username</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="relative bg-white/20 backdrop-blur-md text-white h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 text-sm sm:text-base border-2 border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition-all duration-300 placeholder-white/70"
                placeholder="Choose a username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-white mb-2 ml-2 text-sm sm:text-base drop-shadow-lg font-semibold">🔒 Password</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative bg-white/20 backdrop-blur-md text-white h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 text-sm sm:text-base border-2 border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition-all duration-300 placeholder-white/70"
                placeholder="Create a password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-white mb-2 ml-2 text-sm sm:text-base drop-shadow-lg font-semibold">🔐 Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative bg-white/20 backdrop-blur-md text-white h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 text-sm sm:text-base border-2 border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 transition-all duration-300 placeholder-white/70"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full h-12 sm:h-14 rounded-2xl sm:rounded-3xl text-lg sm:text-xl text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            🎉 Sign In
          </button>

          {/* Log In Link */}
          <div className="text-center mt-4 sm:mt-6">
            <Link
              href="/login"
              className="text-blue-300 hover:text-blue-200 hover:underline text-sm sm:text-base md:text-lg transition-colors duration-300"
            >
              Already have an account? 🔐 Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
