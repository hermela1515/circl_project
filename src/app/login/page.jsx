"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";

/* =========================================================
   API
========================================================= */

// IMPORTANT:
// Keep NEXT_PUBLIC_API_URL as the backend BASE URL only.
//
// Vercel:
// NEXT_PUBLIC_API_URL=https://circl-project.onrender.com
//
// Local:
// http://localhost:5000
//
// We add /api inside the fetch request below.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =========================================================
   CIRCL LOGO
========================================================= */

function CirclMark({ large = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${
          large ? "w-14 h-14" : "w-10 h-10"
        } flex items-center justify-center`}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#FF5C7C]" />

        {/* Middle ring */}
        <div className="absolute inset-[5px] rounded-full border-2 border-[#FFC145]" />

        {/* Inner ring */}
        <div className="absolute inset-[10px] rounded-full border-2 border-[#9D8DF1]" />

        {/* Center */}
        <span className="relative w-2 h-2 rounded-full bg-[#F5F1EA]" />
      </div>

      <span
        className={`${
          large ? "text-3xl" : "text-xl"
        } font-semibold text-[#F5F1EA] tracking-tight`}
        style={{ fontFamily: "Georgia, serif" }}
      >
        circl
      </span>
    </div>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function FieldInput({ label, error, ...props }) {
  return (
    <div className="mb-5">
      <label className="block text-[#ABA3C4] mb-2 ml-1 text-sm font-medium">
        {label}
      </label>

      <input
        {...props}
        className={`
          w-full
          bg-[#262238]
          border
          ${error ? "border-[#FF5C7C]/70" : "border-white/5"}
          text-[#F5F1EA]
          placeholder:text-[#6F6982]
          h-12
          rounded-2xl
          px-4
          text-sm
          sm:text-base
          focus:outline-none
          focus:ring-2
          focus:ring-[#FF5C7C]/30
          focus:border-[#FF5C7C]/40
          transition-all
          duration-200
        `}
      />

      {error && (
        <p className="mt-2 ml-1 text-xs text-[#FF5C7C]">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

  /* =======================================================
     LOGIN HANDLER
  ======================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    /* -----------------------------------------
       FRONTEND VALIDATION
    ----------------------------------------- */

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    /* Email validation */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      /* -----------------------------------------
         SEND LOGIN REQUEST TO BACKEND
      ----------------------------------------- */

      // IMPORTANT:
      // Backend route is:
      // POST /api/auth/login
      //
      // API_URL should be:
      // https://circl-project.onrender.com
      //
      // Final URL becomes:
      // https://circl-project.onrender.com/api/auth/login

      const loginUrl =
        `${API_URL}/api/auth/login`;

      console.log(
        "Login request URL:",
        loginUrl
      );

      const response = await fetch(
        loginUrl,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),

            password,
          }),
        }
      );

      /* -----------------------------------------
         READ BACKEND RESPONSE
      ----------------------------------------- */

      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "Could not read server response:",
          jsonError
        );

        setError(
          `Server returned status ${response.status}.`
        );

        return;
      }

      console.log(
        "Login response:",
        data
      );

      /* -----------------------------------------
         HANDLE BACKEND ERROR
      ----------------------------------------- */

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      /* -----------------------------------------
         SAVE TOKEN
      ----------------------------------------- */

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      /* -----------------------------------------
         SAVE USER
      ----------------------------------------- */

      if (data.user) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify(data.user)
        );
      }

      /* -----------------------------------------
         LOGIN SUCCESS
      ----------------------------------------- */

      router.push("/feed");
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-screen
        w-full
        bg-[#15121F]
        text-[#F5F1EA]
        relative
        overflow-hidden
        font-sans
      "
    >
      {/* ===================================================
          BACKGROUND
      ==================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Pink glow */}
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full bg-[#FF5C7C]/[0.04] blur-3xl" />

        {/* Purple glow */}
        <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full bg-[#9D8DF1]/[0.04] blur-3xl" />

        {/* Decorative circles */}
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full border border-[#9D8DF1]/10" />

        <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full border border-[#FF5C7C]/10" />

        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full border border-[#FF5C7C]/10" />

        <div className="absolute -bottom-24 -right-24 w-[380px] h-[380px] rounded-full border border-[#FFC145]/10" />
      </div>

      {/* ===================================================
          BACK BUTTON
      ==================================================== */}

      <button
        onClick={() => router.back()}
        aria-label="Go back"
        title="Go back"
        className="
          fixed
          top-5
          left-5
          z-50
          w-11
          h-11
          flex
          items-center
          justify-center
          rounded-full
          bg-[#1E1A2E]/80
          border
          border-white/10
          text-[#F5F1EA]
          backdrop-blur-xl
          transition-all
          duration-300
          hover:bg-[#262238]
          hover:border-[#FF5C7C]/30
          hover:scale-105
        "
      >
        <FaArrowLeft className="text-sm" />
      </button>

      {/* ===================================================
          MAIN CONTENT
      ==================================================== */}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section className="hidden lg:flex flex-col justify-center">
            <CirclMark large />

            <div className="mt-12">
              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  text-[#FF5C7C]
                "
                style={{
                  fontFamily: "monospace",
                }}
              >
                Welcome back
              </p>

              <h1
                className="
                  mt-5
                  text-6xl
                  xl:text-7xl
                  leading-[0.95]
                  font-semibold
                "
                style={{
                  fontFamily: "Georgia, serif",
                }}
              >
                Your circle
                <br />
                is waiting
                <br />

                <span className="text-[#FF5C7C]">
                  for you.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[#ABA3C4] leading-7">
                Pick up where you left off. See what your
                people are sharing, join conversations, and
                stay connected to the moments that matter.
              </p>
            </div>

            {/* Connection visual */}

            <div className="relative mt-14 w-72 h-32">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#FF5C7C]/30" />

              <div className="absolute left-10 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#FFC145]/30" />

              <div className="absolute left-20 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#9D8DF1]/30" />

              <div className="absolute left-[115px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FF5C7C]" />

              <div className="absolute left-[170px] top-[20px] w-3 h-3 rounded-full bg-[#FFC145]" />

              <div className="absolute left-[210px] bottom-[18px] w-4 h-4 rounded-full bg-[#9D8DF1]" />
            </div>
          </section>

          {/* =================================================
              RIGHT SIDE — LOGIN CARD
          ================================================= */}

          <section className="w-full max-w-md mx-auto">
            <div
              className="
                bg-[#1E1A2E]
                border
                border-white/5
                rounded-[32px]
                p-6
                sm:p-9
                shadow-2xl
                shadow-black/20
              "
            >

              {/* Mobile logo */}

              <div className="lg:hidden flex justify-center mb-8">
                <CirclMark />
              </div>

              {/* Heading */}

              <div className="mb-8">
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.25em]
                    text-[#9D8DF1]
                  "
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  Sign in
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    sm:text-4xl
                    font-semibold
                  "
                  style={{
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Welcome back.
                </h2>

                <p className="mt-3 text-sm text-[#ABA3C4]">
                  Log in to continue to your circle.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div
                  className="
                    mb-6
                    rounded-2xl
                    border
                    border-[#FF5C7C]/20
                    bg-[#FF5C7C]/[0.06]
                    px-4
                    py-3
                  "
                >
                  <p className="text-sm text-[#FF8098]">
                    {error}
                  </p>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleLogin}>

                {/* Email */}

                <FieldInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                {/* Password */}

                <div className="mb-4">
                  <label className="block text-[#ABA3C4] mb-2 ml-1 text-sm font-medium">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="
                        w-full
                        bg-[#262238]
                        border
                        border-white/5
                        text-[#F5F1EA]
                        placeholder:text-[#6F6982]
                        h-12
                        rounded-2xl
                        px-4
                        pr-12
                        text-sm
                        sm:text-base
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#FF5C7C]/30
                        focus:border-[#FF5C7C]/40
                        transition-all
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-[#ABA3C4]
                        hover:text-[#F5F1EA]
                        transition
                      "
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}

                <div className="flex justify-end mb-6">
                  <Link
                    href="/forgot-password"
                    className="
                      text-sm
                      text-[#9D8DF1]
                      hover:text-[#B3A5F5]
                      transition-colors
                    "
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    w-full
                    h-12
                    rounded-full
                    bg-[#FF5C7C]
                    text-[#15121F]
                    font-semibold
                    text-sm
                    sm:text-base
                    flex
                    items-center
                    justify-center
                    gap-3
                    shadow-lg
                    shadow-[#FF5C7C]/10
                    transition-all
                    duration-300
                    hover:bg-[#FF4A6E]
                    hover:-translate-y-0.5
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    disabled:hover:translate-y-0
                  "
                >
                  {loading ? (
                    <>
                      <span
                        className="
                          w-4
                          h-4
                          rounded-full
                          border-2
                          border-[#15121F]/30
                          border-t-[#15121F]
                          animate-spin
                        "
                      />

                      Logging in...
                    </>
                  ) : (
                    <>
                      Log in

                      <FaArrowRight
                        className="
                          text-xs
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}

              <div className="flex items-center gap-4 my-7">
                <div className="h-px flex-1 bg-white/5" />

                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    text-[#6F6982]
                  "
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  or
                </span>

                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Signup */}

              <div className="text-center">
                <p className="text-sm text-[#ABA3C4]">
                  Don't have an account?
                </p>

                <Link
                  href="/signin"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    mt-2
                    text-[#F5F1EA]
                    font-medium
                    hover:text-[#FF5C7C]
                    transition-colors
                  "
                >
                  Create your circle

                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>

            {/* Bottom note */}

            <p
              className="
                text-center
                text-[10px]
                sm:text-xs
                text-[#ABA3C4]/40
                mt-6
              "
              style={{
                fontFamily: "monospace",
              }}
            >
              By continuing, you agree to the Circl community
              guidelines.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

