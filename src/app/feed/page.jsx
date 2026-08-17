"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

import Avatar from "@/components/Avatar";

import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaTrash,
  FaSearch,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

/* ============================================================
   POST IMAGE
============================================================ */

function PostImage({ src, alt }) {
  if (!src) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#262238]" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

/* ============================================================
   GET AUTH TOKEN
============================================================ */

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

/* ============================================================
   NORMALIZE BACKEND POST

   IMPORTANT:
   Your backend returns the user as:

   post.author.username
   post.author.profilePic
   post.author._id

   NOT post.user
============================================================ */

function normalizePost(post) {
  const likesArray = Array.isArray(post.likes)
    ? post.likes
    : [];

  const commentsArray = Array.isArray(post.comments)
    ? post.comments
    : [];

  const author = post.author || post.user || null;

  const username =
    author?.username ||
    post.username ||
    "User";

  const profilePic =
    author?.profilePic ||
    post.profilePic ||
    "/images/default-profile.jpg";

  const userId =
    author?._id ||
    author?.id ||
    post.userId ||
    post.user ||
    null;

  const country = post.country || "";
  const flag = post.flag || "";

  return {
    id: post._id || post.id,

    title: post.title || "",

    description: post.description || "",

    image: post.image || "",

    username,

    userId,

    profilePic,

    location:
      country || flag
        ? {
            country,
            flag,
          }
        : null,

    likes: likesArray.length,

    likeIds: likesArray.map((id) =>
      id.toString()
    ),

    comments: commentsArray.map((comment) => {
      const commentUser =
        comment.user || null;

      return {
        id:
          comment._id ||
          Math.random().toString(),

        userId:
          commentUser?._id ||
          commentUser?.id ||
          null,

        user:
          commentUser?.username ||
          comment.username ||
          "User",

        profilePic:
          commentUser?.profilePic ||
          "/images/default-profile.jpg",

        text: comment.text || "",
      };
    }),

    fromLocal: false,

    createdAt: post.createdAt,
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function FeedPage() {
  const router = useRouter();

  const searchInputRef = useRef(null);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [isSearchVisible, setIsSearchVisible] =
    useState(false);

  const [commentInputs, setCommentInputs] =
    useState({});

  const [likedPosts, setLikedPosts] =
    useState({});

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [profileUser, setProfileUser] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD CURRENT USER + POSTS

     IMPORTANT:
     This uses ONE fixed dependency array.

     This prevents:
     "The final argument passed to useEffect changed size
      between renders."
============================================================ */

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      try {
        setLoading(true);
        setError("");

        /* -------------------------------------------------------
           CURRENT USER
        ------------------------------------------------------- */

        let savedUser = null;

        try {
          const saved =
            localStorage.getItem(
              "currentUser"
            );

          if (saved) {
            savedUser = JSON.parse(saved);
          }
        } catch (error) {
          console.error(
            "Failed to read current user:",
            error
          );
        }

        if (isMounted) {
          setCurrentUser(savedUser);
        }

        /* -------------------------------------------------------
           PROFILE FILTER FROM URL
        ------------------------------------------------------- */

        const params =
          new URLSearchParams(
            window.location.search
          );

        const userFromUrl =
          params.get("user");

        if (isMounted) {
          setProfileUser(
            userFromUrl || ""
          );
        }

        /* -------------------------------------------------------
           FETCH POSTS
        ------------------------------------------------------- */

        const response = await fetch(
          `${API_URL}/posts`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch posts"
          );
        }

        const backendPosts =
          Array.isArray(data.posts)
            ? data.posts
            : [];

        const normalizedPosts =
          backendPosts.map(
            normalizePost
          );

        if (!isMounted) return;

        setPosts(normalizedPosts);

        /* -------------------------------------------------------
           DETERMINE LIKED POSTS
        ------------------------------------------------------- */

        const userId =
          savedUser?.id ||
          savedUser?._id;

        if (userId) {
          const likedMap = {};

          normalizedPosts.forEach(
            (post) => {
              likedMap[post.id] =
                post.likeIds.includes(
                  userId.toString()
                );
            }
          );

          setLikedPosts(
            likedMap
          );
        }
      } catch (err) {
        console.error(
          "Fetch posts error:",
          err
        );

        if (isMounted) {
          setError(
            err.message ||
              "Unable to load posts"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ============================================================
     SEARCH
============================================================ */

  useEffect(() => {
    if (!isSearchOpen) return;

    requestAnimationFrame(() => {
      setIsSearchVisible(true);
      searchInputRef.current?.focus();
    });
  }, [isSearchOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchVisible(false);

    setTimeout(() => {
      setIsSearchOpen(false);
    }, 200);
  };

  /* ============================================================
     LIKE / UNLIKE
============================================================ */

  const handleLike = async (id) => {
    const token = getToken();

    if (!token) {
      alert(
        "Please log in to like a post."
      );

      router.push("/login");
      return;
    }

    const userId =
      currentUser?.id ||
      currentUser?._id;

    if (!userId) {
      alert(
        "Please log in again."
      );

      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/posts/${id}/like`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          alert(
            "Your session has expired. Please log in again."
          );

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "authToken"
          );

          localStorage.removeItem(
            "accessToken"
          );

          router.push("/login");

          return;
        }

        throw new Error(
          data.message ||
            "Failed to like post"
        );
      }

      setLikedPosts(
        (prev) => ({
          ...prev,
          [id]: data.liked,
        })
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                likes:
                  data.likesCount,
              }
            : post
        )
      );

      setSelectedPost(
        (prev) =>
          prev?.id === id
            ? {
                ...prev,
                likes:
                  data.likesCount,
              }
            : prev
      );
    } catch (error) {
      console.error(
        "Like post error:",
        error
      );

      alert(
        error.message ||
          "Failed to like post"
      );
    }
  };

  /* ============================================================
     COMMENT INPUT
============================================================ */

  const toggleCommentInput = (
    id
  ) => {
    setCommentInputs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ============================================================
     ADD COMMENT
============================================================ */

  const handleCommentSubmit = async (
    id,
    comment
  ) => {
    if (!comment?.trim()) return;

    const token = getToken();

    if (!token) {
      alert(
        "Please log in to comment."
      );

      router.push("/login");
      return;
    }

    const userId =
      currentUser?.id ||
      currentUser?._id;

    const username =
      currentUser?.username ||
      currentUser?.name;

    if (!userId || !username) {
      alert(
        "Please log in again."
      );

      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/posts/${id}/comments`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            user: userId,
            username,
            text: comment.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          alert(
            "Your session has expired. Please log in again."
          );

          router.push("/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to add comment"
        );
      }

      const comments =
        (
          data.comments || []
        ).map(
          (commentItem) => {
            const commentUser =
              commentItem.user;

            return {
              id:
                commentItem._id ||
                Math.random().toString(),

              userId:
                commentUser?._id ||
                commentUser?.id ||
                null,

              user:
                commentUser?.username ||
                commentItem.username ||
                username,

              profilePic:
                commentUser?.profilePic ||
                currentUser?.profilePic ||
                "/images/default-profile.jpg",

              text:
                commentItem.text ||
                "",
            };
          }
        );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                comments,
              }
            : post
        )
      );

      setSelectedPost(
        (prev) =>
          prev?.id === id
            ? {
                ...prev,
                comments,
              }
            : prev
      );

      setCommentInputs(
        (prev) => ({
          ...prev,
          [id]: false,
        })
      );
    } catch (error) {
      console.error(
        "Comment error:",
        error
      );

      alert(
        error.message ||
          "Failed to add comment"
      );
    }
  };

  /* ============================================================
     DELETE POST
============================================================ */

  const handleDeletePost = async (
    id
  ) => {
    const token = getToken();

    if (!token) {
      alert(
        "Please log in."
      );

      router.push("/login");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this post?"
      );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/posts/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          alert(
            "Your session has expired. Please log in again."
          );

          router.push("/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to delete post"
        );
      }

      setPosts((prev) =>
        prev.filter(
          (post) =>
            post.id !== id
        )
      );

      if (
        selectedPost?.id === id
      ) {
        closePostModal();
      }
    } catch (error) {
      console.error(
        "Delete post error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete post"
      );
    }
  };

  /* ============================================================
     POST MODAL
============================================================ */

  const openPostModal = (
    post
  ) => {
    setSelectedPost(post);
    setIsModalOpen(true);

    document.body.style.overflow =
      "hidden";
  };

  const closePostModal = () => {
    setIsModalOpen(false);

    setTimeout(() => {
      setSelectedPost(null);
      document.body.style.overflow =
        "auto";
    }, 300);
  };

  /* ============================================================
     VIEW ALL POSTS
============================================================ */

  const handleViewAllPosts = () => {
    setProfileUser("");
    setSearchQuery("");

    window.history.replaceState(
      {},
      "",
      "/feed"
    );
  };

  /* ============================================================
     PROFILE FILTER

     Supports:
     /feed?user=MONGODB_ID

     and also:
     /feed?user=username
============================================================ */

  const filteredPosts =
    posts.filter((post) => {
      const query =
        searchQuery.toLowerCase();

      const matchesSearch =
        (post.title || "")
          .toLowerCase()
          .includes(query) ||
        (post.description || "")
          .toLowerCase()
          .includes(query) ||
        (post.username || "")
          .toLowerCase()
          .includes(query);

      const matchesProfile =
        !profileUser ||
        post.userId?.toString() ===
          profileUser.toString() ||
        post.username ===
          profileUser;

      return (
        matchesSearch &&
        matchesProfile
      );
    });

  /* ============================================================
     LOADING
============================================================ */

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#15121F] flex items-center justify-center">
        <p className="[font-family:var(--font-mono)] text-sm tracking-wide text-[#ABA3C4] animate-pulse">
          loading feed…
        </p>
      </main>
    );
  }

  /* ============================================================
     PAGE
============================================================ */

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} [font-family:var(--font-body)] min-h-screen w-full bg-[#15121F] relative overflow-hidden`}
    >
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ======================================================
          DECORATIVE RINGS
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[#FF5C7C]" />

        <div className="absolute -top-20 -right-20 w-[380px] h-[380px] rounded-full border border-[#9D8DF1]" />

        <div className="absolute top-1/2 -left-52 w-[420px] h-[420px] rounded-full border border-[#FFC145]" />
      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 md:px-10 pt-5 sm:pt-6 gap-3 sm:gap-4">

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.back()
              }
              className="shrink-0 bg-[#1E1A2E] hover:bg-[#262238] border border-white/5 text-[#F5F1EA] p-2.5 rounded-full transition-all duration-200 hover:scale-105"
              title="Go back"
            >
              <FaArrowLeft className="text-sm" />
            </button>

            <div className="flex flex-col gap-1 min-w-0">

              <div className="flex items-center gap-2">

                <span className="relative inline-block w-3 h-3 rounded-full bg-[#FF5C7C] shrink-0" />

                <span className="[font-family:var(--font-display)] text-xl sm:text-2xl md:text-3xl font-semibold text-[#F5F1EA] tracking-tight truncate">
                  circl
                </span>

              </div>

              <span className="[font-family:var(--font-mono)] text-[9px] sm:text-[10px] md:text-xs text-[#ABA3C4] tracking-wide pl-5 truncate">
                connecting circles across{" "}
                {
                  new Set(
                    posts
                      .map(
                        (p) =>
                          p.location
                            ?.country
                      )
                      .filter(Boolean)
                  ).size
                }{" "}
                countries
              </span>

            </div>
          </div>

          {/* Mobile buttons */}

          <div className="flex items-center gap-2 sm:hidden shrink-0">

            <button
              onClick={
                openSearch
              }
              className="text-[#F5F1EA] bg-[#1E1A2E] hover:bg-[#262238] border border-white/5 rounded-full p-2.5 transition"
              title="Search"
            >
              <FaSearch className="text-sm" />
            </button>

            <button
              className="text-[#F5F1EA] text-xl p-1"
              onClick={() =>
                setIsMenuOpen(
                  !isMenuOpen
                )
              }
            >
              ☰
            </button>

          </div>
        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto ${
            isMenuOpen
              ? "flex"
              : "hidden"
          } sm:flex`}
        >

          <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto [font-family:var(--font-body)] text-sm font-medium">

            {/* HOME NOW GOES TO FEED */}

            <Link
              href="/feed"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="text-[#F5F1EA]/90 hover:text-[#FF5C7C] transition py-1"
            >
              Home
            </Link>

            <Link
              href="/notfication"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="text-[#F5F1EA]/90 hover:text-[#FF5C7C] transition py-1"
            >
              Notifications
            </Link>

            <Link
              href="/explore"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="text-[#F5F1EA]/90 hover:text-[#FF5C7C] transition py-1"
            >
              Explore
            </Link>

            <Link
              href="/messages"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="text-[#F5F1EA]/90 hover:text-[#FF5C7C] transition py-1"
            >
              Messages
            </Link>

            <Link
              href="/post"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="text-[#F5F1EA]/90 hover:text-[#FF5C7C] transition py-1"
            >
              Share to your Circl
            </Link>

            <Link
              href="/about"
              onClick={() =>
                setIsMenuOpen(false)
              }
              className="text-[#F5F1EA]/90 hover:text-[#FF5C7C] transition py-1"
            >
              About
            </Link>

          </nav>

          {/* ==================================================
              DESKTOP PROFILE
          ================================================== */}

          <div className="hidden sm:flex items-center gap-3">

            <button
              onClick={
                openSearch
              }
              className="text-[#F5F1EA] bg-[#1E1A2E] hover:bg-[#262238] border border-white/5 rounded-full p-2.5 transition"
              title="Search"
            >
              <FaSearch className="text-sm" />
            </button>

            <Link
              href="/profile"
              className="self-start sm:self-auto"
            >
              <span className="block rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1] w-9 h-9 sm:w-11 sm:h-11">

                <Avatar
                  src={
                    currentUser?.profilePic ||
                    "/images/default-profile.jpg"
                  }
                  name={
                    currentUser?.username ||
                    "User"
                  }
                  size={44}
                  className="border-2 border-[#15121F]"
                />

              </span>
            </Link>

          </div>

          {/* ==================================================
              MOBILE PROFILE
          ================================================== */}

          <Link
            href="/profile"
            className="sm:hidden self-start"
          >
            <span className="block rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1] w-9 h-9">

              <Avatar
                src={
                  currentUser?.profilePic ||
                  "/images/default-profile.jpg"
                }
                name={
                  currentUser?.username ||
                  "User"
                }
                size={36}
                className="border-2 border-[#15121F]"
              />

            </span>
          </Link>

        </div>
      </header>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="relative z-10 max-w-2xl mx-auto mt-6 px-4 sm:px-6">

          <div className="bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-2xl p-4">

            <p className="text-sm text-[#FF8DA3]">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-2 text-xs text-[#9D8DF1] hover:text-[#B3A5F5]"
            >
              Try again
            </button>

          </div>
        </div>
      )}

      {/* ======================================================
          PROFILE POST HEADER
      ====================================================== */}

      {profileUser && (
        <div className="relative z-10 max-w-2xl mx-auto mt-6 px-4 sm:px-6">

          <div className="bg-[#1E1A2E] border border-white/5 rounded-2xl p-4 sm:p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide uppercase">
                  Profile posts
                </p>

                <h1 className="[font-family:var(--font-display)] text-xl sm:text-2xl font-semibold text-[#F5F1EA] mt-1">
                  {filteredPosts[0]
                    ?.username ||
                    profileUser}
                </h1>

                <p className="text-xs text-[#ABA3C4] mt-1">
                  {filteredPosts.length}{" "}
                  {filteredPosts.length ===
                  1
                    ? "post"
                    : "posts"}
                </p>

              </div>

              <button
                onClick={
                  handleViewAllPosts
                }
                className="shrink-0 text-xs sm:text-sm text-[#9D8DF1] hover:text-[#B3A5F5] transition"
              >
                View all
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SEARCH CHIP
      ====================================================== */}

      {searchQuery &&
        !isSearchOpen && (
          <div className="relative z-10 max-w-2xl mx-auto mt-4 px-4 sm:px-6">

            <button
              onClick={
                openSearch
              }
              className="inline-flex items-center gap-2 bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-full pl-3 pr-2 py-1.5 text-xs text-[#F5F1EA] hover:border-[#FF5C7C]/60 transition"
            >

              <FaSearch className="text-[#FF5C7C] text-[10px]" />

              <span className="[font-family:var(--font-mono)]">
                "{searchQuery}"
              </span>

              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="text-[#ABA3C4] hover:text-[#FF5C7C] ml-1"
              >
                <FaTimes className="text-[10px]" />
              </span>

            </button>

          </div>
        )}

      {/* ======================================================
          YOUR CIRCL
      ====================================================== */}

      {posts.length > 0 &&
        !profileUser && (
          <div className="relative z-10 max-w-2xl mx-auto mt-6 px-4 sm:px-6">

            <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide uppercase mb-3">
              Your Circl
            </p>

            <div className="relative">

              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#15121F] to-transparent z-10" />

              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#15121F] to-transparent z-10" />

              <div className="no-scrollbar flex gap-5 overflow-x-auto snap-x snap-mandatory py-2 px-1">

                {Array.from(
                  new Map(
                    posts.map(
                      (p) => [
                        p.userId ||
                          p.username,
                        p,
                      ]
                    )
                  ).values()
                )
                  .slice(0, 12)
                  .map((p) => (
                    <button
                      key={
                        p.userId ||
                        p.username
                      }
                      onClick={() => {
                        const identifier =
                          p.userId ||
                          p.username;

                        setProfileUser(
                          identifier.toString()
                        );

                        setSearchQuery("");

                        window.history.replaceState(
                          {},
                          "",
                          `/feed?user=${encodeURIComponent(
                            identifier
                          )}`
                        );
                      }}
                      className="group relative flex flex-col items-center gap-1.5 shrink-0 snap-start"
                      title={`See posts from ${p.username}`}
                    >

                      <span className="relative w-14 h-14">

                        <span className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_0deg,#FF5C7C,#FFC145,#9D8DF1,#FF5C7C)] opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-300 animate-[spin_4s_linear_infinite]" />

                        <span className="relative block w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1] transition-transform duration-300 group-hover:scale-110">

                          <Avatar
                            src={
                              p.profilePic
                            }
                            name={
                              p.username
                            }
                            size={56}
                            className="border-2 border-[#15121F]"
                          />

                          {p.location && (
                            <span className="absolute -bottom-1 -right-1 text-sm leading-none bg-[#1E1A2E] rounded-full w-5 h-5 flex items-center justify-center border border-white/10">
                              {
                                p
                                  .location
                                  .flag
                              }
                            </span>
                          )}

                        </span>
                      </span>

                      <span className="text-[10px] text-[#ABA3C4] group-hover:text-[#F5F1EA] transition max-w-[56px] truncate">
                        {p.username
                          ?.split(
                            " "
                          )[0]}
                      </span>

                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

      {/* ======================================================
          FEED
      ====================================================== */}

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 max-w-2xl mx-auto mt-6 px-4 sm:px-6 pb-12">

        {filteredPosts.length ===
        0 ? (
          <div className="text-center mt-16">

            <p className="text-[#ABA3C4] [font-family:var(--font-body)] text-sm">
              {profileUser
                ? `${
                    filteredPosts[0]
                      ?.username ||
                    profileUser
                  } hasn't posted anything yet.`
                : "Nothing here yet — share the first post."}
            </p>

            {profileUser && (
              <button
                onClick={
                  handleViewAllPosts
                }
                className="mt-4 text-sm text-[#9D8DF1] hover:text-[#B3A5F5] transition"
              >
                ← Back to all posts
              </button>
            )}

          </div>
        ) : (
          filteredPosts.map(
            (post) => (
              <article
                key={post.id}
                className="bg-[#1E1A2E] border border-white/5 rounded-3xl overflow-hidden hover:border-[#FF5C7C]/30 transition-all duration-300 cursor-pointer"
                onClick={() =>
                  openPostModal(
                    post
                  )
                }
              >

                {/* ==================================================
                    POST HEADER
                ================================================== */}

                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">

                  <div className="flex items-center gap-3">

                    {/* CLICKABLE PROFILE PICTURE */}

                    <Link
                      href={`/profile?user=${encodeURIComponent(
                        post.userId ||
                          post.username
                      )}`}
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                      className="block rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] to-[#9D8DF1] w-9 h-9 hover:scale-105 transition-transform"
                    >
                      <Avatar
                        src={
                          post.profilePic
                        }
                        name={
                          post.username
                        }
                        size={36}
                        className="border-2 border-[#1E1A2E]"
                      />
                    </Link>

                    <div className="flex flex-col">

                      {/* CLICKABLE USERNAME */}

                      <Link
                        href={`/profile?user=${encodeURIComponent(
                          post.userId ||
                            post.username
                        )}`}
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                        className="font-medium text-[#F5F1EA] text-sm hover:text-[#FF5C7C] transition-colors"
                      >
                        {
                          post.username
                        }
                      </Link>

                      {post.location && (
                        <span className="[font-family:var(--font-mono)] text-[11px] text-[#ABA3C4]">
                          {
                            post
                              .location
                              .flag
                          }{" "}
                          {
                            post
                              .location
                              .country
                          }
                        </span>
                      )}

                    </div>

                  </div>

                  {/* ==================================================
                      DELETE OWN POST
                  ================================================== */}

                  {post.userId &&
                    (
                      currentUser?.id ||
                      currentUser?._id
                    ) &&
                    post.userId
                      .toString() ===
                      (
                        currentUser?.id ||
                        currentUser?._id
                      ).toString() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          handleDeletePost(
                            post.id
                          );
                        }}
                        className="text-[#ABA3C4] hover:text-[#FF5C7C] transition text-base"
                        title="Delete post"
                      >
                        <FaTrash />
                      </button>
                    )}

                </div>

                {/* ==================================================
                    IMAGE
                ================================================== */}

                <div className="relative h-52 sm:h-64 md:h-72 w-full">

                  <PostImage
                    src={
                      post.image
                    }
                    alt={
                      post.title ||
                      "Post"
                    }
                  />

                </div>

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="p-4 sm:p-5">

                  <h2 className="[font-family:var(--font-display)] text-lg sm:text-xl font-semibold text-[#F5F1EA] mb-1.5">
                    {post.title}
                  </h2>

                  <p className="text-[#ABA3C4] text-sm leading-relaxed mb-4 line-clamp-2">
                    {
                      post.description
                    }
                  </p>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <div className="flex items-center gap-5">

                    {/* LIKE */}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleLike(
                          post.id
                        );
                      }}
                      className="group relative w-9 h-9 flex items-center justify-center"
                    >

                      <span
                        className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                          likedPosts[
                            post.id
                          ]
                            ? "border-[#FF5C7C] bg-[#FF5C7C]/15 scale-100"
                            : "border-white/10 scale-90 group-hover:border-[#FF5C7C]/40"
                        }`}
                      />

                      {likedPosts[
                        post.id
                      ] ? (
                        <FaHeart className="relative text-[#FF5C7C] text-base" />
                      ) : (
                        <FaRegHeart className="relative text-[#ABA3C4] group-hover:text-[#FF5C7C] text-base transition" />
                      )}

                    </button>

                    <span className="[font-family:var(--font-mono)] text-[#FFC145] text-sm -ml-2">
                      {
                        post.likes
                      }
                    </span>

                    {/* COMMENT */}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        toggleCommentInput(
                          post.id
                        );
                      }}
                      className="text-[#ABA3C4] hover:text-[#9D8DF1] transition text-base"
                    >
                      <FaComment />
                    </button>

                    <span className="[font-family:var(--font-mono)] text-[#ABA3C4] text-sm -ml-2">
                      {
                        post
                          .comments
                          .length
                      }
                    </span>

                  </div>

                  {/* ==================================================
                      COMMENT INPUT
                  ================================================== */}

                  {commentInputs[
                    post.id
                  ] && (
                    <div
                      className="mt-4"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <input
                        type="text"
                        placeholder="Write a comment…"
                        className="w-full rounded-full bg-[#262238] border border-white/5 px-4 py-2.5 text-sm text-[#F5F1EA] placeholder:text-[#ABA3C4] focus:outline-none focus:ring-2 focus:ring-[#9D8DF1]/50"
                        onKeyDown={(
                          e
                        ) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            handleCommentSubmit(
                              post.id,
                              e.target
                                .value
                            );

                            e.target.value =
                              "";
                          }
                        }}
                      />

                    </div>
                  )}

                  {/* ==================================================
                      COMMENTS
                  ================================================== */}

                  {post.comments
                    .length >
                    0 && (
                    <div className="mt-4 border-t border-white/5 pt-3 space-y-1.5">

                      {post.comments
                        .slice(
                          0,
                          2
                        )
                        .map(
                          (
                            comment
                          ) => (
                            <div
                              key={
                                comment.id
                              }
                              className="flex items-center gap-2"
                            >

                              <Avatar
                                src={
                                  comment.profilePic
                                }
                                name={
                                  comment.user
                                }
                                size={
                                  24
                                }
                              />

                              <p className="text-sm text-[#ABA3C4]">

                                <span className="font-medium text-[#F5F1EA]">
                                  {
                                    comment.user
                                  }
                                </span>{" "}

                                {
                                  comment.text
                                }

                              </p>

                            </div>
                          )
                        )}

                      {post.comments
                        .length >
                        2 && (
                        <p className="text-xs text-[#9D8DF1]">
                          View{" "}
                          {post
                            .comments
                            .length -
                            2}{" "}
                          more comments
                        </p>
                      )}

                    </div>
                  )}

                </div>
              </article>
            )
          )
        )}

      </div>

      {/* ======================================================
          SEARCH POPUP
      ====================================================== */}

      {isSearchOpen && (
        <div
          className={`fixed inset-0 bg-[#0B0912]/85 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 transition-opacity duration-200 ${
            isSearchVisible
              ? "opacity-100"
              : "opacity-0"
          }`}
          onClick={
            closeSearch
          }
        >

          <div
            className={`w-full max-w-lg bg-[#1E1A2E] border border-white/5 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-200 ${
              isSearchVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2"
            }`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center gap-3">

              <FaSearch className="text-[#ABA3C4] text-sm shrink-0" />

              <input
                ref={
                  searchInputRef
                }
                type="text"
                placeholder="Search circl…"
                value={
                  searchQuery
                }
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Escape"
                  ) {
                    closeSearch();
                  }

                  if (
                    e.key ===
                    "Enter"
                  ) {
                    closeSearch();
                  }
                }}
                className="w-full bg-transparent text-[#F5F1EA] placeholder:text-[#ABA3C4] text-sm sm:text-base focus:outline-none"
              />

              <button
                onClick={
                  closeSearch
                }
                className="text-[#ABA3C4] hover:text-[#F5F1EA] shrink-0"
              >
                <FaTimes />
              </button>

            </div>

            {searchQuery && (
              <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-3 pt-3 border-t border-white/5">
                {
                  filteredPosts.length
                }{" "}
                result
                {filteredPosts.length !==
                1
                  ? "s"
                  : ""}{" "}
                for "
                {
                  searchQuery
                }
                "
              </p>
            )}

          </div>
        </div>
      )}

      {/* ======================================================
          POST MODAL
      ====================================================== */}

      {selectedPost && (
        <div
          className={`fixed inset-0 bg-[#0B0912]/85 z-50 flex items-center justify-center p-3 sm:p-4 transition-opacity duration-300 ${
            isModalOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={
            closePostModal
          }
        >

          <div
            className={`bg-[#1E1A2E] border border-white/5 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto transition-transform duration-300 ${
              isModalOpen
                ? "scale-100"
                : "scale-95"
            }`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-[#1E1A2E] z-10">

              <button
                onClick={
                  closePostModal
                }
                className="text-[#ABA3C4] hover:text-[#F5F1EA]"
              >
                <FaArrowLeft />
              </button>

              <h2 className="[font-family:var(--font-display)] text-lg font-semibold text-[#F5F1EA]">
                Post
              </h2>

              <button
                onClick={
                  closePostModal
                }
                className="text-[#ABA3C4] hover:text-[#F5F1EA]"
              >
                <FaTimes />
              </button>

            </div>

            <div className="p-4">

              {/* ==================================================
                  MODAL USER
              ================================================== */}

              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">

                <Link
                  href={`/profile?user=${encodeURIComponent(
                    selectedPost.userId ||
                      selectedPost.username
                  )}`}
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="flex items-center gap-3 group"
                >

                  <span className="block rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] to-[#9D8DF1] w-10 h-10 group-hover:scale-105 transition-transform">

                    <Avatar
                      src={
                        selectedPost.profilePic
                      }
                      name={
                        selectedPost.username
                      }
                      size={40}
                      className="border-2 border-[#1E1A2E]"
                    />

                  </span>

                  <div className="flex flex-col">

                    <span className="font-medium text-[#F5F1EA] text-sm sm:text-base group-hover:text-[#FF5C7C] transition-colors">
                      {
                        selectedPost.username
                      }
                    </span>

                    {selectedPost.location && (
                      <span className="[font-family:var(--font-mono)] text-[11px] text-[#ABA3C4]">
                        {
                          selectedPost
                            .location
                            .flag
                        }{" "}
                        {
                          selectedPost
                            .location
                            .country
                        }
                      </span>
                    )}

                  </div>

                </Link>

                {/* DELETE */}

                {selectedPost.userId &&
                  (
                    currentUser?.id ||
                    currentUser?._id
                  ) &&
                  selectedPost.userId
                    .toString() ===
                    (
                      currentUser?.id ||
                      currentUser?._id
                    ).toString() && (
                    <button
                      onClick={() =>
                        handleDeletePost(
                          selectedPost.id
                        )
                      }
                      className="text-[#ABA3C4] hover:text-[#FF5C7C] transition"
                      title="Delete post"
                    >
                      <FaTrash />
                    </button>
                  )}

              </div>

              {/* ==================================================
                  IMAGE
              ================================================== */}

              <div className="relative h-52 sm:h-64 w-full mt-4 rounded-2xl overflow-hidden">

                <PostImage
                  src={
                    selectedPost.image
                  }
                  alt={
                    selectedPost.title ||
                    "Post"
                  }
                />

              </div>

              {/* ==================================================
                  CONTENT
              ================================================== */}

              <div className="pt-4">

                <h2 className="[font-family:var(--font-display)] text-xl sm:text-2xl font-semibold text-[#F5F1EA] mb-2">
                  {
                    selectedPost.title
                  }
                </h2>

                <p className="text-[#ABA3C4] text-sm sm:text-base mb-4 leading-relaxed">
                  {
                    selectedPost.description
                  }
                </p>

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="flex items-center gap-5 mb-4">

                  <button
                    onClick={() =>
                      handleLike(
                        selectedPost.id
                      )
                    }
                    className="group relative w-9 h-9 flex items-center justify-center"
                  >

                    <span
                      className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                        likedPosts[
                          selectedPost.id
                        ]
                          ? "border-[#FF5C7C] bg-[#FF5C7C]/15 scale-100"
                          : "border-white/10 scale-90"
                      }`}
                    />

                    {likedPosts[
                      selectedPost.id
                    ] ? (
                      <FaHeart className="relative text-[#FF5C7C]" />
                    ) : (
                      <FaRegHeart className="relative text-[#ABA3C4]" />
                    )}

                  </button>

                  <span className="[font-family:var(--font-mono)] text-[#FFC145] text-sm -ml-2">
                    {
                      selectedPost.likes
                    }
                  </span>

                  <button
                    onClick={() =>
                      toggleCommentInput(
                        selectedPost.id
                      )
                    }
                    className="text-[#ABA3C4] hover:text-[#9D8DF1] transition"
                  >
                    <FaComment />
                  </button>

                  <span className="[font-family:var(--font-mono)] text-[#ABA3C4] text-sm -ml-2">
                    {
                      selectedPost
                        .comments
                        .length
                    }
                  </span>

                </div>

                {/* ==================================================
                    COMMENT INPUT
                ================================================== */}

                {commentInputs[
                  selectedPost.id
                ] && (
                  <input
                    type="text"
                    placeholder="Write a comment…"
                    className="w-full rounded-full bg-[#262238] border border-white/5 px-4 py-2.5 mb-3 text-sm text-[#F5F1EA] placeholder:text-[#ABA3C4] focus:outline-none focus:ring-2 focus:ring-[#9D8DF1]/50"
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        handleCommentSubmit(
                          selectedPost.id,
                          e.target
                            .value
                        );

                        e.target.value =
                          "";
                      }
                    }}
                  />
                )}

                {/* ==================================================
                    ALL COMMENTS
                ================================================== */}

                {selectedPost
                  .comments
                  .length >
                  0 && (
                  <div className="mt-4 border-t border-white/5 pt-4 space-y-2.5">

                    <h3 className="font-medium text-[#F5F1EA] text-sm">
                      Comments
                    </h3>

                    {selectedPost.comments.map(
                      (comment) => (
                        <div
                          key={
                            comment.id
                          }
                          className="bg-[#262238] p-3 rounded-2xl flex items-start gap-2.5"
                        >

                          <Avatar
                            src={
                              comment.profilePic
                            }
                            name={
                              comment.user
                            }
                            size={30}
                          />

                          <p className="text-sm text-[#ABA3C4]">

                            <span className="font-medium text-[#F5F1EA]">
                              {
                                comment.user
                              }
                            </span>{" "}

                            {
                              comment.text
                            }

                          </p>

                        </div>
                      )
                    )}

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