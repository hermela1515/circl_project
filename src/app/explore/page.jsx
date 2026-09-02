"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import {
  FaArrowLeft,
  FaSearch,
  FaTimes,
  FaPlus,
  FaCheck,
  FaHeart,
  FaComment,
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

// =====================================================
// BACKEND
// =====================================================

/* ============================================================
   NORMALIZE API BASE
   Prevents duplicated "/api/api" or trailing-slash issues
   caused by env vars that already include "/api".
============================================================ */

function normalizeApiBase(url) {
  if (!url) {
    return "http://localhost:5000/api";
  }

  // strip trailing slashes
  let clean = url.replace(/\/+$/, "");

  // collapse an accidental doubled /api
  clean = clean.replace(/\/api\/api$/, "/api");

  return clean;
}

const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL
);

// =====================================================
// REGIONS
// =====================================================

const REGIONS = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "africa",
    label: "Africa",
  },
  {
    id: "asia",
    label: "Asia",
  },
  {
    id: "europe",
    label: "Europe",
  },
  {
    id: "americas",
    label: "Americas",
  },
  {
    id: "oceania",
    label: "Oceania",
  },
];

// =====================================================
// COUNTRY DATA
// =====================================================

const COUNTRY_DATA = {
  Ethiopia: {
    flag: "🇪🇹",
    region: "africa",
  },

  Nigeria: {
    flag: "🇳🇬",
    region: "africa",
  },

  Kenya: {
    flag: "🇰🇪",
    region: "africa",
  },

  Ghana: {
    flag: "🇬🇭",
    region: "africa",
  },

  "South Africa": {
    flag: "🇿🇦",
    region: "africa",
  },

  Tanzania: {
    flag: "🇹🇿",
    region: "africa",
  },

  Uganda: {
    flag: "🇺🇬",
    region: "africa",
  },

  Rwanda: {
    flag: "🇷🇼",
    region: "africa",
  },

  Japan: {
    flag: "🇯🇵",
    region: "asia",
  },

  India: {
    flag: "🇮🇳",
    region: "asia",
  },

  "South Korea": {
    flag: "🇰🇷",
    region: "asia",
  },

  China: {
    flag: "🇨🇳",
    region: "asia",
  },

  Germany: {
    flag: "🇩🇪",
    region: "europe",
  },

  Portugal: {
    flag: "🇵🇹",
    region: "europe",
  },

  Sweden: {
    flag: "🇸🇪",
    region: "europe",
  },

  France: {
    flag: "🇫🇷",
    region: "europe",
  },

  Italy: {
    flag: "🇮🇹",
    region: "europe",
  },

  Spain: {
    flag: "🇪🇸",
    region: "europe",
  },

  Brazil: {
    flag: "🇧🇷",
    region: "americas",
  },

  Canada: {
    flag: "🇨🇦",
    region: "americas",
  },

  Mexico: {
    flag: "🇲🇽",
    region: "americas",
  },

  "United States": {
    flag: "🇺🇸",
    region: "americas",
  },

  Australia: {
    flag: "🇦🇺",
    region: "oceania",
  },

  "New Zealand": {
    flag: "🇳🇿",
    region: "oceania",
  },
};

// =====================================================
// HELPERS
// =====================================================

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

function getUserIdFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser");

    if (!storedUser) {
      return null;
    }

    const parsed = JSON.parse(storedUser);

    return (
      parsed?._id ||
      parsed?.id ||
      parsed?.user?._id ||
      parsed?.user?.id ||
      null
    );
  } catch {
    return null;
  }
}

