const mongoose = require("mongoose");

// =========================================================
// CONVERSATION SCHEMA
// =========================================================
// A conversation represents a private chat between users.
//
// For the first version of Circl messaging, we will support
// one-to-one conversations.
//
// Example:
//
// User A  <---->  User B
//
// The participants array will contain both users.
// =========================================================

const conversationSchema = new mongoose.Schema(
  {
    // =====================================================
    // PARTICIPANTS
    // =====================================================
    // The users who belong to this conversation.
    //
    // For now, Circl messaging is one-to-one, so this
    // array will contain exactly two users.
    // =====================================================

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // =====================================================
    // LAST MESSAGE
    // =====================================================
    // Stores the latest message text so the conversations
    // sidebar can display a preview without loading every
    // message.
    // =====================================================

    lastMessage: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // LAST MESSAGE SENDER
    // =====================================================
    // Identifies who sent the latest message.
    // =====================================================

    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================================
    // LAST MESSAGE TIME
    // =====================================================

    lastMessageAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // CREATED AT
    // =====================================================
    // Automatically handled by timestamps below.
    // =====================================================
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEX
// =========================================================
// Helps MongoDB find conversations involving a particular
// user more efficiently.
//
// Example:
// Find all conversations where user A is a participant.
// =========================================================

conversationSchema.index({
  participants: 1,
});

// =========================================================
// EXPORT MODEL
// =========================================================

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);