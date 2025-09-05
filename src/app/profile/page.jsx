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
    <main className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 p-2 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        title="Go Back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>
      
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>

        <div className="relative group w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] z-10 mb-4">
          {/* Profile Image with Glow Effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full opacity-75 blur-sm" style={{animation: 'spin 8s linear infinite'}}></div>
            <Image
              src={currentUser.profilePic}
              alt={currentUser.username}
              width={150}
              height={150}
              className="relative rounded-full object-cover border-4 border-white/30 shadow-2xl w-full h-full hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Edit Button with Enhanced Styling */}
          <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 sm:p-2.5 rounded-full cursor-pointer hover:from-purple-700 hover:to-blue-700 shadow-xl transition-all duration-300 hover:scale-110 group-hover:shadow-2xl">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-xs sm:text-sm font-bold">✎</span>
          </label>
        </div>
        {/* Username with Gradient Text */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-2 sm:mt-3 md:mt-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-wide z-10 text-center break-words drop-shadow-lg">
          {currentUser.username}
        </h1>
        
        {/* Bio Section with Enhanced Styling */}
        <div className="mt-3 sm:mt-4 text-center w-full z-10">
          {editingBio ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm md:text-base text-gray-800 bg-white/80 backdrop-blur-sm border-2 border-white/30 rounded-xl p-3 sm:p-4 shadow-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={saveBio}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base font-semibold"
                >
                  Save Bio
                </button>
                <button
                  onClick={() => setEditingBio(false)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg text-xs sm:text-sm md:text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-full border border-white/20">
                <p className="text-white/90 italic text-xs sm:text-sm md:text-base break-words leading-relaxed">
                  {currentUser.bio || "No bio yet. Click edit to add one!"}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBio(true);
                  setNewBio(currentUser.bio || "");
                }}
                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-white hover:from-purple-500/30 hover:to-blue-500/30 px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base font-medium border border-white/20 hover:border-white/40"
              >
                ✏️ Edit Bio
              </button>
            </div>
          )}
        </div>
        
        {/* Stats Section */}
        <div className="mt-4 sm:mt-6 w-full grid grid-cols-3 gap-2 sm:gap-4 z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-center border border-white/20">
            <div className="text-white font-bold text-sm sm:text-base">0</div>
            <div className="text-white/70 text-xs sm:text-sm">Posts</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-center border border-white/20">
            <div className="text-white font-bold text-sm sm:text-base">0</div>
            <div className="text-white/70 text-xs sm:text-sm">Followers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-center border border-white/20">
            <div className="text-white font-bold text-sm sm:text-base">0</div>
            <div className="text-white/70 text-xs sm:text-sm">Following</div>
          </div>
        </div>
      </div>
    </main>
  );
}