// -----------------------------------------------------
// Resolve relative backend paths to absolute URLs
// (mirrors the logic already used on the profile page)
// -----------------------------------------------------
function getImageUrl(image) {
  if (!image) {
    return "/images/default-avatar.png";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const backendUrl = API_BASE.replace(/\/api\/?$/, "");

  if (image.startsWith("/")) {
    return `${backendUrl}${image}`;
  }

  return `${backendUrl}/${image}`;
}

function getCountryInfo(user) {
  const country =
    user?.country ||
    user?.location?.country ||
    user?.profile?.country ||
    "";

  if (COUNTRY_DATA[country]) {
    return {
      country,
      ...COUNTRY_DATA[country],
    };
  }

  return {
    country: country || "Unknown",
    flag: "🌍",
    region: "all",
  };
}

function getProfileImage(user) {
  return (
    user?.profilePic ||
    user?.profilePicture ||
    user?.avatar ||
    user?.image ||
    null
  );
}

function getUserId(user) {
  return user?._id || user?.id;
}

function getUsername(user) {
  return (
    user?.username ||
    user?.name ||
    user?.fullName ||
    "Circl user"
  );
}

function getHandle(user) {
  return user?.username
    ? `@${user.username}`
    : "";
}

function getPostImage(post) {
  return (
    post?.image ||
    post?.imageUrl ||
    post?.photo ||
    post?.mediaUrl ||
    post?.media ||
    null
  );
}

function getPostText(post) {
  return (
    post?.caption ||
    post?.text ||
    post?.content ||
    post?.description ||
    ""
  );
}

function normalizePosts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.posts)) {
    return data.posts;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeUsers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

// =====================================================
// COMPONENT
// =====================================================

export default function ExplorePage() {
  const router = useRouter();

  const searchInputRef = useRef(null);

  const [people, setPeople] = useState([]);
  const [posts, setPosts] = useState([]);

  const [currentUserId, setCurrentUserId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [activeRegion, setActiveRegion] = useState("all");

  const [following, setFollowing] = useState({});

  const [searchQuery, setSearchQuery] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isSearchVisible, setIsSearchVisible] =
    useState(false);

  const [followLoading, setFollowLoading] = useState({});

  const [error, setError] = useState("");

  // ===================================================
  // LOAD EXPLORE DATA
  // ===================================================

  useEffect(() => {
    const loadExplore = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const storedUserId = getUserIdFromStorage();

        setCurrentUserId(storedUserId);

        // ---------------------------------------------
        // FETCH POSTS
        // ---------------------------------------------

        const postsUrl = `${API_BASE}/posts`;

        console.log("Loading posts:", postsUrl);

        const postsResponse = await fetch(
          postsUrl,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!postsResponse.ok) {
          throw new Error(
            `Unable to load posts (${postsResponse.status}) from ${postsUrl}`
          );
        }

        const postsData = await postsResponse.json();

        const realPosts = normalizePosts(postsData);

        setPosts(realPosts);

        // ---------------------------------------------
        // GET UNIQUE USERS FROM POSTS
        // ---------------------------------------------

        const usersMap = new Map();

        realPosts.forEach((post) => {
          const postUser =
            post?.user ||
            post?.author ||
            post?.createdBy ||
            post?.owner;

          if (postUser) {
            const id = getUserId(postUser);

            if (id) {
              usersMap.set(String(id), postUser);
            }
          }
        });

        // ---------------------------------------------
        // TRY TO LOAD USERS FROM POSTS
        // ---------------------------------------------

        let discoveredUsers = Array.from(
          usersMap.values()
        );

        // ---------------------------------------------
        // FOLLOWING DATA
        // ---------------------------------------------

        if (token && storedUserId) {
          try {
            const followingResponse = await fetch(
              `${API_BASE}/users/${storedUserId}/following`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (followingResponse.ok) {
              const followingData =
                await followingResponse.json();

              const followingUsers = normalizeUsers(
                followingData
              );

              const followingState = {};

              followingUsers.forEach((user) => {
                const id = getUserId(user);

                if (id) {
                  followingState[String(id)] = true;
                }
              });

              setFollowing(followingState);
            }
          } catch (followingError) {
            console.error(
              "Following fetch error:",
              followingError
            );
          }
        }

        // ---------------------------------------------
        // FETCH PROFILES FOR POST AUTHORS
        // ---------------------------------------------

        const profilePromises = discoveredUsers
          .slice(0, 30)
          .map(async (user) => {
            const id = getUserId(user);

            if (!id) {
              return user;
            }

            try {
              const response = await fetch(
                `${API_BASE}/users/${id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : {}),
                  },
                }
              );

              if (!response.ok) {
                return user;
              }

              const data = await response.json();

              return (
                data?.user ||
                data?.data ||
                data ||
                user
              );
            } catch {
              return user;
            }
          });

        const completeUsers =
          await Promise.all(profilePromises);

        // ---------------------------------------------
        // REMOVE CURRENT USER
        // ---------------------------------------------

        const filteredUsers = completeUsers.filter(
          (user) => {
            const id = getUserId(user);

            return (
              id &&
              String(id) !== String(storedUserId)
            );
          }
        );

        setPeople(filteredUsers);
      } catch (err) {
        console.error("Explore error:", err);
        setError(
          err?.message ||
            "Something went wrong while loading Explore."
        );
      } finally {
        setLoading(false);
      }
    };

    loadExplore();
  }, []);

  // ===================================================
  // SEARCH ANIMATION
  // ===================================================

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => {
        setIsSearchVisible(true);
      });

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // ===================================================
  // SEARCH
  // ===================================================

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchVisible(false);

    setTimeout(() => {
      setIsSearchOpen(false);
    }, 200);
  };

  // ===================================================
  // FOLLOW / UNFOLLOW
  // ===================================================

  const toggleFollow = async (userId) => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const id = String(userId);

    if (followLoading[id]) {
      return;
    }

    setFollowLoading((prev) => ({
      ...prev,
      [id]: true,
    }));

    try {
      const response = await fetch(
        `${API_BASE}/users/${userId}/follow`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to update follow."
        );
      }

      // ---------------------------------------------
      // DETERMINE NEW FOLLOW STATE
      // ---------------------------------------------

      let newFollowingValue;

      if (typeof data?.following === "boolean") {
        newFollowingValue = data.following;
      } else if (
        typeof data?.isFollowing === "boolean"
      ) {
        newFollowingValue = data.isFollowing;
      } else if (
        typeof data?.user?.isFollowing === "boolean"
      ) {
        newFollowingValue = data.user.isFollowing;
      } else {
        newFollowingValue = !following[id];
      }

      setFollowing((prev) => ({
        ...prev,
        [id]: newFollowingValue,
      }));
    } catch (err) {
      console.error("Follow error:", err);

      alert(
        err?.message ||
          "Something went wrong while following this user."
      );
    } finally {
      setFollowLoading((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  // ===================================================
  // FILTER PEOPLE
  // ===================================================

  const filteredPeople = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return people.filter((person) => {
      const location = getCountryInfo(person);

      const username =
        getUsername(person).toLowerCase();

      const handle =
        person?.username?.toLowerCase() || "";

      const country =
        location.country.toLowerCase();

      const matchesRegion =
        activeRegion === "all" ||
        location.region === activeRegion;

      const matchesSearch =
        !query ||
        username.includes(query) ||
        handle.includes(query) ||
        country.includes(query);

      return matchesRegion && matchesSearch;
    });
  }, [
    people,
    activeRegion,
    searchQuery,
  ]);

  // ===================================================
  // FILTER POSTS
  // ===================================================

  const filteredPosts = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return posts.filter((post) => {
      const postUser =
        post?.user ||
        post?.author ||
        post?.createdBy ||
        post?.owner;

      const location = getCountryInfo(postUser);

      const username =
        getUsername(postUser).toLowerCase();

      const country =
        location.country.toLowerCase();

      const postText =
        getPostText(post).toLowerCase();

      const matchesRegion =
        activeRegion === "all" ||
        location.region === activeRegion;

      const matchesSearch =
        !query ||
        username.includes(query) ||
        country.includes(query) ||
        postText.includes(query);

      return matchesRegion && matchesSearch;
    });
  }, [
    posts,
    activeRegion,
    searchQuery,
  ]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#15121F] flex items-center justify-center">
        <p className="[font-family:var(--font-mono)] text-sm tracking-wide text-[#ABA3C4] animate-pulse">
          finding your circle…
        </p>
      </main>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

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

      {/* =================================================
          BACKGROUND DECORATION
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[#9D8DF1]" />

        <div className="absolute top-1/2 -left-52 w-[420px] h-[420px] rounded-full border border-[#FFC145]" />
      </div>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-20 bg-[#1E1A2E]/80 hover:bg-[#262238] border border-white/5 text-[#F5F1EA] p-2.5 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-10 pt-5 sm:pt-6 gap-3">
        <div className="flex flex-col gap-1">
          <span className="[font-family:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#F5F1EA] tracking-tight">
            Explore
          </span>

          <span className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide">
            find people and moments from every circle
          </span>
        </div>

        <button
          onClick={openSearch}
          className="text-[#F5F1EA] bg-[#1E1A2E] hover:bg-[#262238] border border-white/5 rounded-full p-2.5 sm:p-3 transition shrink-0"
          title="Search"
        >
          <FaSearch className="text-sm" />
        </button>
      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="relative z-10 max-w-4xl mx-auto mt-5 px-4 sm:px-6">
          <div className="rounded-2xl border border-[#FF5C7C]/20 bg-[#1E1A2E] px-4 py-3 text-sm text-[#ABA3C4]">
            {error}
          </div>
        </div>
      )}

      {/* =================================================
          ACTIVE SEARCH CHIP
      ================================================= */}

      {searchQuery && !isSearchOpen && (
        <div className="relative z-10 max-w-4xl mx-auto mt-4 px-4 sm:px-6">
          <button
            onClick={openSearch}
            className="inline-flex items-center gap-2 bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-full pl-3 pr-2 py-1.5 text-xs text-[#F5F1EA] hover:border-[#FF5C7C]/60 transition"
          >
            <FaSearch className="text-[#FF5C7C] text-[10px]" />

            <span className="[font-family:var(--font-mono)]">
              "{searchQuery}"
            </span>

            <span
              role="button"
              onClick={(event) => {
                event.stopPropagation();
                setSearchQuery("");
              }}
              className="text-[#ABA3C4] hover:text-[#FF5C7C] ml-1"
            >
              <FaTimes className="text-[10px]" />
            </span>
          </button>
        </div>
      )}

      {/* =================================================
          REGION FILTER
      ================================================= */}

      <div className="relative z-10 max-w-4xl mx-auto mt-6 px-4 sm:px-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() =>
                setActiveRegion(region.id)
              }
              className={`shrink-0 [font-family:var(--font-mono)] text-xs px-4 py-2 rounded-full border transition ${
                activeRegion === region.id
                  ? "bg-[#FF5C7C] border-[#FF5C7C] text-[#15121F] font-medium"
                  : "bg-[#1E1A2E] border-white/5 text-[#ABA3C4] hover:border-white/20"
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================
          PEOPLE
      ================================================= */}

      <section className="relative z-10 max-w-4xl mx-auto mt-8 px-4 sm:px-6">
        <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide uppercase mb-3">
          Grow your circle
        </p>

        {filteredPeople.length === 0 ? (
          <div className="bg-[#1E1A2E] border border-white/5 rounded-2xl p-5">
            <p className="text-[#ABA3C4] text-sm">
              No people found here yet.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#15121F] to-transparent z-10" />

            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#15121F] to-transparent z-10" />

            <div className="no-scrollbar flex gap-3 overflow-x-auto py-1 px-1">
              {filteredPeople
                .slice(0, 12)
                .map((person) => {
                  const id = getUserId(person);

                  const location =
                    getCountryInfo(person);

                  // FIX: resolve relative backend path to absolute URL
                  const image = getImageUrl(
                    getProfileImage(person)
                  );

                  const isFollowing =
                    Boolean(
                      following[String(id)]
                    );

                  const isLoading =
                    Boolean(
                      followLoading[String(id)]
                    );

                  return (
                    <div
                      key={String(id)}
                      className="shrink-0 w-36 sm:w-40 bg-[#1E1A2E] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center hover:border-[#FF5C7C]/25 transition-colors"
                    >
                      {/* PROFILE */}
                      <Link
                        href={`/profile/${id}`}
                        className="relative w-14 h-14 mb-3"
                      >
                        <span className="block w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1]">
                          <Image
                            src={image}
                            alt={getUsername(
                              person
                            )}
                            width={56}
                            height={56}
                            unoptimized
                            className="rounded-full object-cover w-full h-full border-2 border-[#1E1A2E]"
                            onError={(event) => {
                              event.currentTarget.src =
                                "/images/default-avatar.png";
                            }}
                          />
                        </span>

                        <span className="absolute -bottom-1 -right-1 text-sm leading-none bg-[#1E1A2E] rounded-full w-5 h-5 flex items-center justify-center border border-white/10">
                          {location.flag}
                        </span>
                      </Link>

                      {/* NAME */}
                      <Link
                        href={`/profile/${id}`}
                        className="text-[#F5F1EA] text-sm font-medium truncate w-full hover:text-[#FF5C7C] transition"
                      >
                        {getUsername(person)}
                      </Link>

                      {/* HANDLE */}
                      <span className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] mb-1 truncate w-full">
                        {getHandle(person)}
                      </span>

                      {/* COUNTRY */}
                      <span className="[font-family:var(--font-mono)] text-[9px] text-[#7F7892] mb-3 truncate w-full">
                        {location.country}
                      </span>

                      {/* FOLLOW */}
                      <button
                        onClick={() =>
                          toggleFollow(id)
                        }
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition ${
                          isFollowing
                            ? "bg-[#262238] text-[#ABA3C4] border border-white/10"
                            : "bg-[#FF5C7C] text-[#15121F]"
                        } ${
                          isLoading
                            ? "opacity-60 cursor-wait"
                            : ""
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <FaCheck className="text-[10px]" />
                            Following
                          </>
                        ) : (
                          <>
                            <FaPlus className="text-[10px]" />
                            Follow
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* =================================================
          DISCOVER
      ================================================= */}

      <section className="relative z-10 max-w-4xl mx-auto mt-10 px-4 sm:px-6 pb-16">
        <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide uppercase mb-3">
          Discover
        </p>

        {filteredPosts.length === 0 ? (
          <div className="bg-[#1E1A2E] border border-white/5 rounded-2xl p-5">
            <p className="text-[#ABA3C4] text-sm">
              Nothing from this region yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
            {filteredPosts.map((post) => {
              // FIX: resolve relative backend path to absolute URL
              const image = getPostImage(post)
                ? getImageUrl(getPostImage(post))
                : null;

              const postUser =
                post?.user ||
                post?.author ||
                post?.createdBy ||
                post?.owner;

              const userId =
                getUserId(postUser);

              const location =
                getCountryInfo(postUser);

              const postText =
                getPostText(post);

              const postId =
                post?._id || post?.id;

              return (
                <Link
                  key={String(postId)}
                  href={`/post/${postId}`}
                  className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#1E1A2E]"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={
                        postText ||
                        "Circl post"
                      }
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#262238] p-4">
                      <p className="text-center text-xs text-[#ABA3C4] line-clamp-5">
                        {postText ||
                          "Circl post"}
                      </p>
                    </div>
                  )}

                  {/* HOVER INFO */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-3">
                    {userId && (
                      <span className="text-[10px] sm:text-xs text-[#F5F1EA] font-medium truncate">
                        {getUsername(
                          postUser
                        )}
                      </span>
                    )}

                    {location.country !==
                      "Unknown" && (
                      <span className="[font-family:var(--font-mono)] text-[9px] sm:text-xs text-[#F5F1EA] flex items-center gap-1 mt-1">
                        {location.flag}
                        {location.country}
                      </span>
                    )}

                    {postText && (
                      <span className="text-[9px] sm:text-xs text-white/70 line-clamp-2 mt-1">
                        {postText}
                      </span>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-white/80">
                      <span className="flex items-center gap-1 text-[9px]">
                        <FaHeart />
                        {Array.isArray(
                          post?.likes
                        )
                          ? post.likes.length
                          : post?.likesCount ||
                            0}
                      </span>

                      <span className="flex items-center gap-1 text-[9px]">
                        <FaComment />
                        {Array.isArray(
                          post?.comments
                        )
                          ? post.comments.length
                          : post?.commentsCount ||
                            0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* =================================================
          SEARCH MODAL
      ================================================= */}

      {isSearchOpen && (
        <div
          className={`fixed inset-0 bg-[#0B0912]/85 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 transition-opacity duration-200 ${
            isSearchVisible
              ? "opacity-100"
              : "opacity-0"
          }`}
          onClick={closeSearch}
        >
          <div
            className={`w-full max-w-lg bg-[#1E1A2E] border border-white/5 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-200 ${
              isSearchVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2"
            }`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center gap-3">
              <FaSearch className="text-[#ABA3C4] text-sm shrink-0" />

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search people or places…"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Escape"
                  ) {
                    closeSearch();
                  }

                  if (
                    event.key === "Enter"
                  ) {
                    closeSearch();
                  }
                }}
                className="w-full bg-transparent text-[#F5F1EA] placeholder:text-[#ABA3C4] text-sm sm:text-base focus:outline-none"
              />

              <button
                onClick={closeSearch}
                className="text-[#ABA3C4] hover:text-[#F5F1EA] shrink-0"
              >
                <FaTimes />
              </button>
            </div>

            {searchQuery && (
              <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-3 pt-3 border-t border-white/5">
                {filteredPeople.length} people ·{" "}
                {filteredPosts.length} posts
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
