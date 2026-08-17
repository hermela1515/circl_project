const express = require("express");

const {
  register,
  verifyEmail,
  login,
} = require("../controllers/authController");

const router = express.Router();

// REGISTER
router.post("/register", register);

// VERIFY EMAIL
router.get("/verify-email", verifyEmail);

// LOGIN
router.post("/login", login);

module.exports = router;