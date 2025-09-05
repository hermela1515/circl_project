"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const fakeData = [
      { id: 1, text: "Alice liked your post", read: false },
      { id: 2, text: "Bob commented: 'Nice work!'", read: false },
      { id: 3, text: "Charlie started following you", read: true },
    ];
    setNotifications(fakeData);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <main className="min-h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat relative">
    
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        title="Go Back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      <div className="flex min-h-screen w-full items-center justify-center bg-black/40 p-4">
        <div className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:w-[500px] p-4 sm:p-6 md:p-8 bg-white/10 rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-lg relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6 sm:mb-8">
            Notifications
          </h1>

          {notifications.length === 0 ? (
            <p className="text-gray-200 text-center text-sm sm:text-base">
              No notifications yet 🎉
            </p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`cursor-pointer p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition ${
                    n.read
                      ? "bg-gray-800/60 text-gray-300"
                      : "bg-blue-950 text-white font-semibold hover:bg-blue-900"
                  }`}
                >
                  <span className="text-sm sm:text-base">{n.text}</span>
                </li>
              ))}
            </ul>
          )}
          {notifications.length > 0 && (
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={clearAll}
                className="bg-blue-950 hover:bg-blue-900 w-full h-10 sm:h-12 rounded-2xl sm:rounded-3xl text-lg sm:text-xl text-white font-semibold"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
