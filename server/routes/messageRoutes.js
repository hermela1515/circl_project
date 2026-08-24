const express = require("express");
const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================================
// GET ALL CONVERSATIONS
// =========================================================
// GET /api/messages/conversations
//
// Returns all conversations belonging to the logged-in user.
//
// Authentication:
// Authorization: Bearer <token>
// =========================================================

router.get(
  "/conversations",
  protect,
  async (req, res) => {
    try {
      const conversations =
        await Conversation.find({
          participants: req.user._id,
        })
          .populate(
            "participants",
            "username profilePic bio"
          )
          .populate(
            "lastMessageSender",
            "username"
          )
          .sort({
            lastMessageAt: -1,
            updatedAt: -1,
          });

      return res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error(
        "Get conversations error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get conversations",
      });
    }
  }
);

// =========================================================
// GET MESSAGES FOR A CONVERSATION
// =========================================================
// GET /api/messages/conversations/:conversationId
//
// Returns messages belonging to a conversation.
//
// The logged-in user must be one of the participants.
// =========================================================

router.get(
  "/conversations/:conversationId",
  protect,
  async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      // ---------------------------------------------------
      // Validate MongoDB ID
      // ---------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      // ---------------------------------------------------
      // Find conversation
      // ---------------------------------------------------

      const conversation =
        await Conversation.findOne({
          _id: conversationId,
          participants: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      // ---------------------------------------------------
      // Get messages
      // ---------------------------------------------------

      const messages =
        await Message.find({
          conversation: conversationId,
        })
          .populate(
            "sender",
            "username profilePic"
          )
          .sort({
            createdAt: 1,
          });

      return res.status(200).json({
        success: true,
        conversation,
        messages,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get messages",
      });
    }
  }
);

// =========================================================
// SEND MESSAGE
// =========================================================
// POST /api/messages
//
// Body:
//
// {
//   "receiverId": "USER_ID",
//   "text": "Hello!"
// }
//
// IMPORTANT:
// We DO NOT accept senderId from the frontend.
//
// The sender is always:
// req.user._id
//
// This comes from the verified JWT.
// =========================================================

router.post(
  "/",
  protect,
  async (req, res) => {
    try {
      const {
        receiverId,
        text,
      } = req.body;

      // ---------------------------------------------------
      // Validate required fields
      // ---------------------------------------------------

      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message:
            "Receiver ID is required",
        });
      }

      if (
        !text ||
        typeof text !== "string" ||
        !text.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message text is required",
        });
      }

      // ---------------------------------------------------
      // Validate receiver ID
      // ---------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          receiverId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid receiver ID",
        });
      }

      // ---------------------------------------------------
      // Prevent messaging yourself
      // ---------------------------------------------------

      if (
        req.user._id.toString() ===
        receiverId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot send a message to yourself",
        });
      }

      // ---------------------------------------------------
      // Check receiver exists
      // ---------------------------------------------------

      const receiver =
        await User.findById(receiverId).select(
          "username profilePic bio"
        );

      if (!receiver) {
        return res.status(404).json({
          success: false,
          message:
            "Receiver not found",
        });
      }

      // ---------------------------------------------------
      // Find existing conversation
      // ---------------------------------------------------
      // We look for a conversation containing BOTH users.
      //
      // This prevents creating a new conversation every
      // time the users send a message.
      // ---------------------------------------------------

      let conversation =
        await Conversation.findOne({
          participants: {
            $all: [
              req.user._id,
              receiverId,
            ],
          },
        });

      // ---------------------------------------------------
      // Create conversation if it doesn't exist
      // ---------------------------------------------------

      if (!conversation) {
        conversation =
          await Conversation.create({
            participants: [
              req.user._id,
              receiverId,
            ],
          });
      }

      // ---------------------------------------------------
      // Create message
      // ---------------------------------------------------

      const message =
        await Message.create({
          conversation:
            conversation._id,

          sender:
            req.user._id,

          text: text.trim(),

          isRead: false,

          readAt: null,
        });

      // ---------------------------------------------------
      // Update conversation preview
      // ---------------------------------------------------

      conversation.lastMessage =
        text.trim();

      conversation.lastMessageSender =
        req.user._id;

      conversation.lastMessageAt =
        message.createdAt;

      await conversation.save();

      // ---------------------------------------------------
      // Populate message sender
      // ---------------------------------------------------

      await message.populate(
        "sender",
        "username profilePic"
      );

      // ---------------------------------------------------
      // Populate conversation users
      // ---------------------------------------------------

      await conversation.populate(
        "participants",
        "username profilePic bio"
      );

      // ---------------------------------------------------
      // Response
      // ---------------------------------------------------

      return res.status(201).json({
        success: true,
        message,
        conversation,
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send message",
      });
    }
  }
);

