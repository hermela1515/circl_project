
const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createPost,
  getPosts,
  likePost,
  addComment,
} = require("../controllers/postController");

const router = express.Router();

// =====================================================
// GET ALL POSTS
// PUBLIC
// =====================================================

router.get(
  "/",
  getPosts
);

// =====================================================
// CREATE POST
// AUTHENTICATION REQUIRED
// =====================================================

router.post(
  "/",
  protect,
  createPost
);

// =====================================================
// LIKE / UNLIKE POST
// AUTHENTICATION REQUIRED
// =====================================================

router.post(
  "/:id/like",
  protect,
  likePost
);

// =====================================================
// ADD COMMENT
// AUTHENTICATION REQUIRED
// =====================================================

router.post(
  "/:id/comments",
  protect,
  addComment
);

module.exports = router;

