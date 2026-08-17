
const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

/*
=========================================================
GET MY NOTIFICATIONS
=========================================================
*/

router.get(
  "/",
  protect,
  getNotifications
);

/*
=========================================================
MARK ALL AS READ

IMPORTANT:
This must come BEFORE /:id/read
=========================================================
*/

router.put(
  "/read-all",
  protect,
  markAllAsRead
);

/*
=========================================================
MARK ONE AS READ
=========================================================
*/

router.put(
  "/:id/read",
  protect,
  markAsRead
);

module.exports = router;

