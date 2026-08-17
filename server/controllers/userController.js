const User = require("../models/User");

/* =========================================================
   GET CURRENT USER PROFILE
========================================================= */

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -emailVerificationToken -emailVerificationExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/* =========================================================
   UPDATE CURRENT USER PROFILE
========================================================= */

const updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* -----------------------------------------
       UPDATE USERNAME
    ----------------------------------------- */

    if (username !== undefined) {
      const cleanUsername = username.trim();

      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username must be at least 3 characters",
        });
      }

      if (cleanUsername.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Username cannot exceed 30 characters",
        });
      }

      const existingUser = await User.findOne({
        username: cleanUsername,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }

      user.username = cleanUsername;
    }

    /* -----------------------------------------
       UPDATE BIO
    ----------------------------------------- */

    if (bio !== undefined) {
      const cleanBio = bio.trim();

      if (cleanBio.length > 160) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 160 characters",
        });
      }

      user.bio = cleanBio;
    }

    /* -----------------------------------------
       UPDATE PROFILE PICTURE
    ----------------------------------------- */

    if (profilePic !== undefined) {
      user.profilePic =
        profilePic || "/images/default-avatar.png";
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).select(
      "-password -emailVerificationToken -emailVerificationExpires"
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    /* MongoDB duplicate username error */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/* =========================================================
   GET PUBLIC USER PROFILE
========================================================= */

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "-password -email -emailVerificationToken -emailVerificationExpires"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get public profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

module.exports = {
  getMe,
  updateProfile,
  getUserProfile,
};