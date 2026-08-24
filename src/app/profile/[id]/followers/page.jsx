"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { FaArrowLeft, FaUserCheck, FaUserPlus } from "react-icons/fa";

import Avatar from "@/components/Avatar";

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
   GET TOKEN
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
   GET CURRENT USER
============================================================ */

function getCurrentUserFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved =
      localStorage.getItem(
        "currentUser"
      );

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Failed to read current user:",
      error
    );

    return null;
  }
}

/* ============================================================
   GET USER ID
============================================================ */

function getUserId(user) {
  if (!user) {
    return null;
  }

  return (
    user._id ||
    user.id ||
    user.userId ||
    null
  );
}

/* ============================================================
   NORMALIZE USER
============================================================ */

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const id =
    user._id ||
    user.id ||
    user.userId ||
    null;

  if (!id) {
    return null;
  }

  return {
    id: id.toString(),

    username:
      user.username ||
      user.name ||
      user.fullName ||
      "User",

    name:
      user.name ||
      user.fullName ||
      user.username ||
      "User",

    profilePic:
      user.profilePic ||
      user.profilePicture ||
      user.avatar ||
      "/images/default-profile.jpg",

    country:
      user.country ||
      "",

    flag:
      user.flag ||
      "",
  };
}

/* ============================================================
   EXTRACT USERS
============================================================ */

function extractUsers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.followers)) {
    return data.followers;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.user?.followers)) {
    return data.user.followers;
  }

  return [];
}

/* ============================================================
   PAGE
============================================================ */

