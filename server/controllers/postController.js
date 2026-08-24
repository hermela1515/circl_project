const mongoose = require("mongoose");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// =====================================================
// HELPER
// =====================================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// =====================================================
// CREATE POST
// POST /api/posts
// AUTH REQUIRED
// =====================================================

const createPost = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      description,
      image,
      country,
      flag,
    } = req.body;

    // -------------------------------------------------
    // VALIDATE TITLE
    // -------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post title is required",
      });
    }

    // -------------------------------------------------
    // CREATE POST
    // -------------------------------------------------

    const post = await Post.create({
      author: userId,
      title: title.trim(),
      description: description?.trim() || "",
      image: image || "",
      country: country || "",
      flag: flag || "",
      likes: [],
      comments: [],
    });

    // -------------------------------------------------
    // POPULATE AUTHOR AND COMMENTS
    // -------------------------------------------------

    const populatedPost = await Post.findById(post._id)
      .populate(
        "author",
        "username name email profilePic"
      )
      .populate(
        "comments.user",
        "username name profilePic"
      );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL POSTS
// GET /api/posts
// PUBLIC
// =====================================================

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "username name email profilePic"
      )
      .populate(
        "comments.user",
        "username name profilePic"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

// =====================================================
// GET POSTS BY USER
// GET /api/posts/user/:userId
// PUBLIC
// =====================================================

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // -------------------------------------------------
    // VALIDATE USER ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // -------------------------------------------------
    // FIND USER'S POSTS
    // -------------------------------------------------

    const posts = await Post.find({
      author: userId,
    })
      .populate(
        "author",
        "username name email profilePic"
      )
      .populate(
        "comments.user",
        "username name profilePic"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("GET USER POSTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE POST
// GET /api/posts/:id
// PUBLIC
// =====================================================

const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE POST ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // -------------------------------------------------
    // FIND POST
    // -------------------------------------------------

    const post = await Post.findById(id)
      .populate(
        "author",
        "username name email profilePic"
      )
      .populate(
        "comments.user",
        "username name profilePic"
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("GET SINGLE POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch post",
      error: error.message,
    });
  }
};

// =====================================================
// LIKE / UNLIKE POST
// POST /api/posts/:id/like
// AUTH REQUIRED
// =====================================================

const likePost = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const postId = req.params.id;

    // -------------------------------------------------
    // VALIDATE POST ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // -------------------------------------------------
    // FIND POST
    // -------------------------------------------------

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // -------------------------------------------------
    // CHECK WHETHER ALREADY LIKED
    // -------------------------------------------------

    const alreadyLiked = post.likes.some(
      (id) =>
        id.toString() === userId.toString()
    );

    // =================================================
    // UNLIKE
    // =================================================

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) =>
          id.toString() !== userId.toString()
      );

      await post.save();

      // -------------------------------------------------
      // REMOVE LIKE NOTIFICATION
      // -------------------------------------------------

      await Notification.deleteOne({
        recipient: post.author,
        actor: userId,
        type: "like",
        post: post._id,
      });

      return res.status(200).json({
        success: true,
        liked: false,
        likesCount: post.likes.length,
        message: "Post unliked",
      });
    }

    // =================================================
    // LIKE
    // =================================================

    post.likes.push(userId);

    await post.save();

    // -------------------------------------------------
    // CREATE NOTIFICATION
    // Don't notify yourself
    // -------------------------------------------------

    if (
      post.author.toString() !==
      userId.toString()
    ) {
      const existingNotification =
        await Notification.findOne({
          recipient: post.author,
          actor: userId,
          type: "like",
          post: post._id,
        });

      if (!existingNotification) {
        await Notification.create({
          recipient: post.author,
          actor: userId,
          type: "like",
          post: post._id,
          read: false,
        });
      }
    }

    return res.status(200).json({
      success: true,
      liked: true,
      likesCount: post.likes.length,
      message: "Post liked",
    });
  } catch (error) {
    console.error("LIKE POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like post",
      error: error.message,
    });
  }
};

// =====================================================
// ADD COMMENT
// POST /api/posts/:id/comments
// AUTH REQUIRED
// =====================================================

const addComment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { text } = req.body;
    const postId = req.params.id;

    // -------------------------------------------------
    // VALIDATE COMMENT
    // -------------------------------------------------

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // -------------------------------------------------
    // VALIDATE POST ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // -------------------------------------------------
    // FIND POST
    // -------------------------------------------------

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // -------------------------------------------------
    // CREATE COMMENT
    // -------------------------------------------------

    const comment = {
      user: userId,
      username:
        req.user.username ||
        req.user.name ||
        "User",
      text: text.trim(),
    };

    post.comments.push(comment);

    await post.save();

    // -------------------------------------------------
    // COMMENT NOTIFICATION
    // -------------------------------------------------

    if (
      post.author.toString() !==
      userId.toString()
    ) {
      await Notification.create({
        recipient: post.author,
        actor: userId,
        type: "comment",
        post: post._id,
        commentText: text.trim(),
        read: false,
      });
    }

    // -------------------------------------------------
    // RETURN UPDATED POST
    // -------------------------------------------------

    const updatedPost =
      await Post.findById(post._id)
        .populate(
          "author",
          "username name email profilePic"
        )
        .populate(
          "comments.user",
          "username name profilePic"
        );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
      post: updatedPost,
    });
  } catch (error) {
    console.error(
      "ADD COMMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createPost,
  getPosts,
  getUserPosts,
  getSinglePost,
  likePost,
  addComment,
};