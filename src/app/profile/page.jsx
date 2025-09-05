"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) {
      setCurrentUser(savedUser);
      setNewBio(savedUser.bio || "This is my bio. Click edit to change it.");
    }
  }, []);

  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-base sm:text-lg text-gray-700 text-center">
          Please log in to view your profile.
        </p>
      </main>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...currentUser, profilePic: reader.result };
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBio = () => {
    const updatedUser = { ...currentUser, bio: newBio };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setEditingBio(false);
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-purple-200 via-purple-100 to-white p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto bg-white shadow-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-10 blur-3xl pointer-events-none"></div>

        <div className="relative group w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] z-10">
          <Image
            src={currentUser.profilePic}
            alt={currentUser.username}
            width={150}
            height={150}
            className="rounded-full object-cover border-3 sm:border-4 border-purple-700 shadow-md w-full h-full"
          />
          <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-purple-700 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-purple-600 shadow-lg transition text-xs sm:text-sm">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            ✎
          </label>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-3 sm:mt-4 md:mt-5 text-gray-900 tracking-wide z-10 text-center break-words">
          {currentUser.username}
        </h1>
        <div className="mt-2 sm:mt-3 text-center w-full z-10">
          {editingBio ? (
            <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm md:text-base text-black border rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={saveBio}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-purple-700 text-white rounded-lg sm:rounded-xl hover:bg-purple-600 transition shadow-md text-xs sm:text-sm md:text-base"
              >
                Save Bio
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <p className="text-gray-700 italic text-xs sm:text-sm md:text-base break-words">
                {currentUser.bio || "No bio yet."}
              </p>
              <button
                onClick={() => {
                  setEditingBio(true);
                  setNewBio(currentUser.bio || "");
                }}
                className="text-purple-700 hover:underline text-xs sm:text-sm md:text-base"
              >
                Edit Bio
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