export default function FollowersPage() {
  const router = useRouter();
  const params = useParams();

  const profileId =
    params?.id?.toString();

  const [users, setUsers] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [followLoading, setFollowLoading] =
    useState({});

  /* ============================================================
     LOAD CURRENT USER + FOLLOWERS
  ============================================================ */

  useEffect(() => {
    let isMounted = true;

    const loadFollowers = async () => {
      try {
        setLoading(true);
        setError("");

        /* -------------------------------------------------------
           CHECK PROFILE ID
        ------------------------------------------------------- */

        if (!profileId) {
          throw new Error(
            "Profile user could not be identified."
          );
        }

        /* -------------------------------------------------------
           GET TOKEN
        ------------------------------------------------------- */

        const token = getToken();

        if (!token) {
          if (isMounted) {
            setError(
              "Authentication required. Please log in."
            );
          }

          router.push("/login");
          return;
        }

        /* -------------------------------------------------------
           LOAD SAVED CURRENT USER
        ------------------------------------------------------- */

        let savedUser =
          getCurrentUserFromStorage();

        if (savedUser && isMounted) {
          setCurrentUser(
            savedUser
          );
        }

        /* -------------------------------------------------------
           REFRESH CURRENT USER
        ------------------------------------------------------- */

        try {
          const meResponse =
            await fetch(
              `${API_URL}/users/me`,
              {
                method: "GET",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
                cache: "no-store",
              }
            );

          const meData =
            await meResponse.json();

          if (
            meResponse.ok &&
            meData?.user
          ) {
            savedUser =
              meData.user;

            if (isMounted) {
              setCurrentUser(
                meData.user
              );
            }

            try {
              localStorage.setItem(
                "currentUser",
                JSON.stringify(
                  meData.user
                )
              );
            } catch (storageError) {
              console.error(
                "Failed to save current user:",
                storageError
              );
            }
          }
        } catch (meError) {
          console.error(
            "Failed to refresh current user:",
            meError
          );
        }

        /* -------------------------------------------------------
           FETCH FOLLOWERS
        ------------------------------------------------------- */

        console.log(
          "Loading followers:",
          `${API_URL}/users/${profileId}/followers`
        );

        const response =
          await fetch(
            `${API_URL}/users/${profileId}/followers`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              cache: "no-store",
            }
          );

        let data = null;

        try {
          data =
            await response.json();
        } catch (jsonError) {
          console.error(
            "Failed to parse followers response:",
            jsonError
          );
        }

        console.log(
          "Followers response:",
          data
        );

        /* -------------------------------------------------------
           AUTH ERROR
        ------------------------------------------------------- */

        if (
          response.status === 401 ||
          response.status === 403
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
          localStorage.removeItem(
            "currentUser"
          );

          if (isMounted) {
            setError(
              "Your session has expired. Please log in again."
            );
          }

          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to load followers (${response.status})`
          );
        }

        /* -------------------------------------------------------
           NORMALIZE USERS
        ------------------------------------------------------- */

        const backendUsers =
          extractUsers(data);

        const normalizedUsers =
          backendUsers
            .map(normalizeUser)
            .filter(Boolean);

        if (isMounted) {
          setUsers(
            normalizedUsers
          );
        }
      } catch (error) {
        console.error(
          "Followers loading error:",
          error
        );

        if (isMounted) {
          setError(
            error?.message ||
              "Unable to load followers."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFollowers();

    return () => {
      isMounted = false;
    };
  }, [profileId, router]);

  /* ============================================================
     CHECK FOLLOWING
  ============================================================ */

  const isFollowingUser = (
    targetUserId
  ) => {
    const following =
      Array.isArray(
        currentUser?.following
      )
        ? currentUser.following
        : [];

    return following.some(
      (item) => {
        const id =
          typeof item === "object" &&
          item !== null
            ? item._id ||
              item.id
            : item;

        return (
          id?.toString() ===
          targetUserId?.toString()
        );
      }
    );
  };

  /* ============================================================
     FOLLOW / UNFOLLOW
  ============================================================ */

  const handleToggleFollow =
    async (targetUserId) => {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const currentUserId =
        getUserId(currentUser);

      if (!currentUserId) {
        alert(
          "Please log in again."
        );

        router.push("/login");
        return;
      }

      if (!targetUserId) {
        return;
      }

      if (
        currentUserId.toString() ===
        targetUserId.toString()
      ) {
        return;
      }

      if (
        followLoading[
          targetUserId
        ]
      ) {
        return;
      }

      try {
        setFollowLoading(
          (prev) => ({
            ...prev,
            [targetUserId]: true,
          })
        );

        const response =
          await fetch(
            `${API_URL}/users/${targetUserId}/follow`,
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (
          response.status === 401 ||
          response.status === 403
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
          localStorage.removeItem(
            "currentUser"
          );

          alert(
            "Your session has expired. Please log in again."
          );

          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to update follow status"
          );
        }

        const nowFollowing =
          Boolean(
            data?.following
          );

        /* -------------------------------------------------------
           UPDATE CURRENT USER
        ------------------------------------------------------- */

        setCurrentUser(
          (previous) => {
            if (!previous) {
              return previous;
            }

            const existing =
              Array.isArray(
                previous.following
              )
                ? previous.following
                : [];

            let updated;

            if (nowFollowing) {
              const already =
                existing.some(
                  (item) => {
                    const id =
                      typeof item ===
                        "object" &&
                      item !== null
                        ? item._id ||
                          item.id
                        : item;

                    return (
                      id?.toString() ===
                      targetUserId.toString()
                    );
                  }
                );

              updated = already
                ? existing
                : [
                    ...existing,
                    targetUserId,
                  ];
            } else {
              updated =
                existing.filter(
                  (item) => {
                    const id =
                      typeof item ===
                        "object" &&
                      item !== null
                        ? item._id ||
                          item.id
                        : item;

                    return (
                      id?.toString() !==
                      targetUserId.toString()
                    );
                  }
                );
            }

            const updatedUser = {
              ...previous,
              following:
                updated,
            };

            try {
              localStorage.setItem(
                "currentUser",
                JSON.stringify(
                  updatedUser
                )
              );
            } catch (error) {
              console.error(
                "Failed to save current user:",
                error
              );
            }

            return updatedUser;
          }
        );
      } catch (error) {
        console.error(
          "Follow / unfollow error:",
          error
        );

        alert(
          error?.message ||
            "Failed to update follow status."
        );
      } finally {
        setFollowLoading(
          (prev) => ({
            ...prev,
            [targetUserId]: false,
          })
        );
      }
    };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <main
        className={`${fraunces.variable} ${inter.variable} ${mono.variable} min-h-screen bg-[#15121F] flex items-center justify-center`}
      >
        <p className="[font-family:var(--font-mono)] text-sm text-[#ABA3C4] animate-pulse">
          loading followers…
        </p>
      </main>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} [font-family:var(--font-body)] min-h-screen bg-[#15121F] text-[#F5F1EA]`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">

          <button
            onClick={() =>
              router.back()
            }
            className="w-10 h-10 rounded-full bg-[#1E1A2E] border border-white/5 flex items-center justify-center hover:bg-[#262238] transition"
          >
            <FaArrowLeft className="text-sm" />
          </button>

          <div>
            <h1 className="[font-family:var(--font-display)] text-2xl sm:text-3xl font-semibold">
              Followers
            </h1>

            <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-1">
              {users.length}{" "}
              {users.length === 1
                ? "member"
                : "members"}
            </p>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-2xl p-5 mb-6">
            <p className="text-sm text-[#FF8DA3]">
              {error}
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
        )}

        {/* EMPTY */}

        {!error &&
          users.length === 0 && (
            <div className="bg-[#1E1A2E] border border-white/5 rounded-3xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#262238] flex items-center justify-center mb-4">
                <FaUserPlus className="text-[#9D8DF1]" />
              </div>

              <h2 className="[font-family:var(--font-display)] text-xl font-semibold">
                No followers yet
              </h2>

              <p className="text-sm text-[#ABA3C4] mt-2">
                When people follow this member,
                they will appear here.
              </p>
            </div>
          )}

        {/* USERS */}

        <div className="space-y-3">

          {users.map((user) => {
            const isCurrentUser =
              getUserId(
                currentUser
              )?.toString() ===
              user.id.toString();

            const following =
              isFollowingUser(
                user.id
              );

            return (
              <div
                key={user.id}
                className="bg-[#1E1A2E] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#9D8DF1]/30 transition"
              >

                <Link
                  href={`/profile?user=${encodeURIComponent(
                    user.id
                  )}`}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <span className="rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1] shrink-0">
                    <Avatar
                      src={
                        user.profilePic
                      }
                      name={
                        user.username
                      }
                      size={48}
                      className="border-2 border-[#1E1A2E]"
                    />
                  </span>

                  <div className="min-w-0">

                    <p className="font-medium text-sm sm:text-base truncate group-hover:text-[#FF5C7C] transition">
                      {user.username}
                    </p>

                    {user.country && (
                      <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] mt-0.5">
                        {user.flag}{" "}
                        {user.country}
                      </p>
                    )}

                  </div>
                </Link>

                {!isCurrentUser && (
                  <button
                    onClick={() =>
                      handleToggleFollow(
                        user.id
                      )
                    }
                    disabled={
                      Boolean(
                        followLoading[
                          user.id
                        ]
                      )
                    }
                    className={`shrink-0 flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border transition ${
                      following
                        ? "bg-[#262238] border-[#9D8DF1]/50 text-[#F5F1EA] hover:border-[#FF5C7C]/50 hover:text-[#FF8DA3]"
                        : "bg-[#FF5C7C] border-[#FF5C7C] text-white hover:bg-[#ff4569]"
                    } ${
                      followLoading[
                        user.id
                      ]
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {following ? (
                      <>
                        <FaUserCheck />
                        <span>
                          Following
                        </span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        <span>
                          Follow
                        </span>
                      </>
                    )}
                  </button>
                )}

              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}