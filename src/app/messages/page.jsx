"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  FaInfoCircle,
  FaTimes,
  FaChevronLeft,
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
   DEFAULT CONVERSATIONS
============================================================ */

const DEFAULT_CONVERSATIONS = [
  {
    id: 1,
    name: "Alice",
    username: "alice",
    lastMessage: "Hey! How are you?",
    profilePic: "/images/user1.jpg",
    flag: "🇯🇵",
    online: true,
    unread: 2,
  },
  {
    id: 2,
    name: "Bob",
    username: "bob",
    lastMessage: "Did you see the news?",
    profilePic: "/images/user2.jpg",
    flag: "🇧🇷",
    online: false,
    unread: 0,
  },
  {
    id: 3,
    name: "Charlie",
    username: "charlie",
    lastMessage: "Let's catch up tomorrow.",
    profilePic: "/images/user3.jpg",
    flag: "🇩🇪",
    online: true,
    unread: 1,
  },
  {
    id: 4,
    name: "Maya",
    username: "maya",
    lastMessage: "That sounds amazing!",
    profilePic: "/images/user4.jpg",
    flag: "🇮🇳",
    online: true,
    unread: 0,
  },
];

/* ============================================================
   HELPER
============================================================ */

function formatTime(date) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   PAGE
============================================================ */

