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
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat mt-[-95px]">
      
      <div className="max-w-6xl mx-auto mt-24 flex gap-6 px-4">
        {/* Conversations List */}
        <div className="w-100 h-screen bg-blue-900 rounded-2xl shadow p-4 flex flex-col gap-4 mt-10">
          
          {/* Current User Profile */}
          <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-full w-30 h-30">
            <Link href="/profile" className="flex items-center gap-2">
              <Image
                src={currentUser.profilePic}
                alt={currentUser.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold text-white">{currentUser.username}</span>
            </Link>
          </div>

          {/* Conversation Users */}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedConversation(c);
                setMessages([{ sender: c.name, text: c.lastMessage }]);
              }}
              className={`p-3 rounded-lg cursor-pointer hover:bg-gray-900 ${
                selectedConversation.id === c.id ? "bg-gray-800" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={c.profilePic}
                  alt={c.name}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold text-white">{c.name}</h3>
                  <p className="text-gray-300 text-sm">{c.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-[url('/images/bg.png')] rounded-2xl shadow overflow-hidden mt-10">
          <div className="p-4 border-b border-black font-bold">{selectedConversation.name}</div>
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === "Me" ? "bg-blue-950 text-black self-end" : "bg-gray-900 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-900 text-white rounded-full hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
