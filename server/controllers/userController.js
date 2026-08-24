const mongoose = require("mongoose");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* =====================================================
   HELPER
===================================================== */

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

/* =====================================================
   GET CURRENT USER PROFILE
   GET /api/users/me
===================================================== */

const getMe = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId).select(
      "-password -emailVerificationToken -emailVerificationExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/* =====================================================
   UPDATE CURRENT USER PROFILE
   PUT /api/users/me
===================================================== */

const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    /* =================================================
       AUTHENTICATION
    ================================================= */

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /* =================================================
       GET FORM DATA

       Because the request now uses FormData,
       multer puts normal fields inside req.body
       and the image inside req.file.
    ================================================= */

    const {
      username,
      bio,
    } = req.body;

    /* =================================================
       FIND USER
    ================================================= */

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* =================================================
       UPDATE USERNAME
    ================================================= */

    if (username !== undefined) {
      const cleanUsername =
        username.trim();

      if (cleanUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "Username must be at least 3 characters",
        });
      }

      if (cleanUsername.length > 30) {
        return res.status(400).json({
          success: false,
          message:
            "Username cannot exceed 30 characters",
        });
      }

      const existingUser =
        await User.findOne({
          username: cleanUsername,
          _id: {
            $ne: userId,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Username is already taken",
        });
      }

      user.username =
        cleanUsername;
    }

    /* =================================================
       UPDATE BIO
    ================================================= */

    if (bio !== undefined) {
      const cleanBio =
        bio.trim();

      if (cleanBio.length > 160) {
        return res.status(400).json({
          success: false,
          message:
            "Bio cannot exceed 160 characters",
        });
      }

      user.bio = cleanBio;
    }

    /* =================================================
       UPDATE PROFILE PICTURE
    ================================================= */

    if (req.file) {
      /*
       * Multer saves the actual image into:
       *
       * server/uploads/profile-pictures/
       *
       * We store only the URL/path in MongoDB.
       */

      user.profilePic =
        `/uploads/profile-pictures/${req.file.filename}`;
    }

    /* =================================================
       SAVE USER
    ================================================= */

    await user.save();

    /* =================================================
       GET UPDATED USER
    ================================================= */

    const updatedUser =
      await User.findById(userId).select(
        "-password -emailVerificationToken -emailVerificationExpires"
      );

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    /* =================================================
       MULTER FILE SIZE ERROR
    ================================================= */

    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Profile picture must be smaller than 5MB.",
      });
    }

    /* =================================================
       MULTER FILE TYPE ERROR
    ================================================= */

    if (
      error.message &&
      error.message.includes(
        "Only JPG"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    /* =================================================
       DUPLICATE USERNAME
    ================================================= */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Username is already taken",
      });
    }

    /* =================================================
       GENERAL ERROR
    ================================================= */

    return res.status(500).json({
      success: false,
      message:
        "Failed to update profile",
      error: error.message,
    });
  }
};

/* =====================================================
   GET PUBLIC USER PROFILE
   GET /api/users/:id
===================================================== */

const getUserProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const currentUserId =
      getUserId(req);

    /* =================================================
       VALIDATE USER ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        profileId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* =================================================
       FIND USER
    ================================================= */

    const user =
      await User.findById(profileId)
        .select(
          "-password -email -emailVerificationToken -emailVerificationExpires"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* =================================================
       CHECK FOLLOWING STATUS
    ================================================= */

    let isFollowing = false;

    if (currentUserId) {
      isFollowing =
        user.followers.some(
          (id) =>
            id.toString() ===
            currentUserId.toString()
        );
    }

    /* =================================================
       CHECK WHETHER THIS IS CURRENT USER
    ================================================= */

    const isOwnProfile =
      currentUserId &&
      currentUserId.toString() ===
        profileId.toString();

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      user,

      isFollowing,

      isOwnProfile:
        Boolean(isOwnProfile),

      followersCount:
        user.followers.length,

      followingCount:
        user.following.length,
    });
  } catch (error) {
    console.error(
      "Get public profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user profile",
    });
  }
};

/* =====================================================
   FOLLOW / UNFOLLOW USER
   POST /api/users/:id/follow
===================================================== */

