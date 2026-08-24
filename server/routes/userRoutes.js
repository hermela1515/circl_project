const express = require("express");

const protect = require("../middleware/authMiddleware");

const uploadProfilePicture = require("../middleware/uploadMiddleware");

const {
  getMe,
  updateProfile,
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
} = require("../controllers/userController");

const router = express.Router();

/* =====================================================
   CURRENT USER
===================================================== */

// GET /api/users/me

router.get(
  "/me",
  protect,
  getMe
);

// PUT /api/users/me
//
// uploadProfilePicture.single("profilePic")
// looks for:
//
// profilePic = selected image file

router.put(
  "/me",
  protect,
  uploadProfilePicture.single("profilePic"),
  updateProfile
);

/* =====================================================
   FOLLOW / UNFOLLOW
===================================================== */

// POST /api/users/:id/follow

router.post(
  "/:id/follow",
  protect,
  toggleFollow
);

/* =====================================================
   FOLLOWERS
===================================================== */

// GET /api/users/:id/followers

router.get(
  "/:id/followers",
  protect,
  getFollowers
);

/* =====================================================
   FOLLOWING
===================================================== */

// GET /api/users/:id/following

router.get(
  "/:id/following",
  protect,
  getFollowing
);

/* =====================================================
   PUBLIC USER PROFILE
===================================================== */

// GET /api/users/:id

router.get(
  "/:id",
  protect,
  getUserProfile
);

module.exports = router;