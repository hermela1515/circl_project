"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    alert("Settings saved!");
    setPassword(""); // clear password field
  };

  const handleCancel = () => {
    setUsername("John Doe");
    setEmail("john@example.com");
    setPassword("");
    setDarkMode(false);
  };

  return (
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat p-8">
      {/* Navigation */}
      <div className="flex gap-4  ml-270 mb-8">
        <Link href="/" className="px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition">
          Home
        </Link>
        <Link href="/explore" className="px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition">
          Explore
        </Link>
        <Link href="/messages" className="px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition">
          Messages
        </Link>
        <Link href="/profile" className="px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition">
          Profile
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dark Mode */}
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="w-5 h-5"
          />
          <label className="font-semibold">Enable Dark Mode</label>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}
