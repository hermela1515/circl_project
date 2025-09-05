"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function MessagesPage() {
  const router = useRouter();
  
  // Current logged-in user (top-left)
  const currentUser = {
    username: "John Doe",
    profilePic: "/images/default-profile.jpg",
  };

  // Other users for conversations
  const conversations = [
    { id: 1, name: "Alice", lastMessage: "Hey! How are you?", profilePic: "/images/user1.jpg" },
    { id: 2, name: "Bob", lastMessage: "Did you see the news?", profilePic: "/images/user2.jpg" },
    { id: 3, name: "Charlie", lastMessage: "Let's catch up tomorrow.", profilePic: "/images/user3.jpg" },
  ];

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { sender: conversations[0].name, text: conversations[0].lastMessage },
    { sender: "Me", text: "I'm good, thanks!" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { sender: "Me", text: input }]);
    setInput("");
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        title="Go Back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>
      
      <div className="max-w-7xl mx-auto mt-4 sm:mt-8 md:mt-16 lg:mt-24 flex flex-col lg:flex-row gap-4 sm:gap-6 px-2 sm:px-4 relative z-10">
        {/* Conversations List */}
        <div className="w-full lg:w-80 xl:w-96 h-64 sm:h-80 lg:h-screen bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          
          {/* Current User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image
                  src={currentUser.profilePic}
                  alt={currentUser.username}
                  width={40}
                  height={40}
                  className="relative rounded-full w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/30 shadow-lg"
                />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base drop-shadow-lg">{currentUser.username}</span>
            </Link>
          </div>

          {/* Conversation Users */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedConversation(c);
                  setMessages([{ sender: c.name, text: c.lastMessage }]);
                }}
                className={`p-3 sm:p-4 rounded-xl cursor-pointer hover:bg-white/20 mb-2 transition-all duration-300 border border-transparent hover:border-white/30 ${
                  selectedConversation.id === c.id ? "bg-white/20 border-white/40" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative group/avatar">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-sm opacity-75 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
                    <Image
                      src={c.profilePic}
                      alt={c.name}
                      width={30}
                      height={30}
                      className="relative rounded-full w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 shadow-lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate drop-shadow-lg">{c.name}</h3>
                    <p className="text-white/70 text-xs sm:text-sm truncate">{c.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 overflow-hidden min-h-96 lg:min-h-screen">
          <div className="p-3 sm:p-4 border-b border-white/20 font-bold text-sm sm:text-base text-white drop-shadow-lg bg-white/5">
            💬 {selectedConversation.name}
          </div>
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-4 sm:px-5 py-3 rounded-2xl max-w-xs sm:max-w-sm shadow-lg ${
                  msg.sender === "Me" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white self-end" 
                    : "bg-white/20 backdrop-blur-md text-white self-start border border-white/30"
                }`}
              >
                <span className="text-xs sm:text-sm leading-relaxed">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4 border-t border-white/20 flex gap-2 bg-white/5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="💬 Type a message..."
              className="flex-1 px-4 py-3 border-2 border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm sm:text-base bg-white/20 backdrop-blur-md text-white placeholder-white/70 transition-all duration-300"
            />
            <button
              onClick={handleSend}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📤 Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
