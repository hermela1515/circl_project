"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

// IMPORTANT: API_URL is the BACKEND BASE URL ONLY (no /api).
// We add /api inside the fetch call below.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email?token=${encodeURIComponent(
            token
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(
            data.message ||
              "This verification link is invalid or has expired."
          );
          return;
        }

        setStatus("success");
        setMessage(
          data.message ||
            "Your email has been verified successfully."
        );
      } catch (error) {
        console.error("Verification error:", error);

        setStatus("error");
        setMessage(
          "Unable to connect to the server. Please try again."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="min-h-screen bg-[#15121F] text-[#F5F1EA] flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        <div className="bg-[#1E1A2E] border border-white/5 rounded-[32px] p-8 sm:p-10 text-center shadow-2xl">

          {/* Logo */}

          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16 flex items-center justify-center">

              <div className="absolute inset-0 rounded-full border-2 border-[#FF5C7C]" />

              <div className="absolute inset-[6px] rounded-full border-2 border-[#FFC145]" />

              <div className="absolute inset-[12px] rounded-full border-2 border-[#9D8DF1]" />

              <span className="relative w-2 h-2 rounded-full bg-[#F5F1EA]" />

            </div>
          </div>

          {/* Loading */}

          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <FaSpinner className="text-4xl text-[#FFC145] animate-spin" />
              </div>

              <h1 className="text-3xl font-semibold">
                Verifying your email...
              </h1>

              <p className="mt-4 text-[#ABA3C4]">
                Please wait while we verify your email
                address.
              </p>
            </>
          )}

          {/* Success */}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <FaCheckCircle className="text-5xl text-[#7FD6A7]" />
              </div>

              <h1 className="text-3xl font-semibold">
                Email verified!
              </h1>

              <p className="mt-4 text-[#ABA3C4] leading-6">
                {message}
              </p>

              <Link
                href="/login"
                className="
                  inline-flex
                  items-center
                  justify-center
                  mt-8
                  w-full
                  h-12
                  rounded-full
                  bg-[#FF5C7C]
                  text-[#15121F]
                  font-semibold
                  hover:bg-[#FF4A6E]
                  transition
                "
              >
                Go to login
              </Link>
            </>
          )}

          {/* Error */}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <FaExclamationCircle className="text-5xl text-[#FF5C7C]" />
              </div>

              <h1 className="text-3xl font-semibold">
                Verification failed
              </h1>

              <p className="mt-4 text-[#ABA3C4] leading-6">
                {message}
              </p>

              <Link
                href="/signup"
                className="
                  inline-flex
                  items-center
                  justify-center
                  mt-8
                  w-full
                  h-12
                  rounded-full
                  bg-[#FF5C7C]
                  text-[#15121F]
                  font-semibold
                  hover:bg-[#FF4A6E]
                  transition
                "
              >
                Create another account
              </Link>

              <Link
                href="/login"
                className="
                  inline-block
                  mt-5
                  text-sm
                  text-[#ABA3C4]
                  hover:text-[#FF5C7C]
                  transition
                "
              >
                Back to login
              </Link>
            </>
          )}

        </div>

        <p className="text-center mt-6 text-xs text-[#ABA3C4]/40">
          Circl · Find your people. Build your circle.
        </p>

      </div>
    </main>
  );
}