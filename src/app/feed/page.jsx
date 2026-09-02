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
  FaEnvelope,
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

/* ============================================================
   API URL
============================================================ */

// IMPORTANT:
// API_URL is the BACKEND BASE URL ONLY (no /api on the end).
//
// Vercel:
// NEXT_PUBLIC_API_URL=https://circl-project.onrender.com
//
// Local:
// http://localhost:5000
//
// We add /api inside each fetch call below, e.g. `${API_URL}/api/posts`.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* ============================================================
   BACKEND ORIGIN
============================================================ */

/*
  BACKEND_ORIGIN is used to resolve relative image paths such as:

  /uploads/profilePics/image.jpg
  /images/profile.jpg

  Since API_URL is already the bare origin (no /api), it IS the
  backend origin — no stripping needed.
*/

const BACKEND_ORIGIN = API_URL;

/* ============================================================
   PROFILE IMAGE URL
============================================================ */

function getProfileImageUrl(src) {
  const fallback = "/images/default-profile.jpg";

  if (!src) {
    return fallback;
  }

  if (typeof src !== "string") {
    return fallback;
  }

  const value = src.trim();

  if (!value) {
    return fallback;
  }

  /*
    Full external URL

    Example:
    https://res.cloudinary.com/...
  */

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  /*
    Data URL
  */

  if (value.startsWith("data:")) {
    return value;
  }

  /*
    Blob URL
  */

  if (value.startsWith("blob:")) {
    return value;
  }

  /*
    Protocol-relative URL

    Example:
    //res.cloudinary.com/...
  */

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  /*
    Relative backend path

    Example:
    /uploads/profilePics/abc.jpg

    becomes:
    http://localhost:5000/uploads/profilePics/abc.jpg
  */

  if (value.startsWith("/")) {
    return `${BACKEND_ORIGIN}${value}`;
  }

  /*
    Relative path without slash

    Example:
    uploads/profilePics/abc.jpg

    becomes:
    http://localhost:5000/uploads/profilePics/abc.jpg
  */

  return `${BACKEND_ORIGIN}/${value}`;
}

/* ============================================================
   API DEBUG
============================================================ */

console.log("========================================");
console.log("CIRCL FEED API");
console.log("API_URL:", API_URL);
console.log("BACKEND_ORIGIN:", BACKEND_ORIGIN);
console.log("POSTS URL:", `${API_URL}/api/posts`);
console.log("========================================");

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
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

/* ============================================================
   GET AUTH TOKEN
============================================================ */

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

/* ============================================================
   NORMALIZE BACKEND POST
============================================================ */

