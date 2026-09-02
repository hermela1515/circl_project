"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import {
  FaArrowLeft,
  FaImage,
  FaTimes,
  FaMapMarkerAlt,
  FaSpinner,
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

/* =========================================================
   API
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const WORLD = [
  { country: "Ethiopia", flag: "🇪🇹" },
  { country: "Japan", flag: "🇯🇵" },
  { country: "Nigeria", flag: "🇳🇬" },
  { country: "Germany", flag: "🇩🇪" },
  { country: "India", flag: "🇮🇳" },
  { country: "Canada", flag: "🇨🇦" },
  { country: "Brazil", flag: "🇧🇷" },
  { country: "South Korea", flag: "🇰🇷" },
];

const MAX_LENGTH = 280;

export default function PostPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isLocationOpen, setIsLocationOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  /*
  ============================================================
  CURRENT USER
  ============================================================
  */

  const getCurrentUser = () => {
    if (typeof window === "undefined") {
      return {
        username: "You",
        profilePic:
          "/images/default-profile.jpg",
      };
    }

    try {
      const savedUser =
        localStorage.getItem("currentUser");

      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error(
        "Failed to read current user:",
        error
      );
    }

    return {
      username: "You",
      profilePic:
        "/images/default-profile.jpg",
    };
  };

  const currentUser = getCurrentUser();

  /*
  ============================================================
  IMAGE READER
  ============================================================
  */

  const readImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    /*
      Limit image size.

      Base64 images become larger when sent to the
      server, so keep this reasonably small for now.

      Later Cloudinary will solve this properly.
    */
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image is too large. Please choose an image under 5MB."
      );
      return;
    }

    setError("");

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.onerror = () => {
      setError(
        "Failed to read the image."
      );
    };

    reader.readAsDataURL(file);
  };

  /*
  ============================================================
  IMAGE SELECT
  ============================================================
  */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      readImage(file);
    }
  };

  /*
  ============================================================
  DRAG & DROP
  ============================================================
  */

  const handleDrop = (e) => {
    e.preventDefault();

    setIsDragging(false);

    const file =
      e.dataTransfer.files?.[0];

    if (file) {
      readImage(file);
    }
  };

  /*
  ============================================================
  SUBMIT POST
  ============================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /*
    ----------------------------------------------------------
    VALIDATION
    ----------------------------------------------------------
    */

    if (!image) {
      setError(
        "Please add an image before sharing your post."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Please write something before sharing your post."
      );
      return;
    }

    /*
    ----------------------------------------------------------
    GET TOKEN
    ----------------------------------------------------------
    */

    const token =
      localStorage.getItem("token");

    console.log(
      "Token exists:",
      !!token
    );

    if (!token) {
      setError(
        "You must be logged in before creating a post."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);

      return;
    }

    /*
    ----------------------------------------------------------
    START SUBMITTING
    ----------------------------------------------------------
    */

    setIsSubmitting(true);

    try {
      /*
      --------------------------------------------------------
      CREATE POST
      --------------------------------------------------------
      */

      const response = await fetch(
  `${API_URL}/api/posts`,
  {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: description
              .trim()
              .slice(0, 60),

            description:
              description.trim(),

            image: image,

            country:
              location?.country || "",

            flag:
              location?.flag || "",
          }),
        }
      );

      /*
      --------------------------------------------------------
      READ SERVER RESPONSE
      --------------------------------------------------------
      */

      const data =
        await response.json();

      console.log(
        "CREATE POST RESPONSE:",
        data
      );

      /*
      --------------------------------------------------------
      HANDLE ERROR
      --------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create post."
        );
      }

      /*
      --------------------------------------------------------
      SUCCESS
      --------------------------------------------------------
      */

      console.log(
        "Post created:",
        data.post
      );

      /*
        The post is now stored in MongoDB.

        We don't need localStorage anymore.
      */

      router.push("/feed");

      /*
        Refresh the feed after navigation.
      */

      router.refresh();

    } catch (error) {
      console.error(
        "CREATE POST ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while creating your post."
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  ============================================================
  REMOVE IMAGE
  ============================================================
  */

  const removeImage = () => {
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  ============================================================
  CHARACTERS
  ============================================================
  */

  const charsLeft =
    MAX_LENGTH -
    description.length;

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main
      className={`
        ${fraunces.variable}
        ${inter.variable}
        ${mono.variable}

        [font-family:var(--font-body)]

        min-h-screen
        w-full

        bg-[#15121F]

        relative
        overflow-hidden

        flex
        items-center
        justify-center

        p-4
      `}
    >
      {/* ======================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full border border-[#FF5C7C]" />

        <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full border border-[#9D8DF1]" />

        <div className="absolute top-1/2 right-1/4 w-[280px] h-[280px] rounded-full border border-[#FFC145]" />
      </div>

      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => router.back()}
        className="
          fixed
          top-4
          left-4
          z-20

          bg-[#1E1A2E]/80
          hover:bg-[#262238]

          border
          border-white/5

          text-[#F5F1EA]

          p-2.5
          sm:p-3

          rounded-full

          transition-all
          duration-200

          hover:scale-105

          backdrop-blur-sm
        "
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* ======================================================
          POST FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          relative
          z-10

          w-full
          max-w-md
          sm:max-w-lg

          bg-[#1E1A2E]

          border
          border-white/5

          rounded-3xl

          shadow-2xl

          p-5
          sm:p-7
        "
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h1
              className="
                [font-family:var(--font-display)]

                text-2xl
                sm:text-3xl

                font-semibold

                text-[#F5F1EA]
              "
            >
              New post
            </h1>

            <p
              className="
                [font-family:var(--font-mono)]

                text-[10px]

                text-[#ABA3C4]

                mt-1
              "
            >
              Share something with your Circl
            </p>
          </div>

          {/* USER AVATAR */}

          <div
            className="
              rounded-full
              p-[2px]

              bg-gradient-to-br
              from-[#FF5C7C]
              via-[#FFC145]
              to-[#9D8DF1]

              w-10
              h-10
              sm:w-11
              sm:h-11
            "
          >
            <img
              src={
                currentUser.profilePic ||
                "/images/default-profile.jpg"
              }
              alt={
                currentUser.username ||
                "User"
              }
              className="
                rounded-full
                object-cover

                w-full
                h-full

                border-2
                border-[#1E1A2E]
              "
            />
          </div>
        </div>

        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (
          <div
            className="
              mb-4

              rounded-2xl

              border
              border-[#FF5C7C]/30

              bg-[#FF5C7C]/10

              px-4
              py-3
            "
          >
            <p className="text-sm text-[#FF8CA3]">
              {error}
            </p>
          </div>
        )}

        {/* ====================================================
            IMAGE UPLOAD
        ==================================================== */}

        {!image ? (
          <div
            onClick={() =>
              fileInputRef.current?.click()
            }

            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}

            onDragLeave={() =>
              setIsDragging(false)
            }

            onDrop={handleDrop}

            className={`
              cursor-pointer

              flex
              flex-col
              items-center
              justify-center

              gap-3

              h-48
              sm:h-56

              rounded-2xl

              border-2
              border-dashed

              transition-colors

              ${
                isDragging
                  ? "border-[#FF5C7C] bg-[#FF5C7C]/5"
                  : "border-white/10 hover:border-white/25 bg-[#262238]"
              }
            `}
          >
            <span
              className="
                w-11
                h-11

                rounded-full

                bg-[#1E1A2E]

                flex
                items-center
                justify-center

                text-[#FF5C7C]

                text-lg
              "
            >
              <FaImage />
            </span>

            <p className="text-sm text-[#F5F1EA] font-medium">
              Drop an image, or click to browse
            </p>

            <p className="text-xs text-[#ABA3C4]">
              PNG, JPG or JPEG · Max 5MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        ) : (
          <div
            className="
              relative

              rounded-2xl

              overflow-hidden

              h-48
              sm:h-56
            "
          >
            <img
              src={image}
              alt="Preview"
              className="
                absolute
                inset-0

                w-full
                h-full

                object-cover
              "
            />

            {/* IMAGE OVERLAY */}

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* REMOVE BUTTON */}

            <button
              type="button"
              onClick={removeImage}
              className="
                absolute

                top-2.5
                right-2.5

                bg-[#15121F]/80
                hover:bg-[#15121F]

                text-[#F5F1EA]

                w-8
                h-8

                rounded-full

                flex
                items-center
                justify-center

                backdrop-blur-sm

                transition

                hover:scale-105
              "
              title="Remove image"
            >
              <FaTimes className="text-xs" />
            </button>

            {/* CHANGE IMAGE */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                absolute

                bottom-3
                left-3

                bg-[#15121F]/80
                hover:bg-[#15121F]

                text-[#F5F1EA]

                text-xs

                px-3
                py-1.5

                rounded-full

                backdrop-blur-sm

                transition
              "
            >
              Change image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        )}

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <div className="mt-4 sm:mt-5">
          <textarea
            placeholder="Share something with your circle…"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value.slice(
                  0,
                  MAX_LENGTH
                )
              )
            }
            rows={4}
            disabled={isSubmitting}
            className="
              w-full

              bg-[#262238]

              border
              border-white/5

              rounded-2xl

              p-3.5

              text-sm
              sm:text-base

              text-[#F5F1EA]

              placeholder:text-[#ABA3C4]

              focus:outline-none

              focus:ring-2
              focus:ring-[#FF5C7C]/50

              resize-none

              transition

              disabled:opacity-50
            "
          />

          <div className="flex justify-end mt-1">
            <span
              className={`
                [font-family:var(--font-mono)]

                text-[10px]

                ${
                  charsLeft < 20
                    ? "text-[#FF5C7C]"
                    : "text-[#ABA3C4]"
                }
              `}
            >
              {charsLeft} left
            </span>
          </div>
        </div>

        {/* ====================================================
            LOCATION
        ==================================================== */}

        <div className="mt-3 relative">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              setIsLocationOpen(
                (value) => !value
              )
            }
            className="
              flex
              items-center
              gap-2

              text-xs
              sm:text-sm

              text-[#ABA3C4]

              hover:text-[#F5F1EA]

              transition
            "
          >
            <FaMapMarkerAlt className="text-[#9D8DF1]" />

            {location ? (
              <span className="text-[#F5F1EA]">
                {location.flag}{" "}
                {location.country}
              </span>
            ) : (
              "Add your location"
            )}

            {location && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(null);
                }}
                className="
                  text-[#ABA3C4]
                  hover:text-[#FF5C7C]
                  ml-1
                "
              >
                <FaTimes className="text-[10px]" />
              </span>
            )}
          </button>

          {isLocationOpen && (
            <div
              className="
                absolute
                z-20

                mt-2

                w-full

                max-h-48

                overflow-y-auto

                bg-[#262238]

                border
                border-white/10

                rounded-2xl

                p-2

                shadow-xl
              "
            >
              {WORLD.map((loc) => (
                <button
                  key={loc.country}
                  type="button"
                  onClick={() => {
                    setLocation(loc);
                    setIsLocationOpen(false);
                  }}
                  className="
                    w-full

                    flex
                    items-center
                    gap-2

                    text-left

                    text-sm
                    text-[#F5F1EA]

                    hover:bg-[#2E2A42]

                    rounded-xl

                    px-3
                    py-2

                    transition
                  "
                >
                  <span>{loc.flag}</span>

                  {loc.country}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================
            SUBMIT BUTTON
        ==================================================== */}

        <button
          type="submit"
          disabled={
            !image ||
            !description.trim() ||
            isSubmitting
          }
          className="
            w-full

            mt-5
            sm:mt-6

            py-3
            sm:py-3.5

            rounded-full

            bg-[#FF5C7C]

            hover:bg-[#FF4A6E]

            disabled:bg-[#262238]

            disabled:text-[#ABA3C4]

            disabled:cursor-not-allowed

            text-[#15121F]

            font-semibold

            text-sm
            sm:text-base

            shadow-lg
            shadow-[#FF5C7C]/20

            disabled:shadow-none

            transition-all
            duration-300

            flex
            items-center
            justify-center
            gap-2
          "
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />

              Sharing...
            </>
          ) : (
            "Share to your Circl"
          )}
        </button>

        {/* ====================================================
            INFO
        ==================================================== */}

        <p
          className="
            text-center

            text-[10px]

            text-[#ABA3C4]

            [font-family:var(--font-mono)]

            mt-3
          "
        >
          Your post will be shared with your Circl
        </p>
      </form>
    </main>
  );
}