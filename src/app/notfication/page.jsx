"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import {
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaCheck,
  FaBell,
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

// IMPORTANT: API_URL is the BACKEND BASE URL ONLY (no /api).
// We add /api inside each fetch call below.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =========================================================
   ICONS
========================================================= */

const ICONS = {
  like: {
    icon: FaHeart,
    color: "#FF5C7C",
  },

  comment: {
    icon: FaComment,
    color: "#9D8DF1",
  },

  follow: {
    icon: FaUserPlus,
    color: "#FFC145",
  },
};

/* =========================================================
   TABS
========================================================= */

const TABS = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "like",
    label: "Likes",
  },
  {
    id: "comment",
    label: "Comments",
  },
  {
    id: "follow",
    label: "Follows",
  },
];

/* =========================================================
   GET TOKEN
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
   TIME FORMATTER
========================================================= */

function formatTimeAgo(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    Math.max(0, now.getTime() - date.getTime());

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  return date.toLocaleDateString();
}

/* =========================================================
   NORMALIZE NOTIFICATION
========================================================= */

function normalizeNotification(notification) {
  const actor =
    notification.actor ||
    notification.sender ||
    notification.from ||
    {};

  const actorId =
    actor?._id ||
    actor?.id ||
    notification.actorId ||
    notification.senderId ||
    null;

  const actorName =
    actor?.username ||
    actor?.name ||
    notification.actorName ||
    notification.username ||
    "Someone";

  const avatar =
    actor?.profilePic ||
    actor?.avatar ||
    notification.avatar ||
    "/images/default-avatar.png";

  const type =
    notification.type === "like" ||
    notification.type === "comment" ||
    notification.type === "follow"
      ? notification.type
      : "like";

  let text = "interacted with you";

  if (type === "like") {
    text = "liked your post";
  }

  if (type === "comment") {
    text = "commented on your post";
  }

  if (type === "follow") {
    text = "started following you";
  }

  return {
    id:
      notification._id ||
      notification.id ||
      `${type}-${Date.now()}-${Math.random()}`,

    type,

    actor: actorName,

    actorId,

    avatar,

    flag:
      actor?.location?.flag ||
      notification.flag ||
      "",

    text,

    detail:
      notification.comment ||
      notification.content ||
      notification.postTitle ||
      notification.detail ||
      null,

    postId:
      notification.post?._id ||
      notification.postId ||
      null,

    createdAt:
      notification.createdAt ||
      notification.date ||
      notification.timestamp ||
      null,

    read:
      Boolean(
        notification.read ||
          notification.isRead
      ),

    group:
      notification.group ||
      "earlier",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function NotificationPage() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("all");

  const [followedBack, setFollowedBack] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/notifications`,
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

        const data = await response.json();

        if (!response.ok) {
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

            router.push("/login");

            return;
          }

          throw new Error(
            data.message ||
              "Failed to load notifications"
          );
        }

        const serverNotifications =
          Array.isArray(data.notifications)
            ? data.notifications
            : [];

        const normalized =
          serverNotifications.map(
            normalizeNotification
          );

        setNotifications(normalized);
      } catch (err) {
        console.error(
          "Load notifications error:",
          err
        );

        setError(
          err.message ||
            "Failed to load notifications."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [router]);

  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const markAsRead = async (id) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      await fetch(
        `${API_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );
    }
  };

  /* =======================================================
     MARK ALL READ
  ======================================================= */

  const markAllRead = async () => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      setMarkingAll(true);

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to mark all notifications as read"
        );
      }
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err
      );
    } finally {
      setMarkingAll(false);
    }
  };

  /* =======================================================
     FOLLOW BACK
  ======================================================= */

  const toggleFollowBack = async (
    notification
  ) => {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      if (!notification.actorId) {
        return;
      }

      const currentlyFollowing =
        Boolean(
          followedBack[notification.id]
        );

      setFollowedBack((previous) => ({
        ...previous,
        [notification.id]:
          !currentlyFollowing,
      }));

      const endpoint = currentlyFollowing
        ? `${API_URL}/api/users/${notification.actorId}/unfollow`
        : `${API_URL}/api/users/${notification.actorId}/follow`;

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (!response.ok) {
        setFollowedBack((previous) => ({
          ...previous,
          [notification.id]:
            currentlyFollowing,
        }));

        const data =
          await response.json();

        console.error(
          data.message ||
            "Follow request failed"
        );
      }
    } catch (err) {
      console.error(
        "Follow back error:",
        err
      );
    }
  };

  /* =======================================================
     OPEN ACTOR PROFILE
  ======================================================= */

  const openProfile = (notification) => {
    if (!notification.actorId) {
      return;
    }

    markAsRead(notification.id);

    router.push(
      `/profile/${notification.actorId}`
    );
  };

  /* =======================================================
     OPEN POST
  ======================================================= */

  const openPost = (notification) => {
    markAsRead(notification.id);

    if (notification.postId) {
      router.push(
        `/feed?post=${notification.postId}`
      );

      return;
    }

    if (notification.actorId) {
      router.push(
        `/profile/${notification.actorId}`
      );
    }
  };

  /* =======================================================
     UNREAD COUNT
  ======================================================= */

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.read
    ).length;
  }, [notifications]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter(
          (notification) =>
            notification.type === activeTab
        );

  /* =======================================================
     GROUPS
  ======================================================= */

  const newItems = filtered.filter(
    (notification) => {
      if (notification.group === "new") {
        return true;
      }

      if (!notification.createdAt) {
        return !notification.read;
      }

      const date = new Date(
        notification.createdAt
      );

      const difference =
        Date.now() - date.getTime();

      return (
        difference <=
        24 * 60 * 60 * 1000
      );
    }
  );

  const earlierItems = filtered.filter(
    (notification) =>
      !newItems.some(
        (item) =>
          item.id === notification.id
      )
  );

  /* =======================================================
     NOTIFICATION ROW
  ======================================================= */

  const NotificationRow = ({
    notification,
  }) => {
    const meta =
      ICONS[notification.type] ||
      ICONS.like;

    const Icon = meta.icon;

    const isFollow =
      notification.type === "follow";

    return (
      <li
        className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl transition ${
          notification.read
            ? "hover:bg-[#1E1A2E]"
            : "bg-[#1E1A2E] hover:bg-[#262238]"
        }`}
      >
        {/* AVATAR */}

        <button
          type="button"
          onClick={() =>
            openProfile(notification)
          }
          className="relative shrink-0 w-11 h-11"
          title={`View ${notification.actor}'s profile`}
        >
          <span className="block w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1]">
            <img
              src={
                notification.avatar ||
                "/images/default-avatar.png"
              }
              alt={notification.actor}
              className="rounded-full object-cover w-full h-full border-2 border-[#15121F]"
            />
          </span>

          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#15121F]"
            style={{
              backgroundColor:
                meta.color,
            }}
          >
            <Icon className="text-[9px] text-[#15121F]" />
          </span>
        </button>

        {/* CONTENT */}

        <button
          type="button"
          onClick={() => {
            if (isFollow) {
              markAsRead(notification.id);
            } else {
              openPost(notification);
            }
          }}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm text-[#F5F1EA] leading-snug">
            <span className="font-semibold">
              {notification.actor}
            </span>{" "}
            <span className="text-[#ABA3C4]">
              {notification.flag}
            </span>{" "}
            <span className="text-[#ABA3C4]">
              {notification.text}
            </span>
          </p>

          {notification.detail && (
            <p className="text-xs text-[#ABA3C4] truncate mt-0.5">
              {notification.detail}
            </p>
          )}

          <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4]/70 mt-1">
            {formatTimeAgo(
              notification.createdAt
            )}
          </p>
        </button>

        {/* ACTION */}

        {isFollow ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              toggleFollowBack(
                notification
              );
            }}
            className={`shrink-0 [font-family:var(--font-body)] text-xs font-medium px-3.5 py-2 rounded-full transition ${
              followedBack[
                notification.id
              ]
                ? "bg-[#262238] text-[#ABA3C4] border border-white/10"
                : "bg-[#FF5C7C] text-[#15121F]"
            }`}
          >
            {followedBack[
              notification.id
            ]
              ? "Following"
              : "Follow back"}
          </button>
        ) : (
          !notification.read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-[#FF5C7C]" />
          )
        )}
      </li>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className={`${fraunces.variable} ${inter.variable} ${mono.variable} [font-family:var(--font-body)] min-h-screen w-full bg-[#15121F] flex items-center justify-center`}
      >
        <div className="text-center">
          <FaBell className="text-[#9D8DF1] text-2xl mx-auto mb-3 animate-pulse" />

          <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4]">
            loading notifications…
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

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

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full border border-[#9D8DF1]" />

        <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full border border-[#FF5C7C]" />
      </div>

      {/* BACK BUTTON */}

      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-20 bg-[#1E1A2E]/80 hover:bg-[#262238] border border-white/5 text-[#F5F1EA] p-2.5 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* CONTENT */}

      <div className="relative z-10 max-w-xl mx-auto pt-16 sm:pt-20 px-4 sm:px-6 pb-16">
        {/* HEADER */}

        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="[font-family:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#F5F1EA]">
              Notifications
            </h1>

            <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-1">
              activity from your circle
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 [font-family:var(--font-mono)] text-[11px] text-[#9D8DF1] hover:text-[#B3A5F5] transition disabled:opacity-50"
            >
              <FaCheck className="text-[9px]" />

              {markingAll
                ? "marking..."
                : "mark all read"}
            </button>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-2xl px-4 py-3">
            <p className="text-[#FF8DA3] text-xs">
              {error}
            </p>

            <p className="text-[#ABA3C4] text-xs mt-1">
              Make sure your backend has the
              notifications routes enabled.
            </p>
          </div>
        )}

        {/* TABS */}

        <div className="no-scrollbar flex gap-2 overflow-x-auto mt-5 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`shrink-0 [font-family:var(--font-mono)] text-xs px-4 py-2 rounded-full border transition ${
                activeTab === tab.id
                  ? "bg-[#FF5C7C] border-[#FF5C7C] text-[#15121F] font-medium"
                  : "bg-[#1E1A2E] border-white/5 text-[#ABA3C4] hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* EMPTY */}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1E1A2E] border border-white/5 mx-auto mb-4">
              <FaBell className="text-[#9D8DF1]" />
            </span>

            <p className="text-[#ABA3C4] text-sm">
              Nothing here yet.
            </p>

            <p className="text-[#ABA3C4]/60 text-xs mt-1">
              New activity will show up as it
              happens.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* NEW */}

            {newItems.length > 0 && (
              <div>
                <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wide mb-2 px-1">
                  New
                </p>

                <ul className="space-y-1">
                  {newItems.map(
                    (notification) => (
                      <NotificationRow
                        key={
                          notification.id
                        }
                        notification={
                          notification
                        }
                      />
                    )
                  )}
                </ul>
              </div>
            )}

            {/* EARLIER */}

            {earlierItems.length > 0 && (
              <div>
                <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wide mb-2 px-1">
                  Earlier
                </p>

                <ul className="space-y-1">
                  {earlierItems.map(
                    (notification) => (
                      <NotificationRow
                        key={
                          notification.id
                        }
                        notification={
                          notification
                        }
                      />
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}