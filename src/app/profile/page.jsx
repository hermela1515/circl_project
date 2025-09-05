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
    <main className="min-h-screen w-full bg-gradient-to-b from-purple-200 via-purple-100 to-white p-4 sm:p-6">
      <div className="w-full max-w-lg mx-auto bg-white shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-10 blur-3xl pointer-events-none"></div>

        <div className="relative group w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] z-10">
          <Image
            src={currentUser.profilePic}
            alt={currentUser.username}
            width={150}
            height={150}
            className="rounded-full object-cover border-4 border-purple-700 shadow-md w-full h-full"
          />
          <label className="absolute bottom-2 right-2 bg-purple-700 text-white p-2 rounded-full cursor-pointer hover:bg-purple-600 shadow-lg transition text-xs sm:text-sm">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            ✎
          </label>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-5 text-gray-900 tracking-wide z-10 text-center break-words">
          {currentUser.username}
        </h1>
        <div className="mt-3 text-center w-full z-10">
          {editingBio ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                rows={3}
                className="w-full text-sm sm:text-base text-black border rounded-xl p-2 sm:p-3 shadow-sm focus:ring-2 focus:ring-purple-600"
              />
              <button
                onClick={saveBio}
                className="px-4 sm:px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition shadow-md text-sm sm:text-base"
              >
                Save Bio
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-700 italic text-sm sm:text-base break-words">
                {currentUser.bio || "No bio yet."}
              </p>
              <button
                onClick={() => {
                  setEditingBio(true);
                  setNewBio(currentUser.bio || "");
                }}
                className="text-purple-700 hover:underline text-sm sm:text-base"
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
