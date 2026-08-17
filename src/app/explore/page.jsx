"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { FaArrowLeft, FaSearch, FaTimes, FaPlus, FaCheck } from "react-icons/fa";

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

const REGIONS = [
  { id: "all", label: "All" },
  { id: "africa", label: "Africa" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europe" },
  { id: "americas", label: "Americas" },
  { id: "oceania", label: "Oceania" },
];

const WORLD = [
  { country: "Ethiopia", flag: "🇪🇹", region: "africa" },
  { country: "Nigeria", flag: "🇳🇬", region: "africa" },
  { country: "Kenya", flag: "🇰🇪", region: "africa" },
  { country: "Japan", flag: "🇯🇵", region: "asia" },
  { country: "India", flag: "🇮🇳", region: "asia" },
  { country: "South Korea", flag: "🇰🇷", region: "asia" },
  { country: "Germany", flag: "🇩🇪", region: "europe" },
  { country: "Portugal", flag: "🇵🇹", region: "europe" },
  { country: "Sweden", flag: "🇸🇪", region: "europe" },
  { country: "Brazil", flag: "🇧🇷", region: "americas" },
  { country: "Canada", flag: "🇨🇦", region: "americas" },
  { country: "Mexico", flag: "🇲🇽", region: "americas" },
  { country: "Australia", flag: "🇦🇺", region: "oceania" },
];

export default function ExplorePage() {
  const [people, setPeople] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState("all");
  const [following, setFollowing] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch("https://jsonplaceholder.typicode.com/users");
        const usersData = await usersRes.json();

        const peopleWithLocation = usersData.map((user, i) => ({
          id: user.id,
          username: user.name,
          handle: user.username,
          profilePic: `https://randomuser.me/api/portraits/${i % 2 === 0 ? "men" : "women"}/${i + 10}.jpg`,
          location: WORLD[i % WORLD.length],
        }));
        setPeople(peopleWithLocation);

        const postsRes = await fetch("https://jsonplaceholder.typicode.com/photos");
        const postsData = await postsRes.json();
        const trending = postsData.slice(0, 24).map((p, i) => ({
          id: p.id,
          title: p.title,
          image: `https://picsum.photos/500/500?random=${p.id}`,
          location: WORLD[i % WORLD.length],
        }));
        setPosts(trending);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => setIsSearchVisible(true));
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchVisible(false);
    setTimeout(() => setIsSearchOpen(false), 200);
  };

  const toggleFollow = (id) => {
    setFollowing((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPeople = people.filter((p) => {
    const matchesRegion = activeRegion === "all" || p.location?.region === activeRegion;
    const matchesSearch =
      !searchQuery ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const filteredPosts = posts.filter((p) => {
    const matchesRegion = activeRegion === "all" || p.location?.region === activeRegion;
    const matchesSearch = !searchQuery || p.location?.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  if (loading)
    return (
      <main className="min-h-screen w-full bg-[#15121F] flex items-center justify-center">
        <p className="[font-family:var(--font-mono)] text-sm tracking-wide text-[#ABA3C4] animate-pulse">
          finding your circle…
        </p>
      </main>
    );

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

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[#9D8DF1]" />
        <div className="absolute top-1/2 -left-52 w-[420px] h-[420px] rounded-full border border-[#FFC145]" />
      </div>

      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-20 bg-[#1E1A2E]/80 hover:bg-[#262238] border border-white/5 text-[#F5F1EA] p-2.5 sm:p-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm"
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-10 pt-5 sm:pt-6 gap-3">
        <div className="flex flex-col gap-1">
          <span className="[font-family:var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#F5F1EA] tracking-tight">
            Explore
          </span>
          <span className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide">
            find people and moments from every circle
          </span>
        </div>
        <button
          onClick={openSearch}
          className="text-[#F5F1EA] bg-[#1E1A2E] hover:bg-[#262238] border border-white/5 rounded-full p-2.5 sm:p-3 transition shrink-0"
          title="Search"
        >
          <FaSearch className="text-sm" />
        </button>
      </header>

      {/* active search chip */}
      {searchQuery && !isSearchOpen && (
        <div className="relative z-10 max-w-4xl mx-auto mt-4 px-4 sm:px-6">
          <button
            onClick={openSearch}
            className="inline-flex items-center gap-2 bg-[#1E1A2E] border border-[#FF5C7C]/30 rounded-full pl-3 pr-2 py-1.5 text-xs text-[#F5F1EA] hover:border-[#FF5C7C]/60 transition"
          >
            <FaSearch className="text-[#FF5C7C] text-[10px]" />
            <span className="[font-family:var(--font-mono)]">"{searchQuery}"</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
              }}
              className="text-[#ABA3C4] hover:text-[#FF5C7C] ml-1"
            >
              <FaTimes className="text-[10px]" />
            </span>
          </button>
        </div>
      )}

      {/* region filter chips */}
      <div className="relative z-10 max-w-4xl mx-auto mt-6 px-4 sm:px-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRegion(r.id)}
              className={`shrink-0 [font-family:var(--font-mono)] text-xs px-4 py-2 rounded-full border transition ${
                activeRegion === r.id
                  ? "bg-[#FF5C7C] border-[#FF5C7C] text-[#15121F] font-medium"
                  : "bg-[#1E1A2E] border-white/5 text-[#ABA3C4] hover:border-white/20"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* grow your circle — suggested people */}
      <section className="relative z-10 max-w-4xl mx-auto mt-8 px-4 sm:px-6">
        <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide uppercase mb-3">
          Grow your circle
        </p>
        {filteredPeople.length === 0 ? (
          <p className="text-[#ABA3C4] text-sm">No one here yet — try a different region.</p>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#15121F] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#15121F] to-transparent z-10" />
            <div className="no-scrollbar flex gap-3 overflow-x-auto py-1 px-1">
              {filteredPeople.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="shrink-0 w-36 sm:w-40 bg-[#1E1A2E] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center hover:border-[#FF5C7C]/25 transition-colors"
                >
                  <span className="relative w-14 h-14 mb-3">
                    <span className="block w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FF5C7C] via-[#FFC145] to-[#9D8DF1]">
                      <Image
                        src={p.profilePic}
                        alt={p.username}
                        width={56}
                        height={56}
                        className="rounded-full object-cover w-full h-full border-2 border-[#1E1A2E]"
                      />
                    </span>
                    {p.location && (
                      <span className="absolute -bottom-1 -right-1 text-sm leading-none bg-[#1E1A2E] rounded-full w-5 h-5 flex items-center justify-center border border-white/10">
                        {p.location.flag}
                      </span>
                    )}
                  </span>
                  <span className="text-[#F5F1EA] text-sm font-medium truncate w-full">
                    {p.username}
                  </span>
                  <span className="[font-family:var(--font-mono)] text-[10px] text-[#ABA3C4] mb-3 truncate w-full">
                    {p.location?.country ?? ""}
                  </span>
                  <button
                    onClick={() => toggleFollow(p.id)}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition ${
                      following[p.id]
                        ? "bg-[#262238] text-[#ABA3C4] border border-white/10"
                        : "bg-[#FF5C7C] text-[#15121F]"
                    }`}
                  >
                    {following[p.id] ? (
                      <>
                        <FaCheck className="text-[10px]" /> Following
                      </>
                    ) : (
                      <>
                        <FaPlus className="text-[10px]" /> Follow
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* discover grid */}
      <section className="relative z-10 max-w-4xl mx-auto mt-10 px-4 sm:px-6 pb-16">
        <p className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#ABA3C4] tracking-wide uppercase mb-3">
          Discover
        </p>
        {filteredPosts.length === 0 ? (
          <p className="text-[#ABA3C4] text-sm">Nothing from this region yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#1E1A2E]"
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {post.location && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 sm:p-3">
                    <span className="[font-family:var(--font-mono)] text-[10px] sm:text-xs text-[#F5F1EA] flex items-center gap-1">
                      {post.location.flag} {post.location.country}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* search popup */}
      {isSearchOpen && (
        <div
          className={`fixed inset-0 bg-[#0B0912]/85 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 transition-opacity duration-200 ${
            isSearchVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSearch}
        >
          <div
            className={`w-full max-w-lg bg-[#1E1A2E] border border-white/5 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-200 ${
              isSearchVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <FaSearch className="text-[#ABA3C4] text-sm shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search people or places…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter") closeSearch();
                }}
                className="w-full bg-transparent text-[#F5F1EA] placeholder:text-[#ABA3C4] text-sm sm:text-base focus:outline-none"
              />
              <button onClick={closeSearch} className="text-[#ABA3C4] hover:text-[#F5F1EA] shrink-0">
                <FaTimes />
              </button>
            </div>
            {searchQuery && (
              <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4] mt-3 pt-3 border-t border-white/5">
                {filteredPeople.length} people · {filteredPosts.length} posts
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}