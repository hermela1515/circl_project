"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import {
  FaArrowLeft,
  FaGlobe,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaArrowRight,
  FaUsers,
  FaHeart,
  FaComments,
  FaShareAlt,
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

const VALUES = [
  {
    number: "01",
    title: "One circle, no borders",
    body: "A post from Lagos can sit next to one from Seoul. Distance doesn't decide who you hear from.",
    color: "#FF5C7C",
  },
  {
    number: "02",
    title: "Small, human moments",
    body: "Circl is built for everyday life — not performance, virality, or chasing numbers.",
    color: "#FFC145",
  },
  {
    number: "03",
    title: "You choose your circle",
    body: "Follow the people you genuinely care about. Your feed belongs to the connections you choose.",
    color: "#9D8DF1",
  },
];

const STEPS = [
  {
    icon: FaUsers,
    title: "Find your people",
    body: "Discover friends, creators, and communities that feel right for you.",
  },
  {
    icon: FaHeart,
    title: "Share what matters",
    body: "Post moments, thoughts, photos, and stories without the pressure.",
  },
  {
    icon: FaComments,
    title: "Start conversations",
    body: "React, comment, and connect around the things you actually care about.",
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} min-h-screen w-full bg-[#15121F] text-[#F5F1EA] relative overflow-hidden`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main glow */}
        <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#FF5C7C]/[0.05] blur-3xl" />

        <div className="absolute top-[30%] -right-64 w-[600px] h-[600px] rounded-full bg-[#9D8DF1]/[0.04] blur-3xl" />

        {/* Decorative rings */}
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full border border-[#9D8DF1]/10 animate-[spin_40s_linear_infinite]" />

        <div className="absolute -top-28 -left-28 w-[400px] h-[400px] rounded-full border border-[#FF5C7C]/10" />

        <div className="absolute top-[25%] -right-52 w-[620px] h-[620px] rounded-full border border-[#FF5C7C]/10 animate-[spin_50s_linear_infinite_reverse]" />

        <div className="absolute bottom-[15%] left-[15%] w-[300px] h-[300px] rounded-full border border-[#FFC145]/10" />
      </div>

      {/* =====================================================
          BACK BUTTON
      ====================================================== */}

      <button
        onClick={() => router.back()}
        aria-label="Go back"
        title="Go back"
        className="
          fixed top-5 left-5 z-50
          w-11 h-11
          flex items-center justify-center
          rounded-full
          bg-[#1E1A2E]/80
          border border-white/10
          text-[#F5F1EA]
          backdrop-blur-xl
          transition-all duration-300
          hover:bg-[#262238]
          hover:border-[#FF5C7C]/30
          hover:scale-105
          hover:-translate-x-0.5
        "
      >
        <FaArrowLeft className="text-sm" />
      </button>

      {/* =====================================================
          TOP MINI NAV
      ====================================================== */}

      <nav className="relative z-20 w-full px-5 sm:px-8 lg:px-12 pt-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="
              group
              flex items-center gap-2
              text-[#F5F1EA]
              font-semibold
              tracking-tight
            "
          >
            <span
              className="
                w-7 h-7
                rounded-full
                bg-[#FF5C7C]
                flex items-center justify-center
                transition-transform duration-300
                group-hover:rotate-45
              "
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#15121F]" />
            </span>

            <span
              className="text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Circl
            </span>
          </Link>

          <div
            className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-[#ABA3C4]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            About the community
          </div>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-5 sm:px-8 py-20">
        <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* LEFT */}
          <div className="text-center lg:text-left">

            <div className="inline-flex items-center gap-3 mb-7">
              <span className="relative flex w-3 h-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-[#FF5C7C] opacity-40 animate-ping" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-[#FF5C7C]" />
              </span>

              <span
                className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#ABA3C4]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                About Circl
              </span>
            </div>

            <h1
              className="
                text-5xl
                sm:text-6xl
                lg:text-7xl
                xl:text-[82px]
                leading-[0.98]
                font-semibold
                tracking-tight
              "
              style={{ fontFamily: "var(--font-display)" }}
            >
              Every circle
              <br />
              starts with{" "}
              <span className="text-[#FF5C7C] relative">
                one
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#FF5C7C]/30 rounded-full" />
              </span>{" "}
              connection.
            </h1>

            <p className="mt-7 max-w-xl mx-auto lg:mx-0 text-[#ABA3C4] text-base sm:text-lg leading-8">
              Circl is a place to share your moments and stay close to
              people — across the street or across the world.
              No noise. No performance. Just people.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 mt-9">

              <Link
                href="/"
                className="
                  group
                  w-full sm:w-auto
                  inline-flex items-center justify-center gap-3
                  px-7 py-3.5
                  rounded-full
                  bg-[#FF5C7C]
                  text-[#15121F]
                  font-semibold
                  shadow-xl shadow-[#FF5C7C]/10
                  transition-all duration-300
                  hover:bg-[#FF4A6E]
                  hover:-translate-y-1
                "
              >
                Explore Circl

                <FaArrowRight
                  className="
                    text-xs
                    transition-transform duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <Link
                href="/signin"
                className="
                  w-full sm:w-auto
                  inline-flex items-center justify-center
                  px-7 py-3.5
                  rounded-full
                  border border-white/10
                  bg-white/[0.02]
                  text-[#F5F1EA]
                  font-medium
                  transition-all duration-300
                  hover:bg-white/[0.05]
                  hover:border-white/20
                  hover:-translate-y-1
                "
              >
                Join Circl
              </Link>
            </div>

            {/* mini stats */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-7">

              <div>
                <p
                  className="text-xl font-semibold text-[#F5F1EA]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  People
                </p>
                <p className="text-xs text-[#ABA3C4] mt-1">
                  at the center
                </p>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div>
                <p
                  className="text-xl font-semibold text-[#F5F1EA]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Stories
                </p>
                <p className="text-xs text-[#ABA3C4] mt-1">
                  worth sharing
                </p>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div>
                <p
                  className="text-xl font-semibold text-[#F5F1EA]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Circles
                </p>
                <p className="text-xs text-[#ABA3C4] mt-1">
                  without borders
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT — INTERACTIVE CIRCLE VISUAL */}
          <div className="relative flex items-center justify-center">

            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px]">

              {/* outer rings */}
              <div className="absolute inset-0 rounded-full border border-[#FF5C7C]/20" />

              <div className="absolute inset-[9%] rounded-full border border-[#9D8DF1]/20" />

              <div className="absolute inset-[18%] rounded-full border border-[#FFC145]/20" />

              {/* rotating ring */}
              <div
                className="
                  absolute
                  inset-[4%]
                  rounded-full
                  border border-dashed border-[#FF5C7C]/30
                  animate-[spin_20s_linear_infinite]
                "
              />

              {/* center */}
              <div
                className="
                  absolute inset-[29%]
                  rounded-full
                  bg-[#1E1A2E]
                  border border-white/10
                  shadow-2xl
                  shadow-[#FF5C7C]/10
                  flex items-center justify-center
                "
              >
                <div className="text-center">

                  <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[#FF5C7C] flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-[#15121F]" />
                  </div>

                  <p
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Circl
                  </p>

                  <p
                    className="text-[9px] uppercase tracking-[0.25em] text-[#ABA3C4] mt-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    stay connected
                  </p>
                </div>
              </div>

              {/* floating nodes */}

              <div className="absolute top-[5%] left-[16%] w-10 h-10 rounded-full bg-[#FF5C7C] border-4 border-[#15121F] shadow-lg shadow-[#FF5C7C]/20" />

              <div className="absolute top-[18%] right-[5%] w-8 h-8 rounded-full bg-[#FFC145] border-4 border-[#15121F]" />

              <div className="absolute bottom-[12%] right-[10%] w-11 h-11 rounded-full bg-[#9D8DF1] border-4 border-[#15121F]" />

              <div className="absolute bottom-[6%] left-[17%] w-7 h-7 rounded-full bg-[#FF5C7C] border-4 border-[#15121F]" />

              <div className="absolute top-[47%] -left-2 w-6 h-6 rounded-full bg-[#FFC145] border-4 border-[#15121F]" />
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ====================================================== */}

      <section className="relative z-10 px-5 sm:px-8 py-20 sm:py-28 border-t border-white/5">

        <div className="max-w-6xl mx-auto">

          <div className="max-w-2xl mb-12">
            <span
              className="text-[#FF5C7C] text-xs uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              What we believe
            </span>

            <h2
              className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Social should feel
              <span className="text-[#9D8DF1]"> social.</span>
            </h2>

            <p className="mt-5 text-[#ABA3C4] leading-7">
              We are building a quieter kind of social space — one
              that puts relationships ahead of algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {VALUES.map((value) => (
              <div
                key={value.number}
                className="
                  group
                  relative
                  bg-[#1E1A2E]
                  border border-white/5
                  rounded-[28px]
                  p-7
                  overflow-hidden
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:border-white/10
                "
              >

                <div
                  className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-2xl opacity-10 transition-opacity duration-500 group-hover:opacity-20"
                  style={{ backgroundColor: value.color }}
                />

                <div className="flex items-center justify-between">

                  <span
                    className="text-xs"
                    style={{
                      color: value.color,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {value.number}
                  </span>

                  <span
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: value.color }}
                  />
                </div>

                <h3
                  className="mt-12 text-xl font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value.title}
                </h3>

                <p className="mt-3 text-sm text-[#ABA3C4] leading-7">
                  {value.body}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="relative z-10 px-5 sm:px-8 py-20 sm:py-28 bg-[#0F0D17]">

        <div className="max-w-6xl mx-auto">

          <div className="text-center max-w-2xl mx-auto">

            <span
              className="text-[#FFC145] text-xs uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Simple by design
            </span>

            <h2
              className="mt-4 text-4xl sm:text-5xl font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your circle,
              <br />
              <span className="text-[#FF5C7C]">your way.</span>
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">

            {STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative text-center md:text-left"
                >

                  {index !== STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+50px)] right-[-30px] border-t border-dashed border-white/10" />
                  )}

                  <div className="relative mx-auto md:mx-0 w-16 h-16 rounded-2xl bg-[#1E1A2E] border border-white/10 flex items-center justify-center text-[#FF5C7C]">

                    <Icon />

                  </div>

                  <div
                    className="mt-7 text-xs text-[#ABA3C4]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    0{index + 1}
                  </div>

                  <h3
                    className="mt-2 text-xl font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm text-[#ABA3C4] leading-7 max-w-sm mx-auto md:mx-0">
                    {step.body}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          COMMUNITY CTA
      ====================================================== */}

      <section className="relative z-10 px-5 sm:px-8 py-24">

        <div
          className="
            max-w-5xl mx-auto
            relative overflow-hidden
            rounded-[36px]
            border border-white/10
            bg-[#1E1A2E]
            px-6 sm:px-12
            py-16
            text-center
          "
        >

          {/* background circles */}
          <div className="absolute -top-32 -left-20 w-64 h-64 rounded-full border border-[#FF5C7C]/10" />
          <div className="absolute -bottom-32 -right-20 w-64 h-64 rounded-full border border-[#9D8DF1]/10" />

          <div className="relative">

            <div className="mx-auto w-14 h-14 rounded-full bg-[#FF5C7C] flex items-center justify-center mb-7">

              <FaShareAlt className="text-[#15121F]" />

            </div>

            <h2
              className="text-4xl sm:text-5xl font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your people are
              <br />
              <span className="text-[#FF5C7C]">waiting for you.</span>
            </h2>

            <p className="mt-5 max-w-xl mx-auto text-[#ABA3C4] leading-7">
              Create your circle, share something real, and start
              conversations that matter.
            </p>

            <div className="mt-8">

              <Link
                href="/signin"
                className="
                  inline-flex items-center gap-3
                  bg-[#FF5C7C]
                  text-[#15121F]
                  px-8 py-3.5
                  rounded-full
                  font-semibold
                  transition-all duration-300
                  hover:bg-[#FF4A6E]
                  hover:-translate-y-1
                  shadow-xl shadow-[#FF5C7C]/10
                "
              >
                Create your circle

                <FaArrowRight className="text-xs" />
              </Link>

            </div>

          </div>
        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="relative z-10 border-t border-white/5 bg-[#0B0910] px-5 sm:px-8 py-12">

        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* brand */}
            <div className="lg:col-span-2">

              <Link
                href="/"
                className="inline-flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-full bg-[#FF5C7C] flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-[#15121F]" />
                </span>

                <span
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Circl
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-sm text-[#ABA3C4] leading-7">
                A quieter social space for real people,
                real moments, and meaningful connections.
              </p>

              <div className="flex gap-3 mt-6">

                <a
                  href="#"
                  aria-label="Circl website"
                  className="w-9 h-9 rounded-full bg-[#1E1A2E] border border-white/5 flex items-center justify-center text-[#ABA3C4] hover:text-[#FF5C7C] hover:border-[#FF5C7C]/20 transition"
                >
                  <FaGlobe />
                </a>

                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-[#1E1A2E] border border-white/5 flex items-center justify-center text-[#ABA3C4] hover:text-[#FF5C7C] hover:border-[#FF5C7C]/20 transition"
                >
                  <FaFacebook />
                </a>

                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-full bg-[#1E1A2E] border border-white/5 flex items-center justify-center text-[#ABA3C4] hover:text-[#FF5C7C] hover:border-[#FF5C7C]/20 transition"
                >
                  <FaTwitter />
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-[#1E1A2E] border border-white/5 flex items-center justify-center text-[#ABA3C4] hover:text-[#FF5C7C] hover:border-[#FF5C7C]/20 transition"
                >
                  <FaInstagram />
                </a>

              </div>

            </div>

            {/* navigation */}
            <div>

              <h4
                className="text-sm font-semibold text-[#F5F1EA]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Explore
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#ABA3C4]">

                <Link
                  href="/"
                  className="hover:text-[#FF5C7C] transition"
                >
                  Home
                </Link>

                <Link
                  href="/signin"
                  className="hover:text-[#FF5C7C] transition"
                >
                  Sign in
                </Link>

                <Link
                  href="/signup"
                  className="hover:text-[#FF5C7C] transition"
                >
                  Create account
                </Link>

              </div>

            </div>

            {/* contact */}
            <div>

              <h4
                className="text-sm font-semibold text-[#F5F1EA]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Contact
              </h4>

              <div
                className="mt-5 flex flex-col gap-3 text-sm text-[#ABA3C4]"
                style={{ fontFamily: "var(--font-mono)" }}
              >

                <a
                  href="mailto:support@circl.com"
                  className="hover:text-[#FF5C7C] transition break-all"
                >
                  support@circl.com
                </a>

                <a
                  href="tel:+251900000000"
                  className="hover:text-[#FF5C7C] transition"
                >
                  +251 900 000 000
                </a>

              </div>

            </div>

          </div>

          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p
              className="text-xs text-[#ABA3C4]/50"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              © {new Date().getFullYear()} Circl. All rights reserved.
            </p>

            <p
              className="text-xs text-[#ABA3C4]/40"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Made for meaningful connections.
            </p>

          </div>

        </div>
      </footer>

    </main>
  );
}