const toggleFollow = async (req, res) => {
  try {
    const currentUserId =
      getUserId(req);

    const targetUserId =
      req.params.id;

    /* =================================================
       AUTHENTICATION
    ================================================= */

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    /* =================================================
       VALIDATE TARGET ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        targetUserId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    /* =================================================
       CANNOT FOLLOW YOURSELF
    ================================================= */

    if (
      currentUserId.toString() ===
      targetUserId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot follow yourself",
      });
    }

    /* =================================================
       FIND CURRENT USER
    ================================================= */

    const currentUser =
      await User.findById(
        currentUserId
      );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message:
          "Current user not found",
      });
    }

    /* =================================================
       FIND TARGET USER
    ================================================= */

    const targetUser =
      await User.findById(
        targetUserId
      );

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message:
          "User you are trying to follow was not found",
      });
    }

    /* =================================================
       MAKE SURE ARRAYS EXIST
    ================================================= */

    if (
      !Array.isArray(
        currentUser.following
      )
    ) {
      currentUser.following = [];
    }

    if (
      !Array.isArray(
        targetUser.followers
      )
    ) {
      targetUser.followers = [];
    }

    /* =================================================
       CHECK WHETHER ALREADY FOLLOWING
    ================================================= */

    const alreadyFollowing =
      currentUser.following.some(
        (id) =>
          id.toString() ===
          targetUserId.toString()
      );

    /* =================================================
       UNFOLLOW
    ================================================= */

    if (alreadyFollowing) {
      currentUser.following =
        currentUser.following.filter(
          (id) =>
            id.toString() !==
            targetUserId.toString()
        );

      targetUser.followers =
        targetUser.followers.filter(
          (id) =>
            id.toString() !==
            currentUserId.toString()
        );

      await currentUser.save();
      await targetUser.save();

      /* =================================================
         REMOVE FOLLOW NOTIFICATION
      ================================================= */

      try {
        await Notification.deleteOne({
          recipient:
            targetUser._id,

          actor:
            currentUser._id,

          type: "follow",
        });
      } catch (
        notificationError
      ) {
        console.error(
          "FOLLOW NOTIFICATION DELETE ERROR:",
          notificationError
        );
      }

      return res.status(200).json({
        success: true,

        following: false,

        followersCount:
          targetUser.followers
            .length,

        followingCount:
          currentUser.following
            .length,

        message:
          "User unfollowed successfully",
      });
    }

    /* =================================================
       FOLLOW
    ================================================= */

    currentUser.following.push(
      targetUser._id
    );

    targetUser.followers.push(
      currentUser._id
    );

    await currentUser.save();
    await targetUser.save();

    /* =================================================
       CREATE FOLLOW NOTIFICATION
    ================================================= */

    try {
      await Notification.create({
        recipient:
          targetUser._id,

        actor:
          currentUser._id,

        type: "follow",

        read: false,
      });
    } catch (
      notificationError
    ) {
      console.error(
        "FOLLOW NOTIFICATION ERROR:",
        notificationError
      );
    }

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      following: true,

      followersCount:
        targetUser.followers
          .length,

      followingCount:
        currentUser.following
          .length,

      message:
        "User followed successfully",
    });
  } catch (error) {
    console.error(
      "FOLLOW USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update follow status",
      error:
        error.message,
    });
  }
};

/* =====================================================
   GET FOLLOWERS
   GET /api/users/:id/followers
===================================================== */

const getFollowers = async (req, res) => {
  try {
    const userId =
      req.params.id;

    /* =================================================
       VALIDATE USER ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    /* =================================================
       FIND USER
    ================================================= */

    const user =
      await User.findById(userId)
        .populate(
          "followers",
          "username profilePic bio"
        )
        .select("followers");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      followers:
        user.followers || [],

      count:
        user.followers?.length ||
        0,
    });
  } catch (error) {
    console.error(
      "GET FOLLOWERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch followers",
    });
  }
};

/* =====================================================
   GET FOLLOWING
   GET /api/users/:id/following
===================================================== */

const getFollowing = async (req, res) => {
  try {
    const userId =
      req.params.id;

    /* =================================================
       VALIDATE USER ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    /* =================================================
       FIND USER
    ================================================= */

    const user =
      await User.findById(userId)
        .populate(
          "following",
          "username profilePic bio"
        )
        .select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      following:
        user.following || [],

      count:
        user.following?.length ||
        0,
    });
  } catch (error) {
    console.error(
      "GET FOLLOWING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch following",
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  getMe,
  updateProfile,
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
};