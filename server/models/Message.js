const mongoose = require("mongoose");

// =========================================================
// MESSAGE SCHEMA
// =========================================================
// Each document represents ONE message sent inside a
// conversation.
//
// Example:
//
// Hermela → "Hey Alice!"
//
// The message stores:
// - Which conversation it belongs to
// - Who sent it
// - The message text
// - Whether it has been read
// - When it was created
// =========================================================

const messageSchema = new mongoose.Schema(
  {
    // =====================================================
    // CONVERSATION
    // =====================================================
    // Connects this message to a Conversation document.
    // =====================================================

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    // =====================================================
    // SENDER
    // =====================================================
    // We NEVER take the sender ID from the frontend.
    //
    // The messaging route will use:
    //
    // req.user._id
    //
    // from your existing authentication middleware.
    // =====================================================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // TEXT
    // =====================================================
    // The actual message content.
    // =====================================================

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // =====================================================
    // READ STATUS
    // =====================================================
    // false = message has not been read yet
    // true  = recipient has read the message
    // =====================================================

    isRead: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // READ AT
    // =====================================================
    // Stores the exact time the message was read.
    // Remains null until the recipient reads it.
    // =====================================================

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEXES
// =========================================================
// This helps MongoDB quickly retrieve messages belonging
// to a conversation in chronological order.
//
// Example:
//
// "Give me all messages from conversation ABC,
// newest messages first."
// =========================================================

messageSchema.index({
  conversation: 1,
  createdAt: 1,
});

// =========================================================
// EXPORT MODEL
// =========================================================

module.exports = mongoose.model(
  "Message",
  messageSchema
);