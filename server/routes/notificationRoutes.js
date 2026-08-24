const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// =====================================================
// GET ALL NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get(
  "/",
  protect,
  getNotifications
);

// =====================================================
// MARK ONE AS READ
// PUT /api/notifications/:id/read
// =====================================================

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// =====================================================
// MARK ALL AS READ
// PUT /api/notifications/read-all
// =====================================================

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

module.exports = router;