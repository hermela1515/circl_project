"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat">
      <div className="flex min-h-screen w-full items-center justify-center bg-black/40 p-4">
        <form
          onSubmit={handleSignIn}
          className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-[500px] p-4 sm:p-6 md:p-8 bg-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-lg"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6 sm:mb-8">
            Sign In
          </h1>

          {/* Username */}
          <label className="block text-white mb-2 ml-2 text-sm sm:text-base">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white text-black h-9 sm:h-10 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 mb-4 sm:mb-6 text-sm sm:text-base"
          />

          {/* Password */}
          <label className="block text-white mb-2 ml-2 text-sm sm:text-base">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white text-black h-9 sm:h-10 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 mb-4 sm:mb-6 text-sm sm:text-base"
          />

          {/* Confirm Password */}
          <label className="block text-white mb-2 ml-2 text-sm sm:text-base">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white text-black h-9 sm:h-10 w-full rounded-xl sm:rounded-2xl px-3 sm:px-4 mb-4 sm:mb-6 text-sm sm:text-base"
          />

          {/* Sign In button */}
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-900 w-full h-10 sm:h-12 rounded-2xl sm:rounded-3xl text-lg sm:text-xl text-white font-semibold"
          >
            Sign In
          </button>

          {/* Log In Link */}
          <div className="text-center mt-4 sm:mt-6">
            <Link
              href="/login"
              className="text-blue-300 hover:underline text-sm sm:text-base md:text-lg"
            >
              Already have an account? Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
