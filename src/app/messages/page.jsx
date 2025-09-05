"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MessagesPage() {
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
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat">
      
      <div className="max-w-7xl mx-auto mt-4 sm:mt-8 md:mt-16 lg:mt-24 flex flex-col lg:flex-row gap-4 sm:gap-6 px-2 sm:px-4">
        {/* Conversations List */}
        <div className="w-full lg:w-80 xl:w-96 h-64 sm:h-80 lg:h-screen bg-blue-900 rounded-xl sm:rounded-2xl shadow p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          
          {/* Current User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 bg-white rounded-full">
            <Link href="/profile" className="flex items-center gap-2">
              <Image
                src={currentUser.profilePic}
                alt={currentUser.username}
                width={40}
                height={40}
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="font-semibold text-white text-sm sm:text-base">{currentUser.username}</span>
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
                className={`p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-gray-900 mb-2 ${
                  selectedConversation.id === c.id ? "bg-gray-800" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={c.profilePic}
                    alt={c.name}
                    width={30}
                    height={30}
                    className="rounded-full w-6 h-6 sm:w-8 sm:h-8"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">{c.name}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm truncate">{c.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-[url('/images/bg.png')] rounded-xl sm:rounded-2xl shadow overflow-hidden min-h-96 lg:min-h-screen">
          <div className="p-3 sm:p-4 border-b border-black font-bold text-sm sm:text-base">{selectedConversation.name}</div>
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-3 sm:px-4 py-2 rounded-lg max-w-xs sm:max-w-sm ${
                  msg.sender === "Me" ? "bg-blue-950 text-white self-end" : "bg-gray-900 text-white self-start"
                }`}
              >
                <span className="text-xs sm:text-sm">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4 border-t border-gray-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 sm:px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm sm:text-base"
            />
            <button
              onClick={handleSend}
              className="px-3 sm:px-4 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
