"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import {
  FaArrowLeft,
  FaUser,
  FaUsers,
  FaHeart,
  FaComment,
  FaImage,
  FaPen,
  FaSignOutAlt,
  FaSpinner,
  FaUserPlus,
  FaUserCheck,
  FaEnvelope,
} from "react-icons/fa";

/* =========================================================
   FONTS
========================================================= */

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

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

/* =========================================================
   TOKEN
========================================================= */

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

/* =========================================================
   IMAGE URL
========================================================= */

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

  const backendUrl = API_URL.replace(/\/api\/?$/, "");

  if (image.startsWith("/")) {
    return `${backendUrl}${image}`;
  }

  return `${backendUrl}/${image}`;
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   GET ID
========================================================= */

function getId(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();

  /*
    /profile
    = current user's profile

    /profile/[id]
    = another user's profile
  */

  const profileId = params?.id
    ? String(params.id)
    : null;

  /* =======================================================
     STATE
  ======================================================= */

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  /* =======================================================
     IS OWN PROFILE
  ======================================================= */

  const isOwnProfile = useMemo(() => {
    if (!user || !currentUser) {
      return !profileId;
    }

    const userId = getId(user);
    const currentId = getId(currentUser);

    if (!userId || !currentId) {
      return !profileId;
    }

    return (
      userId.toString() === currentId.toString()
    );
  }, [user, currentUser, profileId]);

  /* =======================================================
     FOLLOWERS
  ======================================================= */

  const followers = useMemo(() => {
    return Array.isArray(user?.followers)
      ? user.followers
      : [];
  }, [user]);

  /* =======================================================
     FOLLOWING
  ======================================================= */

  const following = useMemo(() => {
    return Array.isArray(user?.following)
      ? user.following
      : [];
  }, [user]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const followerCount = followers.length;
  const followingCount = following.length;
  const postCount = posts.length;

  /* =======================================================
     CHECK WHETHER CURRENT USER FOLLOWS PROFILE USER
     
     IMPORTANT:
     We check currentUser.following.
  ======================================================= */

  const isFollowing = useMemo(() => {
    if (!currentUser || !user) {
      return false;
    }

    const targetId = getId(user);

    if (!targetId) {
      return false;
    }

    const currentFollowing = Array.isArray(
      currentUser.following
    )
      ? currentUser.following
      : [];

    return currentFollowing.some((item) => {
      const followingId = getId(item);

      return (
        followingId &&
        followingId.toString() ===
          targetId.toString()
      );
    });
  }, [currentUser, user]);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        /* -------------------------------------------------
           GET CURRENT USER
        ------------------------------------------------- */

        const meResponse = await fetch(
          `${API_URL}/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const meData = await meResponse.json();

        if (!meResponse.ok) {
          if (
            meResponse.status === 401 ||
            meResponse.status === 403
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("accessToken");

            router.push("/login");
            return;
          }

          throw new Error(
            meData.message ||
              "Failed to load current user"
          );
        }

        if (cancelled) {
          return;
        }

        setCurrentUser(meData.user);

        /* -------------------------------------------------
           GET PROFILE
        ------------------------------------------------- */

        let profileData;

        if (profileId) {
          const profileResponse = await fetch(
            `${API_URL}/users/${profileId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            }
          );

          profileData =
            await profileResponse.json();

          if (!profileResponse.ok) {
            if (
              profileResponse.status === 401 ||
              profileResponse.status === 403
            ) {
              localStorage.removeItem("token");
              localStorage.removeItem("authToken");
              localStorage.removeItem("accessToken");

              router.push("/login");
              return;
            }

            throw new Error(
              profileData.message ||
                "Failed to load profile"
            );
          }
        } else {
          profileData = meData;
        }

        if (cancelled) {
          return;
        }

        setUser(profileData.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Profile loading error:",
          error
        );

        setError(
          error.message ||
            "Failed to load profile"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router, profileId]);

  /* =======================================================
     LOAD POSTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const userId = getId(user);

        if (!userId) {
          setPosts([]);
          setPostsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/posts`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load posts"
          );
        }

        const allPosts = Array.isArray(data)
          ? data
          : Array.isArray(data.posts)
          ? data.posts
          : [];

        const userPosts = allPosts.filter(
          (post) => {
            const authorId =
              getId(post?.author);

            return (
              authorId?.toString() ===
              userId.toString()
            );
          }
        );

        if (!cancelled) {
          setPosts(userPosts);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Posts loading error:",
          error
        );

        setPostsError(
          error.message ||
            "Failed to load posts"
        );
      } finally {
        if (!cancelled) {
          setPostsLoading(false);
        }
      }
    };

    if (user) {
      loadPosts();
    }

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  /* =======================================================
     FOLLOW / UNFOLLOW

     IMPORTANT:
     Your backend route is:

     POST /api/users/:id/follow

     and toggleFollow handles both actions.

     Therefore we ALWAYS use POST.
  ======================================================= */

  const handleFollowToggle = async () => {
    try {
      const targetId = getId(user);
      const currentId = getId(currentUser);

      if (!targetId || !currentId) {
        return;
      }

      if (isOwnProfile) {
        return;
      }

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      setFollowLoading(true);

      const response = await fetch(
        `${API_URL}/users/${targetId}/follow`,
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
          data.message ||
            "Failed to update follow status"
        );
      }

      /*
        Determine the new state.

        Some backends return:
        following: true/false

        Others return:
        isFollowing: true/false

        We support both.
      */

      let newFollowingState;

      if (
        typeof data?.following === "boolean"
      ) {
        newFollowingState = data.following;
      } else if (
        typeof data?.isFollowing === "boolean"
      ) {
        newFollowingState =
          data.isFollowing;
      } else {
        newFollowingState = !isFollowing;
      }

      /* -------------------------------------------------
         UPDATE TARGET USER
      ------------------------------------------------- */

      setUser((previousUser) => {
        if (!previousUser) {
          return previousUser;
        }

        const oldFollowers =
          Array.isArray(
            previousUser.followers
          )
            ? previousUser.followers
            : [];

        if (newFollowingState) {
          const alreadyExists =
            oldFollowers.some((item) => {
              const followerId =
                getId(item);

              return (
                followerId?.toString() ===
                currentId.toString()
              );
            });

          return {
            ...previousUser,
            followers: alreadyExists
              ? oldFollowers
              : [
                  ...oldFollowers,
                  currentId,
                ],
          };
        }

        return {
          ...previousUser,
          followers:
            oldFollowers.filter((item) => {
              const followerId =
                getId(item);

              return (
                followerId?.toString() !==
                currentId.toString()
              );
            }),
        };
      });

      /* -------------------------------------------------
         UPDATE CURRENT USER
      ------------------------------------------------- */

      setCurrentUser((previousUser) => {
        if (!previousUser) {
          return previousUser;
        }

        const oldFollowing =
          Array.isArray(
            previousUser.following
          )
            ? previousUser.following
            : [];

        if (newFollowingState) {
          const alreadyExists =
            oldFollowing.some((item) => {
              const followingId =
                getId(item);

              return (
                followingId?.toString() ===
                targetId.toString()
              );
            });

          return {
            ...previousUser,
            following: alreadyExists
              ? oldFollowing
              : [
                  ...oldFollowing,
                  targetId,
                ],
          };
        }

        return {
          ...previousUser,
          following:
            oldFollowing.filter((item) => {
              const followingId =
                getId(item);

              return (
                followingId?.toString() !==
                targetId.toString()
              );
            }),
        };
      });
    } catch (error) {
      console.error(
        "Follow/unfollow error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  /* =======================================================
     MESSAGE USER

     IMPORTANT:
     Inbox is only shown when the user is following
     this profile.

     This matches your requirement:
     Follow first -> Inbox appears.
  ======================================================= */

  const handleMessageUser = async () => {
    try {
      const targetId = getId(user);
      const currentId = getId(currentUser);

      if (!targetId || !currentId) {
        return;
      }

      if (
        targetId.toString() ===
        currentId.toString()
      ) {
        return;
      }

      /*
        Do not allow messaging from this profile
        until the current user follows them.
      */

      if (!isFollowing) {
        alert(
          "Follow this user first to send a message."
        );
        return;
      }

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      setMessageLoading(true);

      /*
        Try to create/find conversation.
      */

      const response = await fetch(
        `${API_URL}/conversations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantId: targetId,
            userId: targetId,
          }),
        }
      );

      const data = await response.json();

      const conversationId =
        data?.conversation?._id ||
        data?.conversation?.id ||
        data?.conversationId ||
        data?.id;

      /*
        If backend returns conversation ID,
        open that conversation.
      */

      if (
        response.ok &&
        conversationId
      ) {
        router.push(
          `/messages/${conversationId}`
        );

        return;
      }

      /*
        Fallback to messages page.
      */

      router.push(
        `/messages?user=${targetId}`
      );
    } catch (error) {
      console.error(
        "Message user error:",
        error
      );

      /*
        Still open messages page if
        conversation creation fails.
      */

      const targetId = getId(user);

      if (targetId) {
        router.push(
          `/messages?user=${targetId}`
        );
      }
    } finally {
      setMessageLoading(false);
    }
  };

  /* =======================================================
     EDIT PROFILE
  ======================================================= */

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    try {
      setLoggingOut(true);

      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");

      router.replace("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
    }
  };

  /* =======================================================
     FOLLOWERS
  ======================================================= */

  const openFollowers = () => {
    const userId = getId(user);

    if (!userId) {
      return;
    }

    router.push(
      `/profile/${userId}/followers`
    );
  };

  /* =======================================================
     FOLLOWING
  ======================================================= */

  const openFollowing = () => {
    const userId = getId(user);

    if (!userId) {
      return;
    }

    router.push(
      `/profile/${userId}/following`
    );
  };

  /* =======================================================
     OPEN POST
  ======================================================= */

  const openPost = (post) => {
    const postId =
      post?._id ||
      post?.id;

    if (!postId) {
      return;
    }

    router.push(
      `/feed?post=${postId}`
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className={`
          ${fraunces.variable}
          ${inter.variable}
          ${mono.variable}
          [font-family:var(--font-body)]
          min-h-screen
          bg-[#15121F]
          flex
          items-center
          justify-center
        `}
      >
        <div className="text-center">
          <FaSpinner className="text-[#9D8DF1] text-2xl mx-auto mb-3 animate-spin" />

          <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4]">
            loading profile…
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main
        className={`
          ${fraunces.variable}
          ${inter.variable}
          ${mono.variable}
          [font-family:var(--font-body)]
          min-h-screen
          bg-[#15121F]
          flex
          items-center
          justify-center
          px-6
        `}
      >
        <div className="w-full max-w-md bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-3xl p-6 text-center">
          <FaUser className="text-[#FF5C7C] text-2xl mx-auto mb-4" />

          <h2 className="text-[#F5F1EA] text-lg font-semibold">
            Profile unavailable
          </h2>

          <p className="text-[#ABA3C4] text-sm mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 px-5 py-2.5 rounded-full bg-[#FF5C7C] text-[#15121F] text-sm font-medium"
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className={`
        ${fraunces.variable}
        ${inter.variable}
        ${mono.variable}
        [font-family:var(--font-body)]
        min-h-screen
        w-full
        bg-[#15121F]
        text-[#F5F1EA]
        relative
        overflow-hidden
      `}
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full border border-[#9D8DF1]" />

        <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full border border-[#FF5C7C]" />
      </div>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() => router.back()}
        className="
          fixed
          top-4
          left-4
          z-30
          bg-[#1E1A2E]/80
          hover:bg-[#262238]
          border
          border-white/5
          text-[#F5F1EA]
          p-2.5
          sm:p-3
          rounded-full
          transition
          hover:scale-105
          backdrop-blur-sm
        "
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#9D8DF1]">
              Circl profile
            </p>

            <h1 className="[font-family:var(--font-display)] text-2xl sm:text-3xl font-semibold mt-1">
              Profile
            </h1>
          </div>

          {/* LOGOUT */}

          {isOwnProfile && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                flex
                items-center
                gap-2
                px-3.5
                py-2
                rounded-full
                bg-[#1E1A2E]
                border
                border-[#FF5C7C]/30
                text-[#FF8DA3]
                hover:bg-[#FF5C7C]
                hover:text-[#15121F]
                transition
                text-xs
                [font-family:var(--font-mono)]
                disabled:opacity-50
              "
            >
              <FaSignOutAlt className="text-[10px]" />

              {loggingOut
                ? "logging out..."
                : "Logout"}
            </button>
          )}
        </div>

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <section className="bg-[#1E1A2E] border border-white/5 rounded-[28px] p-5 sm:p-7">

          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">

            {/* AVATAR */}

            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[3px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1]">

                <Image
                  src={getImageUrl(
                    user?.profilePic
                  )}
                  alt={
                    user?.username ||
                    "Profile"
                  }
                  width={128}
                  height={128}
                  unoptimized
                  className="
                    w-full
                    h-full
                    rounded-full
                    object-cover
                    border-4
                    border-[#15121F]
                  "
                  onError={(event) => {
                    event.currentTarget.src =
                      "/images/default-avatar.png";
                  }}
                />

              </div>
            </div>

            {/* PROFILE INFO */}

            <div className="flex-1 min-w-0 text-center sm:text-left">

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                {/* USERNAME */}

                <h2 className="[font-family:var(--font-display)] text-2xl font-semibold break-words">
                  {user?.username || "User"}
                </h2>

                {/* OTHER USER ACTIONS */}

                {!isOwnProfile && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">

                    {/* FOLLOW / UNFOLLOW */}

                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2
                        rounded-full
                        text-xs
                        font-semibold
                        transition
                        disabled:opacity-60
                        disabled:cursor-not-allowed

                        ${
                          isFollowing
                            ? "bg-[#262238] border border-[#9D8DF1]/40 text-[#D6D0E4] hover:border-[#FF5C7C]/50 hover:text-[#FF8DA3]"
                            : "bg-[#9D8DF1] text-[#15121F] hover:bg-[#B5A8F5]"
                        }
                      `}
                    >
                      {followLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <FaUserCheck />
                          Following
                        </>
                      ) : (
                        <>
                          <FaUserPlus />
                          Follow
                        </>
                      )}
                    </button>

                    {/* =================================================
                        INBOX

                        IMPORTANT:
                        Only appears AFTER following.
                    ================================================= */}

                    {isFollowing && (
                      <button
                        type="button"
                        onClick={handleMessageUser}
                        disabled={messageLoading}
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2
                          rounded-full
                          text-xs
                          font-semibold
                          bg-[#262238]
                          border
                          border-[#9D8DF1]/40
                          text-[#D6D0E4]
                          hover:bg-[#302A46]
                          hover:border-[#9D8DF1]
                          hover:text-white
                          transition
                          disabled:opacity-60
                          disabled:cursor-not-allowed
                        "
                      >
                        {messageLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaEnvelope />
                        )}

                        Inbox
                      </button>
                    )}

                  </div>
                )}

              </div>

              {/* EMAIL */}

              <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-1">
                {user?.email}
              </p>

              {/* BIO */}

              {user?.bio ? (
                <p className="text-sm text-[#D6D0E4] mt-3 max-w-xl">
                  {user.bio}
                </p>
              ) : (
                <p className="text-sm text-[#ABA3C4]/60 mt-3">
                  No bio yet.
                </p>
              )}

            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-7">

            {/* POSTS */}

            <div className="bg-[#15121F] border border-white/5 rounded-2xl px-3 py-4 text-center">
              <p className="[font-family:var(--font-display)] text-xl sm:text-2xl font-semibold">
                {postCount}
              </p>

              <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wide mt-1">
                Posts
              </p>
            </div>

            {/* FOLLOWERS */}

            <button
              type="button"
              onClick={openFollowers}
              className="
                bg-[#15121F]
                border
                border-white/5
                hover:border-[#FF5C7C]/40
                rounded-2xl
                px-3
                py-4
                text-center
                transition
                group
              "
            >
              <p className="flex items-center justify-center gap-1.5 [font-family:var(--font-display)] text-xl sm:text-2xl font-semibold">
                {followerCount}

                <FaUsers className="text-[10px] text-[#FF5C7C] opacity-0 group-hover:opacity-100 transition" />
              </p>

              <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wide mt-1">
                Followers
              </p>
            </button>

            {/* FOLLOWING */}

            <button
              type="button"
              onClick={openFollowing}
              className="
                bg-[#15121F]
                border
                border-white/5
                hover:border-[#9D8DF1]/40
                rounded-2xl
                px-3
                py-4
                text-center
                transition
                group
              "
            >
              <p className="flex items-center justify-center gap-1.5 [font-family:var(--font-display)] text-xl sm:text-2xl font-semibold">
                {followingCount}

                <FaUsers className="text-[10px] text-[#9D8DF1] opacity-0 group-hover:opacity-100 transition" />
              </p>

              <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wide mt-1">
                Following
              </p>
            </button>

          </div>

          {/* =================================================
              EDIT PROFILE

              ONLY CURRENT USER
          ================================================= */}

          {isOwnProfile && (
            <button
              type="button"
              onClick={handleEditProfile}
              className="
                w-full
                mt-4
                flex
                items-center
                justify-center
                gap-2
                py-3
                rounded-2xl
                bg-[#262238]
                hover:bg-[#302A46]
                border
                border-white/5
                text-[#F5F1EA]
                text-sm
                font-medium
                transition
              "
            >
              <FaPen className="text-xs text-[#9D8DF1]" />

              Edit profile
            </button>
          )}

        </section>

        {/* =================================================
            POSTS SECTION
        ================================================= */}

        <section className="mt-8">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="[font-family:var(--font-display)] text-xl sm:text-2xl font-semibold">
                Posts
              </h2>

              <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] mt-1">
                {postCount}{" "}
                {postCount === 1
                  ? "post"
                  : "posts"}
              </p>
            </div>

            <FaImage className="text-[#9D8DF1]" />

          </div>

          {/* POSTS LOADING */}

          {postsLoading && (
            <div className="bg-[#1E1A2E] border border-white/5 rounded-3xl p-10 text-center">

              <FaSpinner className="text-[#9D8DF1] text-xl mx-auto animate-spin" />

              <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-3">
                loading posts…
              </p>

            </div>
          )}

          {/* POSTS ERROR */}

          {!postsLoading && postsError && (
            <div className="bg-[#1E1A2E] border border-[#FF5C7C]/20 rounded-3xl p-6 text-center">

              <FaImage className="text-[#FF5C7C] mx-auto mb-3" />

              <p className="text-sm text-[#F5F1EA]">
                Could not load posts
              </p>

              <p className="text-xs text-[#ABA3C4] mt-1">
                {postsError}
              </p>

            </div>
          )}

          {/* NO POSTS */}

          {!postsLoading &&
            !postsError &&
            posts.length === 0 && (
              <div className="bg-[#1E1A2E] border border-white/5 rounded-3xl p-12 text-center">

                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#15121F] border border-white/5 mx-auto">
                  <FaImage className="text-[#9D8DF1]" />
                </span>

                <h3 className="text-sm font-medium text-[#F5F1EA] mt-4">
                  No posts yet
                </h3>

                <p className="text-xs text-[#ABA3C4] mt-1">
                  Posts shared by this user
                  will appear here.
                </p>

              </div>
            )}

          {/* POST GRID */}

          {!postsLoading &&
            !postsError &&
            posts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">

                {posts.map((post) => {
                  const postId =
                    post?._id ||
                    post?.id;

                  const image =
                    post?.image ||
                    post?.imageUrl ||
                    post?.media ||
                    post?.photo ||
                    null;

                  const title =
                    post?.title ||
                    post?.caption ||
                    post?.content ||
                    "Post";

                  const likes =
                    Array.isArray(post?.likes)
                      ? post.likes.length
                      : Number(
                          post?.likesCount ||
                            post?.likeCount ||
                            0
                        );

                  const comments =
                    Array.isArray(
                      post?.comments
                    )
                      ? post.comments.length
                      : Number(
                          post?.commentsCount ||
                            post?.commentCount ||
                            0
                        );

                  return (
                    <button
                      key={postId}
                      type="button"
                      onClick={() =>
                        openPost(post)
                      }
                      className="
                        group
                        relative
                        aspect-square
                        overflow-hidden
                        rounded-2xl
                        bg-[#1E1A2E]
                        border
                        border-white/5
                        text-left
                      "
                    >
                      {/* IMAGE */}

                      {image ? (
                        <Image
                          src={getImageUrl(
                            image
                          )}
                          alt={title}
                          fill
                          unoptimized
                          className="
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                          "
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#262238]">
                          <FaImage className="text-2xl text-[#9D8DF1]" />
                        </div>
                      )}

                      {/* HOVER OVERLAY */}

                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-[#15121F]/90
                          via-transparent
                          to-transparent
                          opacity-0
                          group-hover:opacity-100
                          transition
                        "
                      />

                      {/* POST INFO */}

                      <div
                        className="
                          absolute
                          bottom-0
                          left-0
                          right-0
                          p-3
                          opacity-0
                          group-hover:opacity-100
                          transition
                        "
                      >
                        <p className="text-xs text-[#F5F1EA] font-medium truncate">
                          {title}
                        </p>

                        <div className="flex items-center gap-3 mt-1">

                          <span className="flex items-center gap-1 text-[10px] text-[#D6D0E4]">
                            <FaHeart className="text-[#FF5C7C]" />
                            {likes}
                          </span>

                          <span className="flex items-center gap-1 text-[10px] text-[#D6D0E4]">
                            <FaComment className="text-[#9D8DF1]" />
                            {comments}
                          </span>

                        </div>
                      </div>

                    </button>
                  );
                })}

              </div>
            )}

        </section>

        {/* =================================================
            JOINED DATE
        ================================================= */}

        {user?.createdAt && (
          <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4]/50 text-center mt-10">
            Joined{" "}
            {formatDate(user.createdAt)}
          </p>
        )}

      </div>
    </main>
  );
}