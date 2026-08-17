
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// =====================================================
// CREATE POST
// =====================================================

const createPost = async (req, res) => {
  try {
    const { title, description, image, country, flag } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post title is required",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const post = await Post.create({
      author: req.user.id,
      title: title.trim(),
      description: description || "",
      image: image || "",
      country: country || "",
      flag: flag || "",
    });

    const populatedPost = await Post.findById(post._id)
      .populate(
        "author",
        "username name email profilePic"
      )
      .populate(
        "comments.user",
        "username name profilePic"
      );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL POSTS
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

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

// =====================================================
// LIKE / UNLIKE POST
// POST /api/posts/:id/like
// =====================================================

const likePost = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // -------------------------------------------------
    // CHECK IF USER ALREADY LIKED THE POST
    // -------------------------------------------------

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    // -------------------------------------------------
    // UNLIKE
    // -------------------------------------------------

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      await post.save();

      // Remove the corresponding notification
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

    // -------------------------------------------------
    // LIKE
    // -------------------------------------------------

    post.likes.push(userId);

    await post.save();

    // -------------------------------------------------
    // DON'T NOTIFY YOURSELF
    // -------------------------------------------------

    if (
      post.author.toString() !==
      userId.toString()
    ) {
      await Notification.create({
        recipient: post.author,
        actor: userId,
        type: "like",
        post: post._id,
        read: false,
      });
    }

    res.status(200).json({
      success: true,
      liked: true,
      likesCount: post.likes.length,
      message: "Post liked",
    });
  } catch (error) {
    console.error("LIKE POST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to like post",
      error: error.message,
    });
  }
};

// =====================================================
// ADD COMMENT
// POST /api/posts/:id/comments
// =====================================================

const addComment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
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
      user: req.user._id,
      username:
        req.user.username || "User",
      text: text.trim(),
    };

    post.comments.push(comment);

    await post.save();

    // -------------------------------------------------
    // CREATE NOTIFICATION
    // -------------------------------------------------

    if (
      post.author.toString() !==
      req.user._id.toString()
    ) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: "comment",
        post: post._id,
        commentText: text.trim(),
        read: false,
      });
    }

    // -------------------------------------------------
    // GET UPDATED POST
    // -------------------------------------------------

    const updatedPost = await Post.findById(post._id)
      .populate(
        "author",
        "username name email profilePic"
      )
      .populate(
        "comments.user",
        "username name profilePic"
      );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
      post: updatedPost,
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);

    res.status(500).json({
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
  likePost,
  addComment,
};