export default function MessagesPage() {
  const router = useRouter();

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ==========================================================
     CURRENT USER
  ========================================================== */

  const [currentUser, setCurrentUser] = useState({
    username: "John Doe",
    profilePic: "/images/default-profile.jpg",
  });

  /* ==========================================================
     CONVERSATIONS
  ========================================================== */

  const [conversations, setConversations] = useState(
    DEFAULT_CONVERSATIONS
  );

  const [selectedConversation, setSelectedConversation] =
    useState(DEFAULT_CONVERSATIONS[0]);

  /* ==========================================================
     MESSAGES
  ========================================================== */

  const [messagesByConversation, setMessagesByConversation] =
    useState({});

  const [input, setInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [mobileShowChat, setMobileShowChat] = useState(false);

  const [showConversationMenu, setShowConversationMenu] =
    useState(false);

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("currentUser")
      );

      if (savedUser) {
        setCurrentUser({
          username:
            savedUser.username ||
            savedUser.name ||
            "User",
          profilePic:
            savedUser.profilePic ||
            "/images/default-profile.jpg",
        });
      }

      const savedConversations = JSON.parse(
        localStorage.getItem("circlConversations")
      );

      if (
        Array.isArray(savedConversations) &&
        savedConversations.length
      ) {
        setConversations(savedConversations);

        setSelectedConversation(
          savedConversations[0]
        );
      }

      const savedMessages = JSON.parse(
        localStorage.getItem("circlMessages")
      );

      if (savedMessages) {
        setMessagesByConversation(savedMessages);
      }
    } catch (error) {
      console.error(
        "Error loading messages:",
        error
      );
    }
  }, []);

  /* ==========================================================
     SAVE CONVERSATIONS
  ========================================================== */

  useEffect(() => {
    if (conversations.length) {
      localStorage.setItem(
        "circlConversations",
        JSON.stringify(conversations)
      );
    }
  }, [conversations]);

  /* ==========================================================
     SAVE MESSAGES
  ========================================================== */

  useEffect(() => {
    localStorage.setItem(
      "circlMessages",
      JSON.stringify(messagesByConversation)
    );
  }, [messagesByConversation]);

  /* ==========================================================
     DEFAULT MESSAGES
  ========================================================== */

  const getMessages = (conversation) => {
    if (!conversation) return [];

    const existing =
      messagesByConversation[conversation.id];

    if (existing) {
      return existing;
    }

    return [
      {
        id: `${conversation.id}-1`,
        sender: conversation.name,
        text: conversation.lastMessage,
        createdAt: new Date(
          Date.now() - 1000 * 60 * 12
        ).toISOString(),
        status: "read",
      },
      {
        id: `${conversation.id}-2`,
        sender: "Me",
        text: "I'm good, thanks! 😊",
        createdAt: new Date(
          Date.now() - 1000 * 60 * 10
        ).toISOString(),
        status: "read",
      },
    ];
  };

  const currentMessages = getMessages(
    selectedConversation
  );

  /* ==========================================================
     SCROLL TO BOTTOM
  ========================================================== */

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }, [
    selectedConversation,
    currentMessages.length,
  ]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredConversations = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      return (
        conversation.name
          .toLowerCase()
          .includes(query) ||
        conversation.username
          .toLowerCase()
          .includes(query) ||
        conversation.lastMessage
          .toLowerCase()
          .includes(query)
      );
    });
  }, [conversations, searchQuery]);

  /* ==========================================================
     SELECT CONVERSATION
  ========================================================== */

  const handleSelectConversation = (
    conversation
  ) => {
    setSelectedConversation(conversation);

    setMobileShowChat(true);

    setShowConversationMenu(false);

    setConversations((prev) =>
      prev.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              unread: 0,
            }
          : item
      )
    );
  };

  /* ==========================================================
     SEND MESSAGE
  ========================================================== */

  const handleSend = () => {
    const text = input.trim();

    if (!text) return;

    const newMessage = {
      id:
        Date.now().toString() +
        Math.random().toString(36).slice(2),
      sender: "Me",
      text,
      createdAt: new Date().toISOString(),
      status: "sent",
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] ||
          getMessages(selectedConversation)),
        newMessage,
      ],
    }));

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id ===
        selectedConversation.id
          ? {
              ...conversation,
              lastMessage: text,
              unread: 0,
            }
          : conversation
      )
    );

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto";
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

  const handleInputChange = (e) => {
    setInput(e.target.value);

    e.target.style.height = "auto";

    e.target.style.height = `${Math.min(
      e.target.scrollHeight,
      120
    )}px`;
  };

  /* ==========================================================
     BACK TO CONVERSATIONS ON MOBILE
  ========================================================== */

  const handleMobileBack = () => {
    setMobileShowChat(false);
  };

  /* ==========================================================
     CLEAR CHAT
  ========================================================== */

  const handleClearChat = () => {
    setMessagesByConversation((prev) => ({
      ...prev,
      [selectedConversation.id]: [],
    }));

    setShowConversationMenu(false);
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} [font-family:var(--font-body)] min-h-screen w-full bg-[#15121F] relative overflow-hidden text-[#F5F1EA]`}
    >
      {/* ======================================================
          BACKGROUND DECORATION
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
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 bg-[#1E1A2E]/90 hover:bg-[#262238] border border-white/5 text-[#F5F1EA] p-2.5 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* ======================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 pt-16 sm:pt-20 pb-4 h-screen">

        <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] flex gap-3 sm:gap-5">

          {/* ==================================================
              CONVERSATIONS SIDEBAR
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

            {/* Sidebar header */}

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
                  <Image
                    src={
                      currentUser.profilePic
                    }
                    alt={
                      currentUser.username
                    }
                    width={42}
                    height={42}
                    className="w-[42px] h-[42px] rounded-full object-cover border-2 border-[#1E1A2E]"
                  />
                </Link>

              </div>

              {/* Search */}

              <div className="relative">

                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ABA3C4] text-xs" />

                <input
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search conversations..."
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

            {/* Your profile */}

            <Link
              href="/profile"
              className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#FF5C7C]/10 to-[#9D8DF1]/10 border border-white/5 hover:border-[#FF5C7C]/20 transition group"
            >

              <div className="flex items-center gap-3">

                <div className="relative">

                  <Image
                    src={
                      currentUser.profilePic
                    }
                    alt={
                      currentUser.username
                    }
                    width={42}
                    height={42}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#52D273] border-2 border-[#1E1A2E]" />

                </div>

                <div className="min-w-0">

                  <p className="text-xs text-[#ABA3C4]">
                    Signed in as
                  </p>

                  <p className="text-sm font-semibold truncate group-hover:text-[#FF5C7C] transition">
                    {currentUser.username}
                  </p>

                </div>

              </div>

            </Link>

            {/* Conversation label */}

            <div className="px-4 pt-5 pb-2 flex items-center justify-between">

              <p className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] uppercase tracking-wider">
                Your circle
              </p>

              <span className="text-[10px] text-[#ABA3C4]">
                {conversations.length}
              </span>

            </div>

            {/* Conversations */}

            <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-1">

              {filteredConversations.length ===
              0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">

                  <div className="w-12 h-12 rounded-full bg-[#262238] flex items-center justify-center mb-3">
                    <FaSearch className="text-[#9D8DF1]" />
                  </div>

                  <p className="text-sm text-[#F5F1EA]">
                    No conversations found
                  </p>

                  <p className="text-xs text-[#ABA3C4] mt-1">
                    Try another name.
                  </p>

                </div>
              ) : (
                filteredConversations.map(
                  (conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() =>
                        handleSelectConversation(
                          conversation
                        )
                      }
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all
                        ${
                          selectedConversation.id ===
                          conversation.id
                            ? "bg-[#262238] border border-[#FF5C7C]/25"
                            : "border border-transparent hover:bg-[#262238]/70"
                        }
                      `}
                    >

                      {/* Avatar */}

                      <div className="relative shrink-0">

                        <Image
                          src={
                            conversation.profilePic
                          }
                          alt={
                            conversation.name
                          }
                          width={48}
                          height={48}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#1E1A2E]"
                        />

                        {conversation.online && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#52D273] border-2 border-[#1E1A2E]" />
                        )}

                      </div>

                      {/* Info */}

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">

                          <h3 className="font-semibold text-sm truncate">
                            {conversation.name}
                          </h3>

                          {conversation.unread >
                            0 && (
                            <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#FF5C7C] text-[#15121F] text-[10px] font-bold flex items-center justify-center">
                              {conversation.unread >
                              9
                                ? "9+"
                                : conversation.unread}
                            </span>
                          )}

                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">

                          <span className="text-xs">
                            {conversation.flag}
                          </span>

                          <p
                            className={`text-xs truncate ${
                              conversation.unread >
                              0
                                ? "text-[#F5F1EA] font-medium"
                                : "text-[#ABA3C4]"
                            }`}
                          >
                            {
                              conversation.lastMessage
                            }
                          </p>

                        </div>

                      </div>

                    </button>
                  )
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
            `}
          >

            {/* =================================================
                CHAT HEADER
            ================================================= */}

            <div className="h-[72px] sm:h-[80px] shrink-0 px-3 sm:px-5 border-b border-white/5 flex items-center justify-between">

              <div className="flex items-center gap-2.5 sm:gap-3">

                {/* Mobile back */}

                <button
                  onClick={handleMobileBack}
                  className="lg:hidden w-9 h-9 rounded-full bg-[#262238] flex items-center justify-center text-[#ABA3C4] hover:text-[#F5F1EA] transition"
                >
                  <FaChevronLeft className="text-xs" />
                </button>

                {/* Avatar */}

                <div className="relative shrink-0">

                  <Image
                    src={
                      selectedConversation.profilePic
                    }
                    alt={
                      selectedConversation.name
                    }
                    width={46}
                    height={46}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                  />

                  {selectedConversation.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#52D273] border-2 border-[#1E1A2E]" />
                  )}

                </div>

                {/* User info */}

                <div className="min-w-0">

                  <div className="flex items-center gap-1.5">

                    <h2 className="[font-family:var(--font-display)] font-semibold text-base sm:text-lg truncate">
                      {selectedConversation.name}
                    </h2>

                    <span className="text-sm">
                      {
                        selectedConversation.flag
                      }
                    </span>

                  </div>

                  <p className="[font-family:var(--font-mono)] text-[9px] sm:text-[10px] text-[#ABA3C4] mt-0.5">
                    {selectedConversation.online
                      ? "online now"
                      : "offline"}
                  </p>

                </div>

              </div>

              {/* Header actions */}

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

              {/* More menu */}

              {showConversationMenu && (
                <div className="absolute top-[68px] right-4 sm:right-5 z-30 w-48 bg-[#262238] border border-white/10 rounded-2xl shadow-2xl p-1.5">

                  <button
                    onClick={handleClearChat}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#FF5C7C] transition"
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

              {/* Date separator */}

              <div className="flex items-center gap-3 mb-6">

                <div className="h-px flex-1 bg-white/5" />

                <span className="[font-family:var(--font-mono)] text-[9px] uppercase tracking-wider text-[#ABA3C4]">
                  Today
                </span>

                <div className="h-px flex-1 bg-white/5" />

              </div>

              {/* Messages */}

              {currentMessages.length ===
              0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">

                  <div className="relative mb-5">

                    <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#FF5C7C]/10 via-[#FFC145]/10 to-[#9D8DF1]/10 blur-xl" />

                    <Image
                      src={
                        selectedConversation.profilePic
                      }
                      alt={
                        selectedConversation.name
                      }
                      width={72}
                      height={72}
                      className="relative w-[72px] h-[72px] rounded-full object-cover"
                    />

                  </div>

                  <h3 className="[font-family:var(--font-display)] text-xl font-semibold">
                    Start a conversation
                  </h3>

                  <p className="text-sm text-[#ABA3C4] mt-1 max-w-xs">
                    Send a message to{" "}
                    {selectedConversation.name}{" "}
                    and start your circle.
                  </p>

                </div>
              ) : (
                <div className="flex flex-col gap-3">

                  {currentMessages.map(
                    (message, index) => {
                      const isMine =
                        message.sender ===
                        "Me";

                      const previousMessage =
                        currentMessages[
                          index - 1
                        ];

                      const sameSender =
                        previousMessage &&
                        previousMessage.sender ===
                          message.sender;

                      return (
                        <div
                          key={message.id || index}
                          className={`flex items-end gap-2 ${
                            isMine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          {/* Other user avatar */}

                          {!isMine && (
                            <div
                              className={`shrink-0 ${
                                sameSender
                                  ? "opacity-0"
                                  : ""
                              }`}
                            >
                              <Image
                                src={
                                  selectedConversation.profilePic
                                }
                                alt={
                                  selectedConversation.name
                                }
                                width={30}
                                height={30}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            </div>
                          )}

                          {/* Message */}

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
                              {message.text}
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
                                  {message.status ===
                                  "read" ? (
                                    <FaCheckDouble className="text-[8px] text-[#9D8DF1]" />
                                  ) : (
                                    <FaCheck className="text-[8px] text-[#77718C]" />
                                  )}

                                  <span className="text-[8px] text-[#77718C]">
                                    {message.status ===
                                    "read"
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
                    ref={messagesEndRef}
                  />

                </div>
              )}

            </div>

            {/* =================================================
                MESSAGE COMPOSER
            ================================================= */}

            <div className="shrink-0 border-t border-white/5 p-3 sm:p-4">

              <div className="bg-[#262238] border border-white/5 rounded-2xl p-2 focus-within:border-[#FF5C7C]/30 transition">

                <div className="flex items-end gap-2">

                  {/* Attach */}

                  <button
                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#F5F1EA] transition"
                    title="Attach file"
                  >
                    <FaPaperclip className="text-sm" />
                  </button>

                  {/* Input */}

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={`Message ${selectedConversation.name}...`}
                    className="flex-1 max-h-[120px] resize-none bg-transparent py-2 px-1 text-sm text-[#F5F1EA] placeholder:text-[#77718C] focus:outline-none leading-5"
                  />

                  {/* Emoji */}

                  <button
                    className="hidden sm:flex w-9 h-9 shrink-0 rounded-full items-center justify-center text-[#ABA3C4] hover:bg-[#1E1A2E] hover:text-[#FFC145] transition"
                    title="Add emoji"
                  >
                    <FaSmile className="text-base" />
                  </button>

                  {/* Send */}

                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`
                      w-9 h-9 sm:w-10 sm:h-10
                      shrink-0
                      flex items-center justify-center
                      rounded-xl
                      transition-all
                      ${
                        input.trim()
                          ? "bg-[#FF5C7C] hover:bg-[#FF4A6E] text-[#15121F] hover:scale-105"
                          : "bg-[#1E1A2E] text-[#77718C] cursor-not-allowed"
                      }
                    `}
                    title="Send message"
                  >
                    <FaPaperPlane className="text-xs" />
                  </button>

                </div>

              </div>

              <p className="hidden sm:block text-center [font-family:var(--font-mono)] text-[8px] text-[#77718C] mt-2">
                Press Enter to send · Shift + Enter
                for a new line
              </p>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}