function normalizePost(post) {
  const likesArray = Array.isArray(post.likes)
    ? post.likes
    : [];

  const commentsArray = Array.isArray(post.comments)
    ? post.comments
    : [];

  const author =
    post.author ||
    post.user ||
    null;

  const username =
    author?.username ||
    post.username ||
    author?.name ||
    "User";

  /*
    IMPORTANT:

    We check every possible profile picture field.
  */

  const rawProfilePic =
    author?.profilePic ||
    author?.profilePicture ||
    author?.avatar ||
    author?.image ||
    post.profilePic ||
    post.profilePicture ||
    post.avatar ||
    "";

  /*
    Convert the backend image path to a usable URL.
  */

  const profilePic =
    getProfileImageUrl(rawProfilePic);

  const userId =
    author?._id ||
    author?.id ||
    post.userId ||
    (typeof post.user === "string"
      ? post.user
      : null) ||
    null;

  const country =
    post.country ||
    "";

  const flag =
    post.flag ||
    "";

  return {
    id:
      post._id ||
      post.id,

    title:
      post.title ||
      "",

    description:
      post.description ||
      "",

    image:
      post.image ||
      post.imageUrl ||
      "",

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

    likes:
      likesArray.length,

    likeIds:
      likesArray.map((id) =>
        id?.toString()
      ),

    comments:
      commentsArray.map((comment) => {
        const commentUser =
          typeof comment.user === "object"
            ? comment.user
            : null;

        const commentRawProfilePic =
          commentUser?.profilePic ||
          commentUser?.profilePicture ||
          commentUser?.avatar ||
          commentUser?.image ||
          comment.profilePic ||
          comment.profilePicture ||
          "";

        return {
          id:
            comment._id ||
            Math.random().toString(),

          userId:
            commentUser?._id ||
            commentUser?.id ||
            (typeof comment.user === "string"
              ? comment.user
              : null) ||
            null,

          user:
            commentUser?.username ||
            comment.username ||
            "User",

          profilePic:
            getProfileImageUrl(
              commentRawProfilePic
            ),

          text:
            comment.text ||
            "",
        };
      }),

    fromLocal: false,

    createdAt:
      post.createdAt,
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function FeedPage() {
  const router = useRouter();

  const searchInputRef =
    useRef(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

  const [followLoading, setFollowLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD CURRENT USER + POSTS
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
            savedUser =
              JSON.parse(saved);
          }
        } catch (userError) {
          console.error(
            "Failed to read current user:",
            userError
          );
        }

        /*
          Normalize current user's profile picture immediately.
        */

        if (savedUser) {
          savedUser = {
            ...savedUser,
            profilePic:
              getProfileImageUrl(
                savedUser.profilePic ||
                  savedUser.profilePicture ||
                  savedUser.avatar ||
                  savedUser.image
              ),
          };
        }

        if (isMounted) {
          setCurrentUser(
            savedUser
          );
        }

        /* -------------------------------------------------------
           REFRESH CURRENT USER FROM BACKEND
        ------------------------------------------------------- */

        const token = getToken();

        if (token) {
          try {
            const meResponse =
              await fetch(
                `${API_URL}/api/users/me`,
                {
                  method: "GET",
                  cache: "no-store",
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

            const meData =
              await meResponse.json();

            if (
              meResponse.ok &&
              meData?.user
            ) {
              const refreshedUser = {
                ...meData.user,

                profilePic:
                  getProfileImageUrl(
                    meData.user.profilePic ||
                      meData.user.profilePicture ||
                      meData.user.avatar ||
                      meData.user.image
                  ),
              };

              if (isMounted) {
                setCurrentUser(
                  refreshedUser
                );
              }

              savedUser =
                refreshedUser;

              try {
                localStorage.setItem(
                  "currentUser",
                  JSON.stringify(
                    refreshedUser
                  )
                );
              } catch (storageError) {
                console.error(
                  "Failed to save refreshed current user:",
                  storageError
                );
              }
            } else if (
              meResponse.status === 401 ||
              meResponse.status === 403
            ) {
              localStorage.removeItem(
                "token"
              );

              localStorage.removeItem(
                "authToken"
              );

              localStorage.removeItem(
                "accessToken"
              );
            }
          } catch (meError) {
            console.error(
              "Failed to refresh current user:",
              meError
            );
          }
        }

        /* -------------------------------------------------------
           PROFILE FILTER
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

        const postsUrl =
          `${API_URL}/api/posts`;

        console.log(
          "========================================"
        );

        console.log(
          "Fetching posts from:"
        );

        console.log(
          postsUrl
        );

        console.log(
          "========================================"
        );

        const response =
          await fetch(
            postsUrl,
            {
              method: "GET",
              cache: "no-store",

              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        console.log(
          "Posts response status:",
          response.status
        );

        let data = null;

        try {
          data =
            await response.json();
        } catch (jsonError) {
          console.error(
            "Failed to parse posts response:",
            jsonError
          );

          throw new Error(
            "Server returned an invalid response."
          );
        }

        console.log(
          "Posts response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to fetch posts (${response.status})`
          );
        }

        /* -------------------------------------------------------
           SUPPORT MULTIPLE RESPONSE FORMATS
        ------------------------------------------------------- */

        let backendPosts = [];

        if (
          Array.isArray(data)
        ) {
          backendPosts =
            data;
        } else if (
          Array.isArray(data?.posts)
        ) {
          backendPosts =
            data.posts;
        } else if (
          Array.isArray(data?.data)
        ) {
          backendPosts =
            data.data;
        }

        console.log(
          "Backend posts count:",
          backendPosts.length
        );

        const normalizedPosts =
          backendPosts
            .map(
              normalizePost
            )
            .filter(
              (post) =>
                post.id
            );

        if (!isMounted) {
          return;
        }

        setPosts(
          normalizedPosts
        );

        /* -------------------------------------------------------
           DEBUG PROFILE PICTURES
        ------------------------------------------------------- */

        console.log(
          "========================================"
        );

        console.log(
          "NORMALIZED PROFILE PICTURES"
        );

        normalizedPosts.forEach(
          (post) => {
            console.log(
              post.username,
              "=>",
              post.profilePic
            );
          }
        );

        console.log(
          "========================================"
        );

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
              likedMap[
                post.id
              ] =
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
          "========================================"
        );

        console.error(
          "FETCH POSTS ERROR"
        );

        console.error(
          err
        );

        console.error(
          "========================================"
        );

        if (isMounted) {
          setError(
            err?.message ||
              "Unable to load posts."
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
    if (!isSearchOpen) {
      return;
    }

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

  const handleLike = async (
    id
  ) => {
    const token =
      getToken();

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
      const response =
        await fetch(
          `${API_URL}/api/posts/${id}/like`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
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

          router.push(
            "/login"
          );

          return;
        }

        throw new Error(
          data?.message ||
            "Failed to like post"
        );
      }

      setLikedPosts(
        (prev) => ({
          ...prev,
          [id]:
            data.liked,
        })
      );

      setPosts(
        (prev) =>
          prev.map(
            (post) =>
              post.id === id
                ? {
                    ...post,
                    likes:
                      data.likesCount ??
                      post.likes,
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
                  data.likesCount ??
                  prev.likes,
              }
            : prev
      );
    } catch (error) {
      console.error(
        "Like post error:",
        error
      );

      alert(
        error?.message ||
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
    setCommentInputs(
      (prev) => ({
        ...prev,
        [id]:
          !prev[id],
      })
    );
  };

  /* ============================================================
     ADD COMMENT
  ============================================================ */

  const handleCommentSubmit =
    async (
      id,
      comment
    ) => {
      if (!comment?.trim()) {
        return;
      }

      const token =
        getToken();

      if (!token) {
        alert(
          "Please log in to comment."
        );

        router.push(
          "/login"
        );

        return;
      }

      const userId =
        currentUser?.id ||
        currentUser?._id;

      const username =
        currentUser?.username ||
        currentUser?.name;

      if (
        !userId ||
        !username
      ) {
        alert(
          "Please log in again."
        );

        router.push(
          "/login"
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/posts/${id}/comments`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  user: userId,
                  username,
                  text:
                    comment.trim(),
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

            router.push(
              "/login"
            );

            return;
          }

          throw new Error(
            data?.message ||
              "Failed to add comment"
          );
        }

        const comments =
          (
            data.comments ||
            []
          ).map(
            (
              commentItem
            ) => {
              const commentUser =
                typeof commentItem.user ===
                "object"
                  ? commentItem.user
                  : null;

              const rawCommentProfilePic =
                commentUser?.profilePic ||
                commentUser?.profilePicture ||
                commentUser?.avatar ||
                commentUser?.image ||
                commentItem.profilePic ||
                commentItem.profilePicture ||
                currentUser?.profilePic ||
                "";

              return {
                id:
                  commentItem._id ||
                  Math.random().toString(),

                userId:
                  commentUser?._id ||
                  commentUser?.id ||
                  (typeof commentItem.user ===
                  "string"
                    ? commentItem.user
                    : null),

                user:
                  commentUser?.username ||
                  commentItem.username ||
                  username,

                profilePic:
                  getProfileImageUrl(
                    rawCommentProfilePic
                  ),

                text:
                  commentItem.text ||
                  "",
              };
            }
          );

        setPosts(
          (prev) =>
            prev.map(
              (post) =>
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
          error?.message ||
            "Failed to add comment"
        );
      }
    };

  /* ============================================================
     DELETE POST
  ============================================================ */

  const handleDeletePost =
    async (id) => {
      const token =
        getToken();

      if (!token) {
        alert(
          "Please log in."
        );

        router.push(
          "/login"
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this post?"
        );

      if (!confirmed) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/posts/${id}`,
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

            router.push(
              "/login"
            );

            return;
          }

          throw new Error(
            data?.message ||
              "Failed to delete post"
          );
        }

        setPosts(
          (prev) =>
            prev.filter(
              (post) =>
                post.id !== id
            )
        );

        if (
          selectedPost?.id ===
          id
        ) {
          closePostModal();
        }
      } catch (error) {
        console.error(
          "Delete post error:",
          error
        );

        alert(
          error?.message ||
            "Failed to delete post"
        );
      }
    };

  /* ============================================================
     FOLLOW / UNFOLLOW
  ============================================================ */

  const isFollowingUser = (
    targetUserId
  ) => {
    if (!targetUserId) {
      return false;
    }

    const following =
      Array.isArray(
        currentUser?.following
      )
        ? currentUser.following
        : [];

    return following.some(
      (id) => {
        const followingId =
          typeof id === "object" &&
          id !== null
            ? id._id || id.id
            : id;

        return (
          followingId?.toString() ===
          targetUserId.toString()
        );
      }
    );
  };

  /* ============================================================
     HANDLE FOLLOW / UNFOLLOW
  ============================================================ */

  const handleToggleFollow =
    async (
      targetUserId
    ) => {
      const token =
        getToken();

      if (!token) {
        alert(
          "Please log in to follow members."
        );

        router.push(
          "/login"
        );

        return;
      }

      const currentUserId =
        currentUser?.id ||
        currentUser?._id;

      if (!currentUserId) {
        alert(
          "Please log in again."
        );

        router.push(
          "/login"
        );

        return;
      }

      if (!targetUserId) {
        alert(
          "Unable to identify this member."
        );

        return;
      }

      if (
        currentUserId.toString() ===
        targetUserId.toString()
      ) {
        return;
      }

      if (followLoading) {
        return;
      }

      try {
        setFollowLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/users/${targetUserId}/follow`,
            {
              method: "POST",

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

            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "authToken"
            );

            localStorage.removeItem(
              "accessToken"
            );

            localStorage.removeItem(
              "currentUser"
            );

            router.push(
              "/login"
            );

            return;
          }

          throw new Error(
            data?.message ||
              "Failed to update follow status"
          );
        }

        const nowFollowing =
          Boolean(
            data?.following
          );

        setCurrentUser(
          (prev) => {
            if (!prev) {
              return prev;
            }

            const existingFollowing =
              Array.isArray(
                prev.following
              )
                ? prev.following
                : [];

            let updatedFollowing;

            if (nowFollowing) {
              const alreadyFollowing =
                existingFollowing.some(
                  (id) => {
                    const followingId =
                      typeof id ===
                        "object" &&
                      id !== null
                        ? id._id ||
                          id.id
                        : id;

                    return (
                      followingId
                        ?.toString() ===
                      targetUserId.toString()
                    );
                  }
                );

              updatedFollowing =
                alreadyFollowing
                  ? existingFollowing
                  : [
                      ...existingFollowing,
                      targetUserId,
                    ];
            } else {
              updatedFollowing =
                existingFollowing.filter(
                  (id) => {
                    const followingId =
                      typeof id ===
                        "object" &&
                      id !== null
                        ? id._id ||
                          id.id
                        : id;

                    return (
                      followingId
                        ?.toString() !==
                      targetUserId.toString()
                    );
                  }
                );
            }

            const updatedUser =
              {
                ...prev,
                following:
                  updatedFollowing,
              };

            try {
              localStorage.setItem(
                "currentUser",
                JSON.stringify(
                  updatedUser
                )
              );
            } catch (
              storageError
            ) {
              console.error(
                "Failed to save follow state:",
                storageError
              );
            }

            return updatedUser;
          }
        );

        setSelectedPost(
          (prev) =>
            prev
              ? {
                  ...prev,
                }
              : prev
        );
      } catch (error) {
        console.error(
          "Follow / unfollow error:",
          error
        );

        alert(
          error?.message ||
            "Failed to update follow status"
        );
      } finally {
        setFollowLoading(
          false
        );
      }
    };

  /* ============================================================
     OPEN INBOX
  ============================================================ */

  const handleOpenInbox = (
    targetUserId
  ) => {
    if (!targetUserId) {
      return;
    }

    const token =
      getToken();

    if (!token) {
      alert(
        "Please log in to send messages."
      );

      router.push(
        "/login"
      );

      return;
    }

    if (
      !isFollowingUser(
        targetUserId
      )
    ) {
      alert(
        "Follow this user first to send them a message."
      );

      return;
    }

    router.push(
      `/messages?user=${encodeURIComponent(
        targetUserId
      )}`
    );
  };

  /* ============================================================
     POST MODAL
  ============================================================ */

  const openPostModal = (
    post
  ) => {
    setSelectedPost(
      post
    );

    setIsModalOpen(
      true
    );

    document.body.style.overflow =
      "hidden";
  };

  const closePostModal = () => {
    setIsModalOpen(
      false
    );

    setTimeout(() => {
      setSelectedPost(
        null
      );

      document.body.style.overflow =
        "auto";
    }, 300);
  };

  /* ============================================================
     VIEW ALL POSTS
  ============================================================ */

  const handleViewAllPosts =
    () => {
      setProfileUser("");

      setSearchQuery("");

      window.history.replaceState(
        {},
        "",
        "/feed"
      );
    };

  /* ============================================================
     FILTER POSTS
  ============================================================ */

  const filteredPosts =
    posts.filter(
      (post) => {
        const query =
          searchQuery
            .toLowerCase();

        const matchesSearch =
          (post.title ||
            "")
            .toLowerCase()
            .includes(
              query
            ) ||
          (post.description ||
            "")
            .toLowerCase()
            .includes(
              query
            ) ||
          (post.username ||
            "")
            .toLowerCase()
            .includes(
              query
            );

        const matchesProfile =
          !profileUser ||
          post.userId
            ?.toString() ===
            profileUser.toString() ||
          post.username ===
            profileUser;

        return (
          matchesSearch &&
          matchesProfile
        );
      }
    );

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
                      .filter(
                        Boolean
                      )
                  ).size
                }{" "}
                countries
              </span>

            </div>

          </div>

          {/* MOBILE BUTTONS */}

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

        {/* NAVIGATION */}

        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto ${
            isMenuOpen
              ? "flex"
              : "hidden"
          } sm:flex`}
        >

          <nav className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto [font-family:var(--font-body)] text-sm font-medium">

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

          {/* DESKTOP PROFILE */}

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
                    getProfileImageUrl(
                      currentUser?.profilePic ||
                        currentUser?.profilePicture ||
                        currentUser?.avatar ||
                        currentUser?.image
                    )
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

          {/* MOBILE PROFILE */}

          <Link
            href="/profile"
            className="sm:hidden self-start"
          >
            <span className="block rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1] w-9 h-9">

              <Avatar
                src={
                  getProfileImageUrl(
                    currentUser?.profilePic ||
                      currentUser?.profilePicture ||
                      currentUser?.avatar ||
                      currentUser?.image
                  )
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

      {/* ERROR */}

      {error && (
        <div className="relative z-10 max-w-2xl mx-auto mt-6 px-4 sm:px-6">

          <div className="bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-2xl p-4">

            <p className="text-sm text-[#FF8DA3]">
              {error}
            </p>

            <p className="text-xs text-[#ABA3C4] mt-2 break-all">
              API:
              {" "}
              {API_URL}/api/posts
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-3 text-xs text-[#9D8DF1] hover:text-[#B3A5F5]"
            >
              Try again
            </button>

          </div>
        </div>
      )}

      {/* PROFILE POST HEADER */}

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

      {/* SEARCH CHIP */}

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

      {/* YOUR CIRCL */}

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
                              getProfileImageUrl(
                                p.profilePic
                              )
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
                                p.location
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
                ? `${profileUser} hasn't posted anything yet.`
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
            (post) => {
              const currentUserId =
                currentUser?.id ||
                currentUser?._id;

              const isOwnPost =
                post.userId &&
                currentUserId &&
                post.userId
                  .toString() ===
                currentUserId.toString();

              const following =
                post.userId &&
                isFollowingUser(
                  post.userId
                );

              return (
                <article
                  key={
                    post.id
                  }
                  className="bg-[#1E1A2E] border border-white/5 rounded-3xl overflow-hidden hover:border-[#FF5C7C]/30 transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    openPostModal(
                      post
                    )
                  }
                >

                  {/* POST HEADER */}

                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">

                    {/* USER PROFILE */}

                    <Link
                      href={`/profile?user=${encodeURIComponent(
                        post.userId ||
                          post.username
                      )}`}
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                      className="flex items-center gap-3 min-w-0 group"
                    >

                      <span className="block shrink-0 rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] to-[#9D8DF1] w-9 h-9 group-hover:scale-105 transition-transform">

                        <Avatar
                          src={
                            getProfileImageUrl(
                              post.profilePic
                            )
                          }
                          name={
                            post.username
                          }
                          size={36}
                          className="border-2 border-[#1E1A2E]"
                        />

                      </span>

                      <div className="flex flex-col min-w-0">

                        <span className="font-medium text-[#F5F1EA] text-sm hover:text-[#FF5C7C] transition-colors truncate">
                          {
                            post.username
                          }
                        </span>

                        {post.location && (
                          <span className="[font-family:var(--font-mono)] text-[11px] text-[#ABA3C4] truncate">
                            {
                              post.location
                                .flag
                            }{" "}
                            {
                              post.location
                                .country
                            }
                          </span>
                        )}

                      </div>

                    </Link>

                    {/* RIGHT SIDE ACTIONS */}

                    <div className="flex items-center gap-2 shrink-0">

                      {!isOwnPost &&
                        post.userId &&
                        currentUserId && (
                          <>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                handleToggleFollow(
                                  post.userId
                                );
                              }}
                              disabled={
                                followLoading
                              }
                              className={`rounded-full px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium border transition-all duration-200 ${
                                following
                                  ? "bg-[#262238] border-[#9D8DF1]/50 text-[#F5F1EA] hover:border-[#FF5C7C]/50 hover:text-[#FF8DA3]"
                                  : "bg-[#FF5C7C] border-[#FF5C7C] text-white hover:bg-[#ff4569] hover:border-[#ff4569]"
                              } ${
                                followLoading
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {followLoading
                                ? "Updating…"
                                : following
                                ? "Following"
                                : "Follow"}
                            </button>

                            {following && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleOpenInbox(
                                    post.userId
                                  );
                                }}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-[#262238] border border-[#9D8DF1]/40 text-[#9D8DF1] hover:bg-[#9D8DF1]/15 hover:border-[#9D8DF1] hover:text-[#BDB4FF] transition-all duration-200"
                                title={`Message ${post.username}`}
                                aria-label={`Message ${post.username}`}
                              >
                                <FaEnvelope className="text-xs sm:text-sm" />
                              </button>
                            )}

                          </>
                        )}

                      {isOwnPost && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            handleDeletePost(
                              post.id
                            );
                          }}
                          className="text-[#ABA3C4] hover:text-[#FF5C7C] transition text-base p-1"
                          title="Delete post"
                        >
                          <FaTrash />
                        </button>
                      )}

                    </div>

                  </div>

                  {/* IMAGE */}

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

                  {/* CONTENT */}

                  <div className="p-4 sm:p-5">

                    <h2 className="[font-family:var(--font-display)] text-lg sm:text-xl font-semibold text-[#F5F1EA] mb-1.5">
                      {
                        post.title
                      }
                    </h2>

                    <p className="text-[#ABA3C4] text-sm leading-relaxed mb-4 line-clamp-2">
                      {
                        post.description
                      }
                    </p>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-5">

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
                          post.comments
                            .length
                        }
                      </span>

                    </div>

                    {/* COMMENT INPUT */}

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

                    {/* COMMENTS */}

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
                                    getProfileImageUrl(
                                      comment.profilePic
                                    )
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
                            {post.comments
                              .length -
                              2}{" "}
                            more comments
                          </p>
                        )}

                      </div>
                    )}

                  </div>
                </article>
              );
            }
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

            {/* MODAL HEADER */}

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

              {/* MODAL USER */}

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
                        getProfileImageUrl(
                          selectedPost.profilePic
                        )
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
                          selectedPost.location
                            .flag
                        }{" "}
                        {
                          selectedPost.location
                            .country
                        }
                      </span>
                    )}

                  </div>

                </Link>

                {/* FOLLOW + INBOX */}

                {selectedPost.userId &&
                  (currentUser?.id ||
                    currentUser?._id) &&
                  selectedPost.userId.toString() !==
                    (
                      currentUser?.id ||
                      currentUser?._id
                    ).toString() ? (

                  <div className="flex items-center gap-2 shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleFollow(
                          selectedPost.userId
                        )
                      }
                      disabled={
                        followLoading
                      }
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium border transition-all duration-200 ${
                        isFollowingUser(
                          selectedPost.userId
                        )
                          ? "bg-[#262238] border-[#9D8DF1]/50 text-[#F5F1EA] hover:border-[#FF5C7C]/50 hover:text-[#FF8DA3]"
                          : "bg-[#FF5C7C] border-[#FF5C7C] text-white hover:bg-[#ff4569]"
                      }`}
                    >
                      {followLoading
                        ? "Updating…"
                        : isFollowingUser(
                            selectedPost.userId
                          )
                        ? "Following"
                        : "Follow"}
                    </button>

                    {isFollowingUser(
                      selectedPost.userId
                    ) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenInbox(
                            selectedPost.userId
                          )
                        }
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-[#262238] border border-[#9D8DF1]/40 text-[#9D8DF1] hover:bg-[#9D8DF1]/15 hover:border-[#9D8DF1] hover:text-[#BDB4FF] transition-all duration-200"
                        title={`Message ${selectedPost.username}`}
                      >
                        <FaEnvelope className="text-sm" />
                      </button>
                    )}

                  </div>

                ) : (

                  selectedPost.userId &&
                  (currentUser?.id ||
                    currentUser?._id) &&
                  selectedPost.userId.toString() ===
                    (
                      currentUser?.id ||
                      currentUser?._id
                    ).toString() && (

                    <button
                      type="button"
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

                  )
                )}

              </div>

              {/* IMAGE */}

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

              {/* CONTENT */}

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

                {/* ACTIONS */}

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
                      selectedPost.comments
                        .length
                    }
                  </span>

                </div>

                {/* COMMENT INPUT */}

                {commentInputs[
                  selectedPost.id
                ] && (
                  <input
                    type="text"
                    placeholder="Write a comment…"
                    className="w-full rounded-full bg-[#262238] border border-white/5 px-4 py-2.5 mb-3 text-sm text-[#F5F1EA] placeholder:text-[#ABA3C4] focus:outline-none focus:ring-2 focus:ring-[#9D8DF1]/50"
                    onKeyDown={(
                      e
                    ) => {
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

                {/* ALL COMMENTS */}

                {selectedPost.comments
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
                              getProfileImageUrl(
                                comment.profilePic
                              )
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
