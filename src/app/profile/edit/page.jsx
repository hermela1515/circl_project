"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaUser,
  FaCamera,
  FaTimes,
} from "react-icons/fa";

/* =========================================================
   FONTS
========================================================= */

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
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

/* =========================================================
   TOKEN
========================================================= */

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(image) {
  if (!image) {
    return "/images/default-avatar.png";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return `${API_URL}/${image}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function EditProfilePage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [profilePic, setProfilePic] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  /* =======================================================
     LOAD CURRENT USER
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("currentUser");

            router.push("/login");
            return;
          }

          throw new Error(
            data?.message ||
              "Failed to load your profile."
          );
        }

        const currentUser =
          data?.user ||
          data?.profile ||
          data?.data;

        if (!currentUser) {
          throw new Error(
            "Could not find your profile."
          );
        }

        if (cancelled) {
          return;
        }

        setUser(currentUser);

        setUsername(
          currentUser.username ||
            currentUser.name ||
            ""
        );

        setBio(
          currentUser.bio ||
            ""
        );

        setProfilePic(
          currentUser.profilePic ||
            currentUser.profilePicture ||
            ""
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load edit profile error:",
          error
        );

        setError(
          error?.message ||
            "Failed to load your profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =======================================================
     CHOOSE PROFILE PHOTO
  ======================================================= */

  const handleProfilePhotoClick = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  /* =======================================================
     HANDLE FILE SELECT
  ======================================================= */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    /* -----------------------------------------------
       Validate file type
    ----------------------------------------------- */

    if (!file.type.startsWith("image/")) {
      setError(
        "Please choose an image file."
      );

      event.target.value = "";
      return;
    }

    /* -----------------------------------------------
       Validate file size
       Maximum: 5MB
    ----------------------------------------------- */

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile picture must be smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    /* -----------------------------------------------
       Save selected file
    ----------------------------------------------- */

    setSelectedFile(file);

    /* -----------------------------------------------
       Create temporary preview
    ----------------------------------------------- */

    const previewUrl =
      URL.createObjectURL(file);

    setProfilePic(previewUrl);
  };

  /* =======================================================
     REMOVE SELECTED PHOTO
  ======================================================= */

  const handleRemovePhoto = () => {
    setSelectedFile(null);

    setProfilePic(
      user?.profilePic ||
        user?.profilePicture ||
        ""
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    const cleanUsername =
      username.trim();

    const cleanBio =
      bio.trim();

    if (!cleanUsername) {
      setError(
        "Username cannot be empty."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /* =================================================
         FORM DATA

         We use FormData because a profile image
         is now being uploaded as a file.
      ================================================= */

      const formData = new FormData();

      formData.append(
        "username",
        cleanUsername
      );

      formData.append(
        "bio",
        cleanBio
      );

      /* -----------------------------------------------
         Add profile image only when user selected one
      ----------------------------------------------- */

      if (selectedFile) {
        formData.append(
          "profilePic",
          selectedFile
        );
      }

      const response = await fetch(
        `${API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data =
        await response.json();

      console.log(
        "Update profile response:",
        data
      );

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "authToken"
          );

          localStorage.removeItem(
            "accessToken"
          );

          localStorage.removeItem(
            "currentUser"
          );

          router.push("/login");

          return;
        }

        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update profile."
        );
      }

      /* =================================================
         GET UPDATED USER
      ================================================= */

      const updatedUser =
        data?.user ||
        data?.profile ||
        data?.data;

      const finalUser =
        updatedUser || {
          ...(user || {}),

          username:
            cleanUsername,

          bio:
            cleanBio,

          profilePic:
            profilePic,
        };

      /* =================================================
         UPDATE STATE
      ================================================= */

      setUser(finalUser);

      setUsername(
        finalUser.username ||
          cleanUsername
      );

      setBio(
        finalUser.bio ||
          cleanBio
      );

      setProfilePic(
        finalUser.profilePic ||
          finalUser.profilePicture ||
          profilePic ||
          ""
      );

      setSelectedFile(null);

      /* =================================================
         UPDATE LOCAL STORAGE
      ================================================= */

      localStorage.setItem(
        "currentUser",
        JSON.stringify(
          finalUser
        )
      );

      setSuccess(
        "Profile updated successfully."
      );

      /* =================================================
         RETURN TO PROFILE
      ================================================= */

      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        className={`
          ${fraunces.variable}
          ${inter.variable}
          ${mono.variable}
          [font-family:var(--font-body)]
          min-h-screen
          bg-[#15121F]
          text-[#F5F1EA]
          flex
          items-center
          justify-center
        `}
      >
        <div className="text-center">
          <FaSpinner className="text-[#9D8DF1] text-2xl mx-auto mb-3 animate-spin" />

          <p className="[font-family:var(--font-mono)] text-xs text-[#ABA3C4]">
            loading profile…
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

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
        text-[#F5F1EA]
        relative
        overflow-hidden
      `}
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full border border-[#9D8DF1]" />

        <div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full border border-[#FF5C7C]" />
      </div>

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => router.back()}
        className="
          fixed
          top-4
          left-4
          z-30
          bg-[#1E1A2E]/90
          hover:bg-[#262238]
          border
          border-white/5
          text-[#F5F1EA]
          p-2.5
          sm:p-3
          rounded-full
          transition
          hover:scale-105
          backdrop-blur-sm
        "
        title="Go back"
      >
        <FaArrowLeft className="text-sm sm:text-base" />
      </button>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* HEADER */}

        <div className="mb-6">
          <p className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[#9D8DF1]">
            Circl profile
          </p>

          <h1 className="[font-family:var(--font-display)] text-3xl sm:text-4xl font-semibold mt-1">
            Edit profile
          </h1>

          <p className="text-sm text-[#ABA3C4] mt-2">
            Update your profile information.
          </p>
        </div>

        {/* ===================================================
            FORM CARD
        =================================================== */}

        <form
          onSubmit={handleSave}
          className="bg-[#1E1A2E] border border-white/5 rounded-[28px] p-5 sm:p-7"
        >

          {/* =================================================
              PROFILE PHOTO
          ================================================= */}

          <div className="flex flex-col items-center mb-8">

            {/* Hidden file input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Clickable profile circle */}

            <div className="relative">

              <button
                type="button"
                onClick={handleProfilePhotoClick}
                disabled={saving}
                className="
                  group
                  relative
                  w-28
                  h-28
                  rounded-full
                  p-[3px]
                  bg-gradient-to-br
                  from-[#FF5C7C]
                  via-[#FFC145]
                  to-[#9D8DF1]
                  transition
                  hover:scale-105
                  disabled:opacity-60
                "
                title="Choose profile photo"
              >

                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#15121F]">

                  <Image
                    src={getImageUrl(profilePic)}
                    alt={
                      username ||
                      "Profile"
                    }
                    width={112}
                    height={112}
                    unoptimized
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                  {/* Camera overlay */}

                  <div
                    className="
                      absolute
                      inset-0
                      rounded-full
                      bg-black/50
                      opacity-0
                      group-hover:opacity-100
                      transition
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <div className="flex flex-col items-center gap-1">
                      <FaCamera className="text-white text-lg" />

                      <span className="text-[9px] text-white font-medium">
                        Change
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Camera badge */}

              <div
                className="
                  absolute
                  bottom-1
                  right-1
                  w-8
                  h-8
                  rounded-full
                  bg-[#FF5C7C]
                  border-4
                  border-[#1E1A2E]
                  flex
                  items-center
                  justify-center
                  pointer-events-none
                "
              >
                <FaCamera className="text-[#15121F] text-xs" />
              </div>

            </div>

            {/* Remove selected photo */}

            {selectedFile && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="
                  mt-3
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-[#FF8DA3]
                  hover:text-[#FF5C7C]
                  transition
                "
              >
                <FaTimes />

                Remove selected photo
              </button>
            )}

            <div className="flex items-center gap-2 mt-4 text-[#9D8DF1]">
              <FaUser className="text-xs" />

              <span className="[font-family:var(--font-mono)] text-[9px] uppercase tracking-wider">
                Profile information
              </span>
            </div>

            <p className="text-[10px] text-[#77718C] mt-2 text-center">
              Click your profile photo to choose a new picture.
              <br />
              Maximum size: 5MB.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl bg-[#FF5C7C]/10 border border-[#FF5C7C]/20 text-sm text-[#FF8DA3]">
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="mb-5 px-4 py-3 rounded-2xl bg-[#52D273]/10 border border-[#52D273]/20 text-sm text-[#72E18D]">
              {success}
            </div>
          )}

          {/* =================================================
              USERNAME
          ================================================= */}

          <div className="mb-5">

            <label className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-wider text-[#ABA3C4]">
              Username
            </label>

            <div className="relative mt-2">

              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77718C] text-xs" />

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="Your username"
                className="
                  w-full
                  bg-[#15121F]
                  border
                  border-white/5
                  rounded-2xl
                  py-3.5
                  pl-10
                  pr-4
                  text-sm
                  text-[#F5F1EA]
                  placeholder:text-[#77718C]
                  focus:outline-none
                  focus:border-[#9D8DF1]/50
                  focus:ring-2
                  focus:ring-[#9D8DF1]/10
                  transition
                "
              />

            </div>
          </div>

          {/* =================================================
              BIO
          ================================================= */}

          <div className="mb-7">

            <label className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-wider text-[#ABA3C4]">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(event) =>
                setBio(
                  event.target.value
                )
              }
              rows={5}
              maxLength={500}
              placeholder="Tell people a little about yourself..."
              className="
                mt-2
                w-full
                resize-none
                bg-[#15121F]
                border
                border-white/5
                rounded-2xl
                py-3.5
                px-4
                text-sm
                text-[#F5F1EA]
                placeholder:text-[#77718C]
                focus:outline-none
                focus:border-[#9D8DF1]/50
                focus:ring-2
                focus:ring-[#9D8DF1]/10
                transition
              "
            />

            <div className="flex justify-end mt-1">
              <span className="text-[9px] text-[#77718C]">
                {bio.length}/500
              </span>
            </div>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex flex-col sm:flex-row gap-3">

            {/* CANCEL */}

            <button
              type="button"
              onClick={() =>
                router.push("/profile")
              }
              disabled={saving}
              className="
                flex-1
                py-3.5
                rounded-2xl
                bg-[#262238]
                hover:bg-[#302A46]
                border
                border-white/5
                text-[#D6D0E4]
                text-sm
                font-medium
                transition
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              className="
                flex-1
                py-3.5
                rounded-2xl
                bg-[#FF5C7C]
                hover:bg-[#FF4A6E]
                text-[#15121F]
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                transition
                hover:scale-[1.01]
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save changes
                </>
              )}

            </button>

          </div>

        </form>
      </div>
    </main>
  );
}