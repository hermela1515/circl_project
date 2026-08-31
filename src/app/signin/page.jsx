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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
        <div className="absolute inset-0 rounded-full border-2 border-[#FF5C7C]" />

        <div className="absolute inset-[5px] rounded-full border-2 border-[#FFC145]" />

        <div className="absolute inset-[10px] rounded-full border-2 border-[#9D8DF1]" />

        <span className="relative w-2 h-2 rounded-full bg-[#F5F1EA]" />
      </div>

      <span
        className={`${
          large ? "text-3xl" : "text-xl"
        } font-semibold text-[#F5F1EA] tracking-tight`}
        style={{
          fontFamily: "Georgia, serif",
        }}
      >
        circl
      </span>
    </div>
  );
}

/* =========================================================
   FIELD INPUT
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
   SIGN UP PAGE
========================================================= */

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  /* =======================================================
     SIGN UP HANDLER
  ======================================================== */

  const handleSignUp = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.trim().length < 3) {
      setError(
        "Username must be at least 3 characters long."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        data = {
          message: "Invalid response from the server.",
        };
      }

      console.log("Registration response:", data);

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create your account. Please try again."
        );

        return;
      }

      /*
       * Do not save JWT here.
       *
       * User must verify email first.
       */

      router.push(
        `/verify-email?email=${encodeURIComponent(
          email.trim().toLowerCase()
        )}`
      );
    } catch (err) {
      console.error("Signup error:", err);

      setError(
        "Unable to connect to the server. Make sure your backend is running."
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
      "
      style={{
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      {/* ===================================================
          BACKGROUND
      ==================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full bg-[#FF5C7C]/[0.04] blur-3xl" />

        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full bg-[#9D8DF1]/[0.04] blur-3xl" />

        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full border border-[#FF5C7C]/10" />

        <div className="absolute -top-24 -right-24 w-[360px] h-[360px] rounded-full border border-[#FFC145]/10" />

        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full border border-[#9D8DF1]/10" />

        <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full border border-[#FF5C7C]/10" />
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

          {/* LEFT SIDE */}

          <section className="hidden lg:flex flex-col justify-center">
            <CirclMark large />

            <div className="mt-12">
              <p
                className="text-xs uppercase tracking-[0.3em] text-[#FFC145]"
                style={{
                  fontFamily: "monospace",
                }}
              >
                Join Circl
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
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                Find your
                <br />
                people.
                <br />

                <span className="text-[#FF5C7C]">
                  Build your circle.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[#ABA3C4] leading-7">
                Create a space where you can share your
                everyday moments, discover people you
                connect with, and have conversations that
                actually matter.
              </p>
            </div>

            <div className="relative mt-14 w-80 h-32">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#FF5C7C]/30" />

              <div className="absolute left-12 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#FFC145]/30" />

              <div className="absolute left-24 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#9D8DF1]/30" />

              <div className="absolute left-[112px] top-[25px] w-4 h-4 rounded-full bg-[#FF5C7C]" />

              <div className="absolute left-[175px] top-[10px] w-3 h-3 rounded-full bg-[#FFC145]" />

              <div className="absolute left-[220px] bottom-[14px] w-4 h-4 rounded-full bg-[#9D8DF1]" />

              <div className="absolute left-[55px] top-1/2 w-[145px] h-px bg-gradient-to-r from-[#FF5C7C]/30 via-[#FFC145]/30 to-[#9D8DF1]/30" />
            </div>
          </section>

          {/* SIGNUP CARD */}

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
                    text-[#FFC145]
                  "
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  Create account
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    sm:text-4xl
                    font-semibold
                  "
                  style={{
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                  }}
                >
                  Start your circle.
                </h2>

                <p className="mt-3 text-sm text-[#ABA3C4]">
                  Create an account and start connecting
                  with your people.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div className="mb-6 rounded-2xl border border-[#FF5C7C]/20 bg-[#FF5C7C]/[0.06] px-4 py-3">
                  <p className="text-sm text-[#FF8098]">
                    {error}
                  </p>
                </div>
              )}

              {/* FORM */}

              <form onSubmit={handleSignUp}>
                <FieldInput
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />

                <FieldInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                {/* PASSWORD */}

                <div className="mb-5">
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
                        setPassword(e.target.value)
                      }
                      placeholder="Create a password"
                      autoComplete="new-password"
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
                        setShowPassword(!showPassword)
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

                  <p className="mt-2 ml-1 text-[11px] text-[#6F6982]">
                    Use at least 6 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}

                <div className="mb-6">
                  <label className="block text-[#ABA3C4] mb-2 ml-1 text-sm font-medium">
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className={`
                        w-full
                        bg-[#262238]
                        border
                        ${
                          confirmPassword &&
                          password !== confirmPassword
                            ? "border-[#FF5C7C]/60"
                            : "border-white/5"
                        }
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
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
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
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </div>

                  {confirmPassword && (
                    <p
                      className={`mt-2 ml-1 text-[11px] ${
                        password === confirmPassword
                          ? "text-[#7FD6A7]"
                          : "text-[#FF5C7C]"
                      }`}
                    >
                      {password === confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* CREATE ACCOUNT */}

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

                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account

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

              {/* DIVIDER */}

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
                  already here?
                </span>

                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* LOGIN */}

              <div className="text-center">
                <p className="text-sm text-[#ABA3C4]">
                  Already have an account?
                </p>

                <Link
                  href="/login"
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
                  Log in

                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>

            <p
              className="
                text-center
                text-[10px]
                sm:text-xs
                text-[#ABA3C4]/40
                mt-6
                px-4
              "
              style={{
                fontFamily: "monospace",
              }}
            >
              By creating an account, you agree to the
              Circl community guidelines.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}