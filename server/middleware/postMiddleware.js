
const validatePost = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Post title is required",
    });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: "Post description is required",
    });
  }

  if (title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      message: "Post title cannot exceed 150 characters",
    });
  }

  if (description.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      message:
        "Post description cannot exceed 2000 characters",
    });
  }

  next();
};

module.exports = validatePost;

