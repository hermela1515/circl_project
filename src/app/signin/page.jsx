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
    <main className="h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center">
      <div className="flex h-full w-full items-center justify-center bg-black/40">
        <form
          onSubmit={handleSignIn}
          className="h-auto w-[500px] p-8 bg-white/10 rounded-4xl shadow-lg"
        >
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            Sign In
          </h1>

          {/* Username */}
          <label className="block text-white mb-2 ml-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white text-black h-10 w-full rounded-2xl px-4 mb-6"
          />

          {/* Password */}
          <label className="block text-white mb-2 ml-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white text-black h-10 w-full rounded-2xl px-4 mb-6"
          />

          {/* Confirm Password */}
          <label className="block text-white mb-2 ml-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white text-black h-10 w-full rounded-2xl px-4 mb-6"
          />

          {/* Sign In button */}
          <button
            type="submit"
            className="bg-blue-950 hover:bg-blue-900 w-full h-12 rounded-3xl text-xl text-white font-semibold"
          >
            Sign In
          </button>

          {/* Log In Link */}
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-blue-300 hover:underline text-lg"
            >
              Already have an account? Log In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
