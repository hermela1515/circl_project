"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");
  const router = useRouter();
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) {
      setCurrentUser(savedUser);
      setNewBio(savedUser.bio || "This is my bio. Click edit to change it.");
    }
  }, []);

  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-purple-100 p-4">
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
    <main className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 p-4 sm:p-6 relative overflow-hidden">
    
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/30 backdrop-blur-md hover:bg-white/50 text-purple-900 p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-md"
        title="Go Back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto bg-white/60 backdrop-blur-xl shadow-lg rounded-3xl p-6 sm:p-8 flex flex-col items-center relative border border-purple-200">
      
        <div className="relative group w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] z-10 mb-4">
          <Image
            src={currentUser.profilePic || "/images/default-avatar.png"}
            alt={currentUser.username}
            width={150}
            height={150}
            className="rounded-full object-cover border-4 border-white shadow-xl w-full h-full hover:scale-105 transition-transform duration-300"
          />
          <label className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-2 sm:p-2.5 rounded-full cursor-pointer hover:bg-purple-600 shadow-lg transition-all duration-300 hover:scale-110">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-xs sm:text-sm font-bold">✎</span>
          </label>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-2 text-purple-900 text-center">
          {currentUser.username}
        </h1>
        <div className="mt-4 text-center w-full z-10">
          {editingBio ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                rows={3}
                className="w-full text-sm md:text-base text-gray-800 bg-white border-2 border-purple-300 rounded-xl p-3 shadow-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2">
                <button
                  onClick={saveBio}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-md text-sm font-semibold"
                >
                  Save Bio
                </button>
                <button
                  onClick={() => setEditingBio(false)}
                  className="px-4 py-2 bg-purple-200 text-purple-900 rounded-xl hover:bg-purple-300 transition-all shadow-md text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white/70 rounded-xl p-3 w-full border border-purple-200 shadow-sm">
                <p className="text-gray-800 italic text-sm md:text-base break-words leading-relaxed">
                  {currentUser.bio || "No bio yet. Click edit to add one!"}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBio(true);
                  setNewBio(currentUser.bio || "");
                }}
                className="bg-purple-200 text-purple-900 hover:bg-purple-300 px-4 py-2 rounded-lg transition-all text-sm md:text-base font-medium border border-purple-300"
              >
                ✏️ Edit Bio
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
