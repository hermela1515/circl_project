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
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat p-2 sm:p-4 md:p-8">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8 justify-center sm:justify-start">
        <Link href="/" className="px-3 sm:px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition text-sm sm:text-base">
          Home
        </Link>
        <Link href="/explore" className="px-3 sm:px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition text-sm sm:text-base">
          Explore
        </Link>
        <Link href="/messages" className="px-3 sm:px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition text-sm sm:text-base">
          Messages
        </Link>
        <Link href="/profile" className="px-3 sm:px-4 py-2 rounded-lg shadow hover:bg-blue-950 text-white transition text-sm sm:text-base">
          Profile
        </Link>
      </div>

      <div className="max-w-sm sm:max-w-md md:max-w-2xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Settings</h1>

        {/* Username */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-1 font-semibold text-sm sm:text-base">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Email */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-1 font-semibold text-sm sm:text-base">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Password */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-1 font-semibold text-sm sm:text-base">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full border p-2 sm:p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Dark Mode */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <label className="font-semibold text-sm sm:text-base">Enable Dark Mode</label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 sm:px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}
