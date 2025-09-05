"use client";
 // Not strictly needed if used in a client parent, but safe

export default function PostCard({ post }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="font-semibold text-lg">{post.title}</h2>
        <p className="text-gray-600 text-sm mt-1">{post.description}</p>
      </div>
    </div>
  );
}
