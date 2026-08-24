const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createPost,
  getPosts,
  getUserPosts,
  getSinglePost,
  likePost,
  addComment,
} = require("../controllers/postController");

const router = express.Router();

// =====================================================
// GET ALL POSTS
// GET /api/posts
// PUBLIC
// =====================================================

router.get(
  "/",
  getPosts
);

// =====================================================
// GET POSTS BY USER
// GET /api/posts/user/:userId
// PUBLIC
// =====================================================

router.get(
  "/user/:userId",
  getUserPosts
);

// =====================================================
// GET SINGLE POST
// GET /api/posts/:id
// PUBLIC
// =====================================================

router.get(
  "/:id",
  getSinglePost
);

// =====================================================
// CREATE POST
// POST /api/posts
// AUTH REQUIRED
// =====================================================

router.post(
  "/",
  protect,
  createPost
);

// =====================================================
// LIKE / UNLIKE POST
// POST /api/posts/:id/like
// AUTH REQUIRED
// =====================================================

router.post(
  "/:id/like",
  protect,
  likePost
);

// =====================================================
// ADD COMMENT
// POST /api/posts/:id/comments
// AUTH REQUIRED
// =====================================================

router.post(
  "/:id/comments",
  protect,
  addComment
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;