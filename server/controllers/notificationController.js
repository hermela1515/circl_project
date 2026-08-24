const Notification = require("../models/Notification");

// =====================================================
// GET NOTIFICATIONS
// GET /api/notifications
// =====================================================

const getNotifications = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const notifications =
      await Notification.find({
        recipient: userId,
      })
        .populate(
          "actor",
          "username name email profilePic"
        )
        .populate(
          "post",
          "title image"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// =====================================================

const markNotificationAsRead =
  async (req, res) => {
    try {
      const userId =
        req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: req.params.id,
            recipient: userId,
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

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark notification as read",
        error: error.message,
      });
    }
  };

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
// =====================================================

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      const userId =
        req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      await Notification.updateMany(
        {
          recipient: userId,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark all notifications as read",
        error: error.message,
      });
    }
  };

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};