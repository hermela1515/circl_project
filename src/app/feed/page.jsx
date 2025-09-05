"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaSearch, FaTimes, FaArrowLeft } from "react-icons/fa";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    username: "John Doe",
    profilePic: "/images/default-profile.jpg",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch("https://jsonplaceholder.typicode.com/users");
        const usersData = await usersRes.json();

        const postsRes = await fetch("https://jsonplaceholder.typicode.com/posts");
        const postsData = await postsRes.json();

        const postsWithUsers = postsData.slice(0, 10).map((post) => {
          const user = usersData.find((u) => u.id === post.userId);
          const index = post.id;
          const gender = index % 2 === 0 ? "men" : "women";
          return {
            id: post.id,
            title: post.title ?? "",
            description: post.body ?? "",
            image: `https://picsum.photos/600/400?random=${index}`,
            profilePic: `https://randomuser.me/api/portraits/${gender}/${index}.jpg`,
            username: user ? `${user.name}#${index}` : `User${post.userId}`,
            likes: 0,
            comments: [],
            fromLocal: false,
          };
        });

        const localPosts = JSON.parse(localStorage.getItem("posts")) || [];
        const allPosts = [...localPosts, ...postsWithUsers];
        setPosts(allPosts);

        const savedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (savedUser) setCurrentUser(savedUser);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, likes: likedPosts[id] ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCommentInput = (id) => {
    setCommentInputs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = (id, comment) => {
    if (!comment) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              comments: [
                ...(post.comments || []),
                { text: comment, user: currentUser.username },
              ],
            }
          : post
      )
    );
    setCommentInputs((prev) => ({ ...prev, [id]: false }));

    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const updatedPosts = allPosts.map((post) =>
      post.id === id
        ? {
            ...post,
            comments: [
              ...(post.comments || []),
              { text: comment, user: currentUser.username },
            ],
          }
        : post
    );
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
  };

  const handleDeletePost = (id) => {
    const updatedPosts = posts.filter((post) => post.id !== id);
    setPosts(updatedPosts);

    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const newAllPosts = allPosts.filter((post) => post.id !== id);
    localStorage.setItem("posts", JSON.stringify(newAllPosts));
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedPost(null);
      document.body.style.overflow = 'auto';
    }, 300);
  };

  const filteredPosts = posts.filter(
    (post) =>
      (post.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.username ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10 text-white">Loading feed...</p>;

  return (
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 pt-4 gap-4">
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1 sm:gap-2">
            <Image
              src="/images/circlee.png"
              alt="Circl Logo"
              width={160}
              height={120}
              className="object-contain w-28 sm:w-36 md:w-44"
            />
            <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md -mt-1">
              Circl
            </span>
          </div>
          <button
            className="sm:hidden text-white text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto ${isMenuOpen ? 'flex' : 'hidden'} sm:flex`}>
          <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <Link href="/" className="text-white font-medium hover:text-blue-300 transition w-full sm:w-auto text-left">Home</Link>
            <Link href="/notfication" className="text-white font-medium hover:text-blue-300 transition w-full sm:w-auto text-left">Notifications</Link>
            <Link href="/post" className="text-white font-medium hover:text-blue-300 transition w-full sm:w-auto text-left"> Add Post</Link>
            
          </nav>

          <Link href="/profile" className="ml-0 sm:ml-4 -mt-1 sm:mt-0 self-start sm:self-auto">
            <Image
              src={currentUser.profilePic}
              alt={currentUser.username}
              width={40}
              height={40}
              className="rounded-full border-2 border-purple-500 shadow-lg w-10 h-10 sm:w-12 sm:h-12 object-cover"
            />
          </Link>
        </div>
      </header>
      <div className="max-w-3xl mx-auto mt-6 sm:mt-8 mb-6 px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 pl-10 py-2 sm:py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-md shadow-md text-black text-sm sm:text-base"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      <div className="flex flex-col gap-6 sm:gap-8 max-w-3xl mx-auto mt-4 sm:mt-6 px-4 pb-10">
        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-200 italic mt-10">No posts found.</p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              onClick={() => openPostModal(post)}
            >
              
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Image
                    src={post.profilePic ?? "/images/default-profile.jpg"}
                    alt={post.username ?? "User"}
                    width={36}
                    height={36}
                    className="rounded-full object-cover border border-purple-500 w-9 h-9 sm:w-10 sm:h-10"
                  />
                  <span className="font-semibold text-purple-900 text-sm sm:text-base">
                    {post.username ?? "User"}
                  </span>
                </div>

                {post.fromLocal && post.username === currentUser.username && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.id);
                    }}
                    className="text-red-600 hover:text-red-800 transition text-lg sm:text-xl ml-2"
                    title="Delete Post"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <div className="relative h-48 sm:h-64 md:h-72 w-full">
                <Image
                  src={post.image ?? "/images/sample.jpg"}
                  alt={post.title ?? "Post"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-gray-900">
                  {post.title ?? ""}
                </h2>
                <p className="text-gray-700 mb-4 text-sm sm:text-base line-clamp-2">
                  {post.description ?? ""}
                </p>
                <div className="flex items-center gap-4 sm:gap-6 mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    className={`text-xl sm:text-2xl transition transform hover:scale-125 ${
                      likedPosts[post.id]
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    {likedPosts[post.id] ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">{post.likes}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCommentInput(post.id);
                    }}
                    className="text-xl sm:text-2xl text-gray-500 hover:text-blue-500 transition transform hover:scale-125"
                  >
                    <FaComment />
                  </button>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {(post.comments || []).length}
                  </span>
                </div>

                {commentInputs[post.id] && (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="w-full border rounded-2xl px-3 py-2 mb-2 text-black shadow-sm focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCommentSubmit(post.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                )}

                {(post.comments || []).length > 0 && (
                  <div className="mt-3 border-t pt-2 space-y-2">
                    {post.comments.slice(0, 2).map((comment, idx) => (
                      <p key={idx} className="text-gray-800 text-sm sm:text-base">
                        <span className="font-semibold text-purple-700">
                          {comment.user}:
                        </span>{" "}
                        {comment.text}
                      </p>
                    ))}
                    {(post.comments || []).length > 2 && (
                      <p className="text-gray-500 text-sm">View {post.comments.length - 2} more comments</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedPost && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closePostModal}
        >
          <div 
            className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-transform duration-300 ${isModalOpen ? 'scale-100' : 'scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
           
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <button 
                onClick={closePostModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaArrowLeft />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
              <button 
                onClick={closePostModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>

        
            <div className="p-4">
              <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Image
                    src={selectedPost.profilePic ?? "/images/default-profile.jpg"}
                    alt={selectedPost.username ?? "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-purple-500 w-10 h-10"
                  />
                  <span className="font-semibold text-purple-900">
                    {selectedPost.username ?? "User"}
                  </span>
                </div>
              </div>

              <div className="relative h-64 w-full mt-4">
                <Image
                  src={selectedPost.image ?? "/images/sample.jpg"}
                  alt={selectedPost.title ?? "Post"}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="p-4">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  {selectedPost.title ?? ""}
                </h2>
                <p className="text-gray-700 mb-4">{selectedPost.description ?? ""}</p>

                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`text-2xl transition transform hover:scale-125 ${
                      likedPosts[selectedPost.id]
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    {likedPosts[selectedPost.id] ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <span className="text-gray-700 font-medium">{selectedPost.likes}</span>

                  <button
                    onClick={() => toggleCommentInput(selectedPost.id)}
                    className="text-2xl text-gray-500 hover:text-blue-500 transition transform hover:scale-125"
                  >
                    <FaComment />
                  </button>
                  <span className="text-gray-700 font-medium">
                    {(selectedPost.comments || []).length}
                  </span>
                </div>

                {commentInputs[selectedPost.id] && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="w-full border rounded-2xl px-4 py-2 mb-2 text-black shadow-sm focus:ring-2 focus:ring-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCommentSubmit(selectedPost.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                )}

                {(selectedPost.comments || []).length > 0 && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Comments</h3>
                    {selectedPost.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800">
                          <span className="font-semibold text-purple-700">
                            {comment.user}:
                          </span>{" "}
                          {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
