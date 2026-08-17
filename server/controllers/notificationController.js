
const Notification = require("../models/Notification");

/*
=========================================================
GET MY NOTIFICATIONS
GET /api/notifications
=========================================================
*/

const getNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user._id,
      })
        .populate(
          "actor",
          "username profilePic"
        )
        .populate(
          "post",
          "title content image"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load notifications",
    });
  }
};

/*
=========================================================
MARK ONE NOTIFICATION AS READ
PUT /api/notifications/:id/read
=========================================================
*/

const markAsRead = async (req, res) => {
  try {
    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          recipient: req.user._id,
        },
        {
          read: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
    });
  }
};

/*
=========================================================
MARK ALL NOTIFICATIONS AS READ
PUT /api/notifications/read-all
=========================================================
*/

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      {
        read: true,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to mark notifications as read",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