// =========================================================
// MARK CONVERSATION MESSAGES AS READ
// =========================================================
// PATCH /api/messages/conversations/:conversationId/read
//
// Marks messages sent by OTHER users as read.
//
// We intentionally do NOT mark the current user's own
// messages as read.
// =========================================================

router.patch(
  "/conversations/:conversationId/read",
  protect,
  async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      // ---------------------------------------------------
      // Validate conversation ID
      // ---------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      // ---------------------------------------------------
      // Verify user belongs to conversation
      // ---------------------------------------------------

      const conversation =
        await Conversation.findOne({
          _id: conversationId,
          participants: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      // ---------------------------------------------------
      // Mark unread messages as read
      // ---------------------------------------------------

      const result =
        await Message.updateMany(
          {
            conversation:
              conversationId,

            sender: {
              $ne: req.user._id,
            },

            isRead: false,
          },
          {
            $set: {
              isRead: true,
              readAt: new Date(),
            },
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Messages marked as read",

        updatedCount:
          result.modifiedCount,
      });
    } catch (error) {
      console.error(
        "Mark messages as read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark messages as read",
      });
    }
  }
);

// =========================================================
// CLEAR CONVERSATION
// =========================================================
// DELETE /api/messages/conversations/:conversationId
//
// Deletes all messages in the conversation.
//
// IMPORTANT:
// For now this clears the messages but keeps the
// conversation itself.
//
// This matches the "Clear conversation" behavior in your
// current frontend.
// =========================================================

router.delete(
  "/conversations/:conversationId",
  protect,
  async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      // ---------------------------------------------------
      // Validate conversation ID
      // ---------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      // ---------------------------------------------------
      // Verify user belongs to conversation
      // ---------------------------------------------------

      const conversation =
        await Conversation.findOne({
          _id: conversationId,
          participants: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      // ---------------------------------------------------
      // Delete messages
      // ---------------------------------------------------

      await Message.deleteMany({
        conversation:
          conversationId,
      });

      // ---------------------------------------------------
      // Reset conversation preview
      // ---------------------------------------------------

      conversation.lastMessage = "";

      conversation.lastMessageSender =
        null;

      conversation.lastMessageAt =
        null;

      await conversation.save();

      return res.status(200).json({
        success: true,
        message:
          "Conversation cleared",
      });
    } catch (error) {
      console.error(
        "Clear conversation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to clear conversation",
      });
    }
  }
);

// =========================================================
// GET ONE USER
// =========================================================
// GET /api/messages/user/:userId
//
// This will be useful later when the frontend allows
// someone to search for a user and start a new conversation.
// =========================================================

router.get(
  "/user/:userId",
  protect,
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      // ---------------------------------------------------
      // Validate user ID
      // ---------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }

      // ---------------------------------------------------
      // Find user
      // ---------------------------------------------------

      const user =
        await User.findById(userId).select(
          "username profilePic bio"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "Get messaging user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get user",
      });
    }
  }
);

// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;