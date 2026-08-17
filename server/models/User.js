const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // USERNAME
    // ==========================================
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    // ==========================================
    // EMAIL
    // Required during registration
    // Used for email verification
    // NOT used for login
    // ==========================================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // PASSWORD
    // Stored as a bcrypt hash
    // ==========================================
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ==========================================
    // EMAIL VERIFICATION
    // ==========================================
    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // ==========================================
    // PROFILE
    // ==========================================
    profilePic: {
      type: String,
      default: "/images/default-avatar.png",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 160,
    },

    // ==========================================
    // SOCIAL CONNECTIONS
    // ==========================================
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);