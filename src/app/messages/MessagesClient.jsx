"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import {
  FaArrowLeft,
  FaPaperPlane,
  FaSearch,
  FaSmile,
  FaPaperclip,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaPhone,
  FaVideo,
  FaTimes,
  FaChevronLeft,
} from "react-icons/fa";

/* ============================================================
   FONTS
============================================================ */

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
   API CONFIGURATION
============================================================ */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

/* ============================================================
   HELPER - IMAGE URL
============================================================ */

function getImageUrl(profilePic) {
  if (!profilePic) {
    return "/images/default-avatar.png";
  }

  if (
    profilePic.startsWith("http://") ||
    profilePic.startsWith("https://")
  ) {
    return profilePic;
  }

  if (profilePic.startsWith("/")) {
    return `${API_URL}${profilePic}`;
  }

  return profilePic;
}

/* ============================================================
   HELPER - FORMAT TIME
============================================================ */

function formatTime(date) {
  if (!date) {
    return "";
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   HELPER - FORMAT DATE
============================================================ */

function formatMessageDate(date) {
  if (!date) {
    return "";
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const today = new Date();

  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) {
    return "Today";
  }

  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ============================================================
   HELPER - GET USER ID
============================================================ */

function getUserId(user) {
  if (!user) {
    return null;
  }

  if (typeof user === "string") {
    return user;
  }

  return (
    user._id ||
    user.id ||
    user.userId ||
    null
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ==========================================================
     TARGET USER
  ========================================================== */

  const targetUserId =
    searchParams.get("userId");

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const [currentUser, setCurrentUser] =
    useState(null);

  /* ==========================================================
     FOLLOWING USERS
     
     These are the users YOU FOLLOW.
     
     They will appear even when you
     have never messaged them.
  ========================================================== */

  const [followingUsers, setFollowingUsers] =
    useState([]);

  const [loadingFollowing, setLoadingFollowing] =
    useState(true);

  /* ==========================================================
     CONVERSATIONS
  ========================================================== */

  const [conversations, setConversations] =
    useState([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(null);

  /* ==========================================================
     TEMPORARY NEW CONVERSATION USER
  ========================================================== */

  const [
    newConversationUser,
    setNewConversationUser,
  ] = useState(null);

  /* ==========================================================
     MESSAGES
  ========================================================== */

  const [
    messagesByConversation,
    setMessagesByConversation,
  ] = useState({});

  /* ==========================================================
     UI STATE
  ========================================================== */

  const [input, setInput] = useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [mobileShowChat, setMobileShowChat] =
    useState(false);

  const [
    showConversationMenu,
    setShowConversationMenu,
  ] = useState(false);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [
    loadingTargetUser,
    setLoadingTargetUser,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================
     GET TOKEN
  ========================================================== */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  /* ==========================================================
     API REQUEST HELPER
  ========================================================== */

  const apiRequest = async (
    endpoint,
    options = {}
  ) => {
    const token = getToken();

    if (!token) {
      router.push("/login");

      throw new Error(
        "Authentication required"
      );
    }

    const cleanEndpoint =
      endpoint.startsWith("/api/")
        ? endpoint
        : `/api${
            endpoint.startsWith("/")
              ? endpoint
              : `/${endpoint}`
          }`;

    const response = await fetch(
      `${API_URL}${cleanEndpoint}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {}),

          Authorization:
            `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");

        router.push("/login");

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      throw new Error(
        data?.message ||
          data?.error ||
          `Request failed (${response.status})`
      );
    }

    return data;
  };

  /* ==========================================================
     LOAD CURRENT USER
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser =
      async () => {
        try {
          const token = getToken();

          if (!token) {
            router.push("/login");
            return;
          }

          const savedUser =
            localStorage.getItem(
              "currentUser"
            );

          if (savedUser) {
            try {
              const parsedUser =
                JSON.parse(
                  savedUser
                );

              if (mounted) {
                setCurrentUser({
                  id:
                    parsedUser.id ||
                    parsedUser._id,

                  username:
                    parsedUser.username ||
                    parsedUser.name ||
                    "User",

                  email:
                    parsedUser.email ||
                    "",

                  profilePic:
                    parsedUser.profilePic ||
                    "/images/default-avatar.png",

                  bio:
                    parsedUser.bio ||
                    "",
                });
              }
            } catch (error) {
              console.error(
                "Could not parse saved user:",
                error
              );
            }
          }

          try {
            const data =
              await apiRequest(
                "/users/me"
              );

            const backendUser =
              data?.user ||
              data?.profile ||
              data?.data;

            if (
              backendUser &&
              mounted
            ) {
              const normalizedUser =
                {
                  id:
                    backendUser._id ||
                    backendUser.id,

                  username:
                    backendUser.username ||
                    backendUser.name ||
                    "User",

                  email:
                    backendUser.email ||
                    "",

                  profilePic:
                    backendUser.profilePic ||
                    backendUser.profilePicture ||
                    "/images/default-avatar.png",

                  bio:
                    backendUser.bio ||
                    "",
                };

              setCurrentUser(
                normalizedUser
              );

              localStorage.setItem(
                "currentUser",
                JSON.stringify(
                  backendUser
                )
              );
            }
          } catch (error) {
            console.error(
              "Failed to refresh current user:",
              error
            );
          }
        } catch (error) {
          console.error(
            "Error loading current user:",
            error
          );

          router.push("/login");
        }
      };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ==========================================================
     LOAD FOLLOWING USERS

     GET /api/users/:id/following
  ========================================================== */

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    let mounted = true;

    const loadFollowingUsers =
      async () => {
        try {
          setLoadingFollowing(true);

          const data =
            await apiRequest(
              `/users/${currentUser.id}/following`
            );

          console.log(
            "Following response:",
            data
          );

          /*
           * Support several possible
           * response formats.
           */

          const users =
            Array.isArray(
              data?.following
            )
              ? data.following
              : Array.isArray(
                  data?.users
                )
              ? data.users
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : Array.isArray(data)
              ? data
              : [];

          /*
           * Normalize users.
           *
           * Also make sure the current
           * user never appears.
           */

          const normalizedUsers =
            users
              .map((user) => ({
                _id:
                  user?._id ||
                  user?.id,

                username:
                  user?.username ||
                  user?.name ||
                  user?.fullName ||
                  "User",

                profilePic:
                  user?.profilePic ||
                  user?.profilePicture ||
                  user?.avatar ||
                  "/images/default-avatar.png",

                bio:
                  user?.bio ||
                  "",
              }))
              .filter((user) => {
                if (!user._id) {
                  return false;
                }

                return (
                  user._id.toString() !==
                  currentUser.id.toString()
                );
              });

          if (mounted) {
            setFollowingUsers(
              normalizedUsers
            );
          }
        } catch (error) {
          console.error(
            "Load following users error:",
            error
          );

          /*
           * Don't destroy the messages page
           * if the following request fails.
           */

          if (mounted) {
            setFollowingUsers([]);
          }
        } finally {
          if (mounted) {
            setLoadingFollowing(false);
          }
        }
      };

    loadFollowingUsers();

    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  /* ==========================================================
     LOAD CONVERSATIONS
  ========================================================== */

  const loadConversations =
    async () => {
      try {
        setLoadingConversations(true);

        setError("");

        const data =
          await apiRequest(
            "/messages/conversations"
          );

        console.log(
          "Conversations response:",
          data
        );

        if (
          data?.success &&
          Array.isArray(
            data.conversations
          )
        ) {
          setConversations(
            data.conversations
          );

          /*
           * Only automatically select
           * an existing conversation if
           * there is no target user.
           */

          if (
            !targetUserId &&
            data.conversations.length > 0
          ) {
            setSelectedConversation(
              data.conversations[0]
            );
          }
        } else if (
          Array.isArray(
            data?.conversations
          )
        ) {
          setConversations(
            data.conversations
          );
        }
      } catch (error) {
        console.error(
          "Load conversations error:",
          error
        );

        setError(
          error?.message ||
            "Failed to load conversations."
        );
      } finally {
        setLoadingConversations(false);
      }
    };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    loadConversations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  /* ==========================================================
     GET OTHER PARTICIPANT
  ========================================================== */

  const getOtherParticipant = (
    conversation
  ) => {
    if (
      !conversation ||
      !Array.isArray(
        conversation.participants
      )
    ) {
      return null;
    }

    if (!currentUser) {
      return (
        conversation.participants[0] ||
        null
      );
    }

    const currentUserId =
      currentUser.id?.toString();

    return (
      conversation.participants.find(
        (participant) => {
          const participantId =
            getUserId(
              participant
            )?.toString();

          return (
            participantId !==
            currentUserId
          );
        }
      ) || null
    );
  };

  /* ==========================================================
     FIND EXISTING CONVERSATION WITH USER
  ========================================================== */

  const findConversationWithUser =
    (userId) => {
      if (!userId) {
        return null;
      }

      return (
        conversations.find(
          (conversation) => {
            if (
              !Array.isArray(
                conversation.participants
              )
            ) {
              return false;
            }

            return conversation.participants.some(
              (participant) =>
                getUserId(
                  participant
                )?.toString() ===
                userId.toString()
            );
          }
        ) || null
      );
    };

  /* ==========================================================
     CREATE TEMPORARY CONVERSATION
  ========================================================== */

  const createTemporaryConversation =
    (user) => {
      if (!user) {
        return null;
      }

      return {
        _id: `new-${user._id}`,

        isNewConversation: true,

        targetUser: user,

        participants: [
          {
            _id: currentUser?.id,

            username:
              currentUser?.username ||
              "User",

            profilePic:
              currentUser?.profilePic ||
              "/images/default-avatar.png",
          },

          user,
        ],

        lastMessage: "",
      };
    };

  /* ==========================================================
     CONVERSATION DISPLAY DATA
  ========================================================== */

  const getConversationDisplayData =
    (conversation) => {
      /*
       * Temporary conversation.
       */

      if (
        conversation?.isNewConversation &&
        conversation?.targetUser
      ) {
        const target =
          conversation.targetUser;

        return {
          id: null,

          name:
            target.username ||
            target.name ||
            "User",

          username:
            target.username ||
            "user",

          lastMessage: "",

          profilePic:
            target.profilePic ||
            "/images/default-avatar.png",

          online: false,

          unread: 0,

          otherUserId:
            target._id ||
            target.id,
        };
      }

      const otherUser =
        getOtherParticipant(
          conversation
        );

      return {
        id:
          conversation?._id ||
          conversation?.id,

        name:
          otherUser?.username ||
          otherUser?.name ||
          "Unknown user",

        username:
          otherUser?.username ||
          otherUser?.name ||
          "unknown",

        lastMessage:
          conversation?.lastMessage ||
          conversation?.lastMessageText ||
          "",

        profilePic:
          otherUser?.profilePic ||
          otherUser?.profilePicture ||
          "/images/default-avatar.png",

        online: false,

        unread:
          conversation?.unreadCount ||
          0,

        otherUserId:
          otherUser?._id ||
          otherUser?.id,
      };
    };

  /* ==========================================================
     BUILD SIDEBAR USERS

     THIS IS THE IMPORTANT PART.

     Every followed user appears.

     If a conversation exists:
       → show the real conversation.

     If no conversation exists:
       → show a temporary conversation.
  ========================================================== */

  const sidebarConversations =
    useMemo(() => {
      const result = [];

      /*
       * First add FOLLOWED USERS.
       */

      followingUsers.forEach(
        (user) => {
          const userId =
            getUserId(user);

          if (!userId) {
            return;
          }

          const existingConversation =
            findConversationWithUser(
              userId
            );

          if (
            existingConversation
          ) {
            /*
             * Existing conversation
             * gets priority.
             */

            result.push(
              existingConversation
            );
          } else {
            /*
             * No conversation yet.
             *
             * Create temporary item.
             */

            result.push(
              createTemporaryConversation(
                user
              )
            );
          }
        }
      );

      /*
       * Add existing conversations
       * with people you don't currently
       * follow.
       *
       * This keeps old conversations
       * visible.
       */

      conversations.forEach(
        (conversation) => {
          const display =
            getConversationDisplayData(
              conversation
            );

          const alreadyAdded =
            result.some((item) => {
              const itemDisplay =
                getConversationDisplayData(
                  item
                );

              return (
                itemDisplay.otherUserId
                  ?.toString() ===
                display.otherUserId?.toString()
              );
            });

          if (!alreadyAdded) {
            result.push(conversation);
          }
        }
      );

      return result;
    }, [
      followingUsers,
      conversations,
      currentUser,
    ]);

  /* ==========================================================
     FIND / OPEN TARGET USER
     
     /messages?userId=USER_ID
  ========================================================== */

  useEffect(() => {
    if (
      !targetUserId ||
      !currentUser ||
      loadingConversations
    ) {
      return;
    }

    /*
     * Don't message yourself.
     */

    if (
      targetUserId.toString() ===
      currentUser.id?.toString()
    ) {
      router.replace("/messages");
      return;
    }

    /*
     * Existing conversation?
     */

    const existingConversation =
      findConversationWithUser(
        targetUserId
      );

    if (existingConversation) {
      setNewConversationUser(null);

      setSelectedConversation(
        existingConversation
      );

      setMobileShowChat(true);

      return;
    }

    /*
     * Maybe this user is already
     * in our following list.
     */

    const followedUser =
      followingUsers.find(
        (user) =>
          getUserId(
            user
          )?.toString() ===
          targetUserId.toString()
      );

    if (followedUser) {
      const temporaryConversation =
        createTemporaryConversation(
          followedUser
        );

      setNewConversationUser(
        followedUser
      );

      setSelectedConversation(
        temporaryConversation
      );

      setMobileShowChat(true);

      return;
    }

    /*
     * If the user is not in the
     * following list, load their
     * profile directly.
     */

    const loadTargetUser =
      async () => {
        try {
          setLoadingTargetUser(true);

          setError("");

          const data =
            await apiRequest(
              `/users/${targetUserId}`
            );

          console.log(
            "Target user response:",
            data
          );

          const user =
            data?.user ||
            data?.profile ||
            data?.data ||
            data;

          const userId =
            user?._id ||
            user?.id;

          if (!userId) {
            throw new Error(
              "Could not find this user."
            );
          }

          const normalizedUser =
            {
              _id: userId,

              username:
                user.username ||
                user.name ||
                user.fullName ||
                "User",

              profilePic:
                user.profilePic ||
                user.profilePicture ||
                user.avatar ||
                "/images/default-avatar.png",

              bio:
                user.bio ||
                "",
            };

          setNewConversationUser(
            normalizedUser
          );

          const temporaryConversation =
            createTemporaryConversation(
              normalizedUser
            );

          setSelectedConversation(
            temporaryConversation
          );

          setMobileShowChat(true);
        } catch (error) {
          console.error(
            "Load target user error:",
            error
          );

          setError(
            error?.message ||
              "Could not open this user's profile."
          );
        } finally {
          setLoadingTargetUser(false);
        }
      };

    loadTargetUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetUserId,
    currentUser,
    loadingConversations,
    followingUsers,
    conversations,
  ]);

  /* ==========================================================
     LOAD MESSAGES
  ========================================================== */

  const loadMessages = async (
    conversation
  ) => {
    if (
      !conversation?._id ||
      conversation.isNewConversation
    ) {
      return;
    }

    try {
      setLoadingMessages(true);

      setError("");

      const data =
        await apiRequest(
          `/messages/conversations/${conversation._id}`
        );

      console.log(
        "Messages response:",
        data
      );

      const backendMessages =
        data?.messages ||
        data?.data ||
        [];

      if (
        Array.isArray(
          backendMessages
        )
      ) {
        setMessagesByConversation(
          (previous) => ({
            ...previous,

            [conversation._id]:
              backendMessages,
          })
        );
      }

      try {
        await apiRequest(
          `/messages/conversations/${conversation._id}/read`,
          {
            method: "PATCH",
          }
        );
      } catch (readError) {
        console.warn(
          "Could not mark messages as read:",
          readError
        );
      }
    } catch (error) {
      console.error(
        "Load messages error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  /* ==========================================================
     LOAD MESSAGES WHEN CONVERSATION CHANGES
  ========================================================== */

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    if (
      selectedConversation.isNewConversation
    ) {
      setLoadingMessages(false);
      return;
    }

    loadMessages(
      selectedConversation
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedConversation?._id,
  ]);

  /* ==========================================================
     CURRENT MESSAGES
  ========================================================== */

  const currentMessages =
    selectedConversation &&
    !selectedConversation.isNewConversation
      ? messagesByConversation[
          selectedConversation._id
        ] || []
      : [];

  /* ==========================================================
     SCROLL TO BOTTOM
  ========================================================== */

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView(
          {
            behavior: "smooth",
          }
        );
      }, 100);

    return () =>
      clearTimeout(timeout);
  }, [
    selectedConversation?._id,
    currentMessages.length,
  ]);

  /* ==========================================================
     SEARCH

     Search both followed users and
     existing conversations.
  ========================================================== */

  const filteredConversations =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return sidebarConversations;
      }

      return sidebarConversations.filter(
        (conversation) => {
          const display =
            getConversationDisplayData(
              conversation
            );

          return (
            display.name
              .toLowerCase()
              .includes(query) ||
            display.username
              .toLowerCase()
              .includes(query) ||
            display.lastMessage
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      sidebarConversations,
      searchQuery,
    ]);

  /* ==========================================================
     SELECT CONVERSATION
  ========================================================== */

  const handleSelectConversation =
    (conversation) => {
      setNewConversationUser(
        conversation?.isNewConversation
          ? conversation.targetUser
          : null
      );

      setSelectedConversation(
        conversation
      );

      setMobileShowChat(true);

      setShowConversationMenu(
        false
      );

      if (targetUserId) {
        router.replace(
          "/messages"
        );
      }
    };

  /* ==========================================================
     SEND MESSAGE
  ========================================================== */

  const handleSend = async () => {
    const text =
      input.trim();

    if (
      !text ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    const display =
      getConversationDisplayData(
        selectedConversation
      );

    if (!display.otherUserId) {
      setError(
        "Could not find the receiver."
      );

      return;
    }

    try {
      setSending(true);

      setError("");

      const data =
        await apiRequest(
          "/messages",
          {
            method: "POST",

            body: JSON.stringify({
              receiverId:
                display.otherUserId,

              text,
            }),
          }
        );

      console.log(
        "Send message response:",
        data
      );

      if (
        data?.success &&
        data?.message
      ) {
        const realConversation =
          data.conversation;

        /*
         * Backend returned a populated
         * conversation object.
         */

        if (
          realConversation &&
          typeof realConversation ===
            "object" &&
          realConversation._id
        ) {
          const conversationId =
            realConversation._id;

          setMessagesByConversation(
            (previous) => ({
              ...previous,

              [conversationId]: [
                ...(previous[
                  conversationId
                ] || []),

                data.message,
              ],
            })
          );

          setConversations(
            (previous) => {
              const exists =
                previous.some(
                  (conversation) =>
                    conversation._id ===
                    conversationId
                );

              if (exists) {
                return previous.map(
                  (
                    conversation
                  ) =>
                    conversation._id ===
                    conversationId
                      ? {
                          ...conversation,
                          ...realConversation,
                        }
                      : conversation
                );
              }

              return [
                realConversation,
                ...previous,
              ];
            }
          );

          setSelectedConversation(
            realConversation
          );
        } else {
          /*
           * Backend only returned
           * conversation ID.
           *
           * Reload conversations.
           */

          const refreshedData =
            await apiRequest(
              "/messages/conversations"
            );

          const refreshedConversations =
            refreshedData?.conversations ||
            [];

          setConversations(
            refreshedConversations
          );

          const newConversation =
            refreshedConversations.find(
              (conversation) =>
                Array.isArray(
                  conversation.participants
                ) &&
                conversation.participants.some(
                  (participant) =>
                    getUserId(
                      participant
                    )?.toString() ===
                    display.otherUserId?.toString()
                )
            );

          if (
            newConversation
          ) {
            setSelectedConversation(
              newConversation
            );

            /*
             * Load the messages from
             * the newly created conversation.
             */

            await loadMessages(
              newConversation
            );
          }
        }

        /*
         * Clear input.
         */

        setInput("");

        if (textareaRef.current) {
          textareaRef.current.style.height =
            "auto";
        }

        /*
         * Remove ?userId=...
         */

        router.replace(
          "/messages"
        );
      }
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setError(
        error?.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /* ==========================================================
     ENTER / SHIFT ENTER
  ========================================================== */

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSend();
    }
  };

  /* ==========================================================
     AUTO RESIZE TEXTAREA
  ========================================================== */

  const handleInputChange =
    (e) => {
      setInput(
        e.target.value
      );

      e.target.style.height =
        "auto";

      e.target.style.height =
        `${Math.min(
          e.target.scrollHeight,
          120
        )}px`;
    };

  /* ==========================================================
     MOBILE BACK
  ========================================================== */

  const handleMobileBack =
    () => {
      setMobileShowChat(false);
    };

  /* ==========================================================
     CLEAR CHAT
  ========================================================== */

  const handleClearChat =
    async () => {
      if (
        !selectedConversation ||
        selectedConversation.isNewConversation
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to clear this conversation?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await apiRequest(
          `/messages/conversations/${selectedConversation._id}`,
          {
            method: "DELETE",
          }
        );

        setMessagesByConversation(
          (previous) => ({
            ...previous,

            [selectedConversation._id]:
              [],
          })
        );

        setConversations(
          (previous) =>
            previous.map(
              (conversation) =>
                conversation._id ===
                selectedConversation._id
                  ? {
                      ...conversation,

                      lastMessage:
                        "",

                      lastMessageSender:
                        null,

                      lastMessageAt:
                        null,
                    }
                  : conversation
            )
        );

        /*
         * If this person is followed,
         * the sidebar will automatically
         * turn them back into a temporary
         * "No messages yet" entry.
         */

        setSelectedConversation(
          null
        );

        setShowConversationMenu(
          false
        );
      } catch (error) {
        console.error(
          "Clear conversation error:",
          error
        );

        setError(
          error?.message ||
            "Failed to clear conversation."
        );
      }
    };

  /* ==========================================================
     SELECTED DISPLAY
  ========================================================== */

  const selectedDisplay =
    selectedConversation
      ? getConversationDisplayData(
          selectedConversation
        )
      : null;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} [font-family:var(--font-body)] min-h-screen w-full bg-[#15121F] relative overflow-hidden text-[#F5F1EA]`}
    >
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[#FF5C7C]" />

        <div className="absolute -top-20 -right-20 w-[360px] h-[360px] rounded-full border border-[#FFC145]" />

        <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full border border-[#9D8DF1]" />
      </div>

      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <button
        onClick={() =>
          router.back()
        }
        className="fixed top-4 left-4 z-50 bg-[#1E1A2E]/90 hover:bg-[#262238] border border-white/5 text-[#F5F1EA] p-2.5 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pt-16 sm:pt-20 pb-4 h-screen">
        <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] flex gap-3 sm:gap-5">

          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside
            className={`
              ${
                mobileShowChat
                  ? "hidden lg:flex"
                  : "flex"
              }
              w-full lg:w-[350px] xl:w-[380px]
              shrink-0
              bg-[#1E1A2E]
              border border-white/5
              rounded-3xl
              flex-col
              overflow-hidden
            `}
          >
            {/* HEADER */}

            <div className="p-4 sm:p-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="[font-family:var(--font-mono)] text-[9px] uppercase tracking-[0.18em] text-[#9D8DF1]">
                    Circl
                  </p>

                  <h1 className="[font-family:var(--font-display)] text-2xl sm:text-3xl font-semibold mt-0.5">
                    Messages
                  </h1>
                </div>

                <Link
                  href="/profile"
                  className="rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1] hover:scale-105 transition"
                >
                  {currentUser && (
                    <Image
                      src={getImageUrl(
                        currentUser.profilePic
                      )}
                      alt={
                        currentUser.username
                      }
                      width={42}
                      height={42}
                      unoptimized
                      className="w-[42px] h-[42px] rounded-full object-cover border-2 border-[#1E1A2E]"
                    />
                  )}
                </Link>
              </div>

              {/* SEARCH */}

              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ABA3C4] text-xs" />

                <input
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search people..."
                  className="w-full bg-[#262238] border border-white/5 rounded-2xl py-3 pl-10 pr-10 text-sm text-[#F5F1EA] placeholder:text-[#ABA3C4] focus:outline-none focus:ring-2 focus:ring-[#FF5C7C]/30 focus:border-[#FF5C7C]/30 transition"
                />

                {searchQuery && (
                  <button
                    onClick={() =>
                      setSearchQuery("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ABA3C4] hover:text-[#F5F1EA]"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* CURRENT USER */}

            {currentUser && (
              <Link
                href="/profile"
                className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#FF5C7C]/10 to-[#9D8DF1]/10 border border-white/5 hover:border-[#FF5C7C]/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={getImageUrl(
                        currentUser.profilePic
                      )}
                      alt={
                        currentUser.username
                      }
                      width={42}
                      height={42}
                      unoptimized
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#52D273] border-2 border-[#1E1A2E]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#ABA3C4]">
                      Signed in as
                    </p>

                    <p className="text-sm font-semibold truncate group-hover:text-[#FF5C7C] transition">
                      {
                        currentUser.username
                      }
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* LABEL */}

            <div className="px-4 pt-5 pb-2 flex items-center justify-between">
              <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wider">
                Following
              </p>

              <span className="text-[10px] text-[#ABA3C4]">
                {followingUsers.length}
              </span>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-[#FF5C7C]/10 border border-[#FF5C7C]/20 text-xs text-[#FF8CA3]">
                {error}
              </div>
            )}

            {/* FOLLOWING / CONVERSATIONS */}

            <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-1">
              {loadingConversations ||
              loadingFollowing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-[#FF5C7C]/30 border-t-[#FF5C7C] rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length ===
                0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-[#262238] flex items-center justify-center mb-3">
                    <FaSearch className="text-[#9D8DF1]" />
                  </div>

                  <p className="text-sm text-[#F5F1EA]">
                    {searchQuery
                      ? "No people found"
                      : "You aren't following anyone yet"}
                  </p>

                  <p className="text-xs text-[#ABA3C4] mt-1">
                    {searchQuery
                      ? "Try another username."
                      : "Follow someone to start messaging them."}
                  </p>
                </div>
              ) : (
                filteredConversations.map(
                  (conversation) => {
                    const display =
                      getConversationDisplayData(
                        conversation
                      );

                    const isTemporary =
                      conversation?.isNewConversation;

                    return (
                      <button
                        key={
                          conversation._id
                        }
                        onClick={() =>
                          handleSelectConversation(
                            conversation
                          )
                        }
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all
                          ${
                            selectedConversation?._id ===
                            conversation._id
                              ? "bg-[#262238] border border-[#FF5C7C]/25"
                              : "border border-transparent hover:bg-[#262238]/70"
                          }
                        `}
                      >
                        {/* AVATAR */}

                        <div className="relative shrink-0">
                          <Image
                            src={getImageUrl(
                              display.profilePic
                            )}
                            alt={
                              display.name
                            }
                            width={48}
                            height={48}
                            unoptimized
                            className="w-11 h-11 rounded-full object-cover border-2 border-[#1E1A2E]"
                          />

                          {/* Small online-style
                              indicator for
                              followed users */}

                          {isTemporary && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#9D8DF1] border-2 border-[#1E1A2E]" />
                          )}
                        </div>

                        {/* USER INFO */}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm truncate">
                              {
                                display.name
                              }
                            </h3>

                            {!isTemporary &&
                              conversation.lastMessageAt && (
                                <span className="shrink-0 text-[8px] text-[#77718C]">
                                  {formatTime(
                                    conversation.lastMessageAt
                                  )}
                                </span>
                              )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p
                              className={`text-xs truncate ${
                                isTemporary
                                  ? "text-[#9D8DF1]"
                                  : "text-[#ABA3C4]"
                              }`}
                            >
                              {isTemporary
                                ? "Start a conversation"
                                : display.lastMessage ||
                                  "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </aside>

          {/* ==================================================
              CHAT PANEL
          ================================================== */}

          <section
            className={`
              ${
                !mobileShowChat
                  ? "hidden lg:flex"
                  : "flex"
              }
              flex-1
              min-w-0
              bg-[#1E1A2E]
              border border-white/5
              rounded-3xl
              overflow-hidden
              flex-col
              relative
            `}
          >
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="relative mb-5">
                  <div className="absolute -inset-5 rounded-full bg-gradient-to-r from-[#FF5C7C]/10 via-[#FFC145]/10 to-[#9D8DF1]/10 blur-xl" />

                  <div className="relative w-20 h-20 rounded-full bg-[#262238] flex items-center justify-center">
                    <FaPaperPlane className="text-2xl text-[#9D8DF1]" />
                  </div>
                </div>

                <h2 className="[font-family:var(--font-display)] text-2xl font-semibold">
                  Your messages
                </h2>

                <p className="text-sm text-[#ABA3C4] mt-2 max-w-sm">
                  Select someone you follow
                  to start chatting.
                </p>
              </div>
            ) : (
              <>
                {/* =================================================
                    CHAT HEADER
                ================================================= */}

                <div className="h-[72px] sm:h-[80px] shrink-0 px-3 sm:px-5 border-b border-white/5 flex items-center justify-between relative">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                      onClick={
                        handleMobileBack
                      }
                      className="lg:hidden w-9 h-9 rounded-full bg-[#262238] flex items-center justify-center text-[#ABA3C4] hover:text-[#F5F1EA] transition"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>

                    {selectedDisplay && (
                      <>
                        <Link
                          href={`/profile/${selectedDisplay.otherUserId}`}
                          className="relative shrink-0"
                        >
                          <Image
                            src={getImageUrl(
                              selectedDisplay.profilePic
                            )}
                            alt={
                              selectedDisplay.name
                            }
                            width={46}
                            height={46}
                            unoptimized
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover hover:opacity-80 transition"
                          />
                        </Link>

                        <Link
                          href={`/profile/${selectedDisplay.otherUserId}`}
                          className="min-w-0"
                        >
                          <h2 className="[font-family:var(--font-display)] font-semibold text-base sm:text-lg truncate hover:text-[#FF5C7C] transition">
                            {
                              selectedDisplay.name
                            }
                          </h2>

                          <p className="[font-family:var(--font-mono)] text-[9px] sm:text-[10px] text-[#ABA3C4] mt-0.5">
                            Circl member
                          </p>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-[#ABA3C4] hover:bg-[#262238] hover:text-[#F5F1EA] transition"
                      title="Voice call"
                    >
                      <FaPhone className="text-xs" />
                    </button>

                    <button
                      className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-[#ABA3C4] hover:bg-[#262238] hover:text-[#F5F1EA] transition"
                      title="Video call"
                    >
                      <FaVideo className="text-xs" />
                    </button>

                    <button
                      onClick={() =>
                        setShowConversationMenu(
                          !showConversationMenu
                        )
                      }
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#ABA3C4] hover:bg-[#262238] hover:text-[#F5F1EA] transition"
                      title="More"
                    >
                      <FaEllipsisV className="text-xs" />
                    </button>
                  </div>

                  {showConversationMenu && (
                    <div className="absolute top-[68px] right-4 sm:right-5 z-30 w-48 bg-[#262238] border border-white/10 rounded-2xl shadow-2xl p-1.5">
                      <button
                        onClick={
                          handleClearChat
                        }
                        disabled={
                          selectedConversation.isNewConversation
                        }
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#FF5C7C] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Clear conversation
                      </button>

                      <button
                        onClick={() =>
                          setShowConversationMenu(
                            false
                          )
                        }
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#F5F1EA] transition"
                      >
                        Close menu
                      </button>
                    </div>
                  )}
                </div>

                {/* =================================================
                    CHAT BODY
                ================================================= */}

                <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-5 sm:py-6">
                  {loadingTargetUser ||
                  loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#FF5C7C]/30 border-t-[#FF5C7C] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      {currentMessages.length >
                        0 && (
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px flex-1 bg-white/5" />

                          <span className="[font-family:var(--font-mono)] text-[9px] uppercase tracking-wider text-[#ABA3C4]">
                            {formatMessageDate(
                              currentMessages[0]
                                ?.createdAt
                            )}
                          </span>

                          <div className="h-px flex-1 bg-white/5" />
                        </div>
                      )}

                      {currentMessages.length ===
                      0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          {selectedDisplay && (
                            <>
                              <div className="relative mb-5">
                                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#FF5C7C]/10 via-[#FFC145]/10 to-[#9D8DF1]/10 blur-xl" />

                                <Image
                                  src={getImageUrl(
                                    selectedDisplay.profilePic
                                  )}
                                  alt={
                                    selectedDisplay.name
                                  }
                                  width={72}
                                  height={72}
                                  unoptimized
                                  className="relative w-[72px] h-[72px] rounded-full object-cover"
                                />
                              </div>

                              <h3 className="[font-family:var(--font-display)] text-xl font-semibold">
                                Start a conversation
                              </h3>

                              <p className="text-sm text-[#ABA3C4] mt-1 max-w-xs">
                                Send a message to{" "}
                                {
                                  selectedDisplay.name
                                }{" "}
                                and start your circle.
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {currentMessages.map(
                            (
                              message,
                              index
                            ) => {
                              const senderId =
                                typeof message.sender ===
                                "object"
                                  ? message.sender
                                      ?._id ||
                                    message.sender
                                      ?.id
                                  : message.sender;

                              const isMine =
                                currentUser &&
                                senderId
                                  ?.toString() ===
                                  currentUser.id?.toString();

                              const previousMessage =
                                currentMessages[
                                  index - 1
                                ];

                              const previousSenderId =
                                typeof previousMessage?.sender ===
                                "object"
                                  ? previousMessage
                                      ?.sender
                                      ?._id ||
                                    previousMessage
                                      ?.sender
                                      ?.id
                                  : previousMessage?.sender;

                              const sameSender =
                                previousMessage &&
                                previousSenderId
                                  ?.toString() ===
                                  senderId?.toString();

                              const senderProfilePic =
                                typeof message.sender ===
                                "object"
                                  ? message.sender
                                      ?.profilePic
                                  : null;

                              const senderUsername =
                                typeof message.sender ===
                                "object"
                                  ? message.sender
                                      ?.username
                                  : "User";

                              return (
                                <div
                                  key={
                                    message._id ||
                                    index
                                  }
                                  className={`flex items-end gap-2 ${
                                    isMine
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  {!isMine && (
                                    <div
                                      className={`shrink-0 ${
                                        sameSender
                                          ? "opacity-0"
                                          : ""
                                      }`}
                                    >
                                      <Image
                                        src={getImageUrl(
                                          senderProfilePic
                                        )}
                                        alt={
                                          senderUsername ||
                                          "User"
                                        }
                                        width={
                                          30
                                        }
                                        height={
                                          30
                                        }
                                        unoptimized
                                        className="w-7 h-7 rounded-full object-cover"
                                      />
                                    </div>
                                  )}

                                  <div
                                    className={`max-w-[78%] sm:max-w-[65%] flex flex-col ${
                                      isMine
                                        ? "items-end"
                                        : "items-start"
                                    }`}
                                  >
                                    <div
                                      className={`
                                        px-4 py-2.5
                                        rounded-2xl
                                        text-sm
                                        leading-relaxed
                                        break-words
                                        ${
                                          isMine
                                            ? "bg-[#FF5C7C] text-[#15121F] rounded-br-md font-medium"
                                            : "bg-[#262238] text-[#F5F1EA] border border-white/5 rounded-bl-md"
                                        }
                                      `}
                                    >
                                      {
                                        message.text
                                      }
                                    </div>

                                    <div
                                      className={`flex items-center gap-1.5 mt-1 px-1 ${
                                        isMine
                                          ? "flex-row-reverse"
                                          : ""
                                      }`}
                                    >
                                      <span className="[font-family:var(--font-mono)] text-[8px] text-[#77718C]">
                                        {formatTime(
                                          message.createdAt
                                        )}
                                      </span>

                                      {isMine && (
                                        <>
                                          {message.isRead ? (
                                            <FaCheckDouble className="text-[8px] text-[#9D8DF1]" />
                                          ) : (
                                            <FaCheck className="text-[8px] text-[#77718C]" />
                                          )}

                                          <span className="text-[8px] text-[#77718C]">
                                            {message.isRead
                                              ? "Read"
                                              : "Sent"}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}

                          <div
                            ref={
                              messagesEndRef
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* =================================================
                    COMPOSER
                ================================================= */}

                <div className="shrink-0 border-t border-white/5 p-3 sm:p-4">
                  <div className="bg-[#262238] border border-white/5 rounded-2xl p-2 focus-within:border-[#FF5C7C]/30 transition">
                    <div className="flex items-end gap-2">
                      <button
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#F5F1EA] transition"
                        title="Attach file"
                      >
                        <FaPaperclip className="text-sm" />
                      </button>

                      <textarea
                        ref={
                          textareaRef
                        }
                        value={input}
                        onChange={
                          handleInputChange
                        }
                        onKeyDown={
                          handleKeyDown
                        }
                        rows={1}
                        placeholder={`Message ${
                          selectedDisplay?.name ||
                          "user"
                        }...`}
                        disabled={
                          sending
                        }
                        className="flex-1 max-h-[120px] resize-none bg-transparent py-2 px-1 text-sm text-[#F5F1EA] placeholder:text-[#77718C] focus:outline-none leading-5 disabled:opacity-50"
                      />

                      <button
                        className="hidden sm:flex w-9 h-9 shrink-0 rounded-full items-center justify-center text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#FFC145] transition"
                        title="Add emoji"
                      >
                        <FaSmile className="text-base" />
                      </button>

                      <button
                        onClick={
                          handleSend
                        }
                        disabled={
                          !input.trim() ||
                          sending
                        }
                        className={`
                          w-9 h-9 sm:w-10 sm:h-10
                          shrink-0
                          flex items-center justify-center
                          rounded-xl
                          transition-all
                          ${
                            input.trim() &&
                            !sending
                              ? "bg-[#FF5C7C] hover:bg-[#FF4A6E] text-[#15121F] hover:scale-105"
                              : "bg-[#1E1A2E] text-[#77718C] cursor-not-allowed"
                          }
                        `}
                        title="Send message"
                      >
                        {sending ? (
                          <div className="w-4 h-4 border-2 border-[#15121F]/30 border-t-[#15121F] rounded-full animate-spin" />
                        ) : (
                          <FaPaperPlane className="text-xs" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="hidden sm:block text-center [font-family:var(--font-mono)] text-[8px] text-[#77718C] mt-2">
                    Press Enter to send · Shift +
                    Enter for a new line
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}