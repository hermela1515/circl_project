const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getMe,
  updateProfile,
  getUserProfile,
} = require("../controllers/userController");

const router = express.Router();

/* =========================================================
   CURRENT USER
========================================================= */

// GET /api/users/me
router.get("/me", protect, getMe);

// PUT /api/users/me
router.put("/me", protect, updateProfile);

/* =========================================================
   PUBLIC USER PROFILE
========================================================= */

// GET /api/users/:id
router.get("/:id", getUserProfile);

module.exports = router;