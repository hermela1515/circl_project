"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    // For now, just log values (replace with API call later)
    console.log("Logging in with:", { username, password });

    // 🔹 Redirect to feed after successful login
    router.push("/feed");
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
          onSubmit={handleLogin}
          className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-[500px] p-4 sm:p-6 md:p-8 bg-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-lg"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6 sm:mb-8">
            Log In
          </h1>

          {/* Username */}
          <label className="block text-white mb-2 ml-2 text-sm sm:text-base">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white text-black h-9 sm:h-10 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 mb-4 sm:mb-6 text-sm sm:text-base"
          />

          {/* Password */}
          <label className="block text-white mb-2 ml-2 text-sm sm:text-base">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white text-black h-9 sm:h-10 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 mb-3 sm:mb-4 text-sm sm:text-base"
          />

          {/* Forget password */}
          <div className="text-right mb-4 sm:mb-6">
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm text-blue-300 hover:underline"
            >
              Forget password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-900 w-full h-10 sm:h-12 rounded-2xl sm:rounded-3xl text-lg sm:text-xl text-white font-semibold"
          >
            Log In
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-4 sm:mt-6">
            <Link
              href="/signin"
              className="text-blue-300 hover:underline text-sm sm:text-base md:text-lg"
            >
              Don't have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
