"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image || !description) {
      alert("Please add both an image and description");
      return;
    }

    const existingPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const newPost = {
      id: Date.now(),
      description,
      image,
      likes: 0,
      username: "You",
      profilePic: "/images/default-profile.jpg",
    };

    localStorage.setItem("posts", JSON.stringify([newPost, ...existingPosts]));
    router.push("/feed");
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 shadow-2xl rounded-2xl p-6 w-full max-w-lg backdrop-blur-md"
      >
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-900 font-serif">
          ✨ Create a New Post
        </h1>

        {/* Upload section */}
        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-purple-100 file:text-purple-800
                       hover:file:bg-purple-200"
          />
        </label>

        {/* Image Preview */}
        {image && (
          <div className="mb-4">
            <img
              src={image}
              alt="Preview"
              className="w-full h-56 object-cover rounded-xl border shadow-md hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Description */}
        <textarea
          placeholder="📝 Write something about your post..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
          rows="4"
        ></textarea>

        {/* Post Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-800 to-purple-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
        >
          🚀 Share Post
        </button>
      </form>
    </main>
  );
}
