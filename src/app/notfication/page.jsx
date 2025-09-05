"use client";

import { useEffect, useState } from "react";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);

  // Simulate fetching notifications (replace with real API later)
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
    <main className="h-screen w-full bg-[url('/images/bg.png')] bg-cover bg-center">
      <div className="flex h-full w-full items-center justify-center bg-black/40">
        <div className="h-auto w-[500px] p-8 bg-white/10 rounded-4xl shadow-lg">
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            Notifications
          </h1>

          {notifications.length === 0 ? (
            <p className="text-gray-200 text-center">
              No notifications yet 🎉
            </p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`cursor-pointer p-4 rounded-3xl transition ${
                    n.read
                      ? "bg-gray-800/60 text-gray-300"
                      : "bg-blue-950 text-white font-semibold hover:bg-blue-900"
                  }`}
                >
                  {n.text}
                </li>
              ))}
            </ul>
          )}

          {/* Clear button */}
          {notifications.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={clearAll}
                className="bg-blue-950 hover:bg-blue-900 w-full h-12 rounded-3xl text-xl text-white font-semibold"
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
