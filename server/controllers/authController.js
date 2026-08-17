const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const transporter = require("../config/mailer");

/* =========================================================
   GENERATE JWT
========================================================= */

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/* =========================================================
   SEND VERIFICATION EMAIL
========================================================= */

const sendVerificationEmail = async (user, token) => {
  // Your frontend is running on http://localhost:3001
  const clientUrl =
    process.env.CLIENT_URL || "http://localhost:3001";

  const verificationUrl =
    `${clientUrl}/verify-email?token=${token}`;

  console.log("========================================");
  console.log("SENDING VERIFICATION EMAIL");
  console.log("To:", user.email);
  console.log("Verification URL:", verificationUrl);
  console.log("========================================");

  const info = await transporter.sendMail({
    from: `"Circl" <${process.env.EMAIL_USER}>`,

    to: user.email,

    subject: "Verify your Circl email",

    text: `
Welcome to Circl!

Hi ${user.username},

Thanks for joining Circl.

Please verify your email address by opening this link:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create a Circl account, you can safely ignore this email.
    `,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Verify your Circl email</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #15121F;
            font-family: Arial, sans-serif;
          "
        >

          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              padding: 40px;
              background-color: #1E1A2E;
              border-radius: 20px;
              color: #F5F1EA;
            "
          >

            <h1
              style="
                margin-bottom: 20px;
                color: #FF5C7C;
              "
            >
              Welcome to Circl 🎉
            </h1>

            <p>
              Hi <strong>${user.username}</strong>,
            </p>

            <p>
              Thanks for joining Circl!
              We just need to verify that this email address
              belongs to you.
            </p>

            <div style="margin: 30px 0;">

              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 14px 28px;
                  background-color: #FF5C7C;
                  color: #15121F;
                  text-decoration: none;
                  border-radius: 30px;
                  font-weight: bold;
                "
              >
                Verify My Email
              </a>

            </div>

            <p style="color: #ABA3C4;">
              This verification link will expire in 24 hours.
            </p>

            <p
              style="
                color: #6F6982;
                font-size: 13px;
              "
            >
              If you didn't create a Circl account,
              you can safely ignore this email.
            </p>

            <hr
              style="
                border: none;
                border-top: 1px solid #302B40;
                margin: 30px 0;
              "
            />

            <p
              style="
                color: #6F6982;
                font-size: 12px;
                word-break: break-all;
              "
            >
              If the button doesn't work, copy and paste
              this link into your browser:
            </p>

            <p
              style="
                color: #9D8DF1;
                font-size: 12px;
                word-break: break-all;
              "
            >
              ${verificationUrl}
            </p>

          </div>

        </body>
      </html>
    `,
  });

  console.log("========================================");
  console.log("✅ VERIFICATION EMAIL SENT");
  console.log("Message ID:", info.messageId);
  console.log("Recipient:", user.email);
  console.log("========================================");

  return info;
};

/* =========================================================
   REGISTER
========================================================= */

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    /* -----------------------------------------------------
       REQUIRED FIELDS
    ----------------------------------------------------- */

    if (!username || !email || !password) {
      return res.status(400).json({
        message:
          "Username, email and password are required",
      });
    }

    /* -----------------------------------------------------
       CLEAN INPUT
    ----------------------------------------------------- */

    const cleanUsername = username.trim();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    /* -----------------------------------------------------
       USERNAME VALIDATION
    ----------------------------------------------------- */

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        message:
          "Username must be at least 3 characters",
      });
    }

    /* -----------------------------------------------------
       EMAIL VALIDATION
    ----------------------------------------------------- */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message:
          "Please enter a valid email address",
      });
    }

    /* -----------------------------------------------------
       PASSWORD VALIDATION
    ----------------------------------------------------- */

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    /* -----------------------------------------------------
       CHECK USERNAME
    ----------------------------------------------------- */

    const existingUsername =
      await User.findOne({
        username: cleanUsername,
      });

    if (existingUsername) {
      return res.status(409).json({
        message:
          "Username already exists",
      });
    }

    /* -----------------------------------------------------
       CHECK EMAIL
    ----------------------------------------------------- */

    const existingEmail =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingEmail) {
      return res.status(409).json({
        message:
          "Email already registered",
      });
    }

    /* -----------------------------------------------------
       HASH PASSWORD
    ----------------------------------------------------- */

    const hashedPassword =
      await bcrypt.hash(password, 12);

    /* -----------------------------------------------------
       CREATE VERIFICATION TOKEN
    ----------------------------------------------------- */

    const verificationToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const verificationExpires =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000
      );

    /* -----------------------------------------------------
       CREATE USER
    ----------------------------------------------------- */

    const user = await User.create({
      username: cleanUsername,

      email: cleanEmail,

      password: hashedPassword,

      emailVerified: false,

      emailVerificationToken:
        verificationToken,

      emailVerificationExpires:
        verificationExpires,
    });

    console.log("========================================");
    console.log("USER CREATED");
    console.log("Username:", user.username);
    console.log("Email:", user.email);
    console.log("Email verified:", user.emailVerified);
    console.log("========================================");

    /* -----------------------------------------------------
       SEND VERIFICATION EMAIL
    ----------------------------------------------------- */

    try {
      await sendVerificationEmail(
        user,
        verificationToken
      );

    } catch (emailError) {

      console.error(
        "========================================"
      );

      console.error(
        "❌ VERIFICATION EMAIL FAILED"
      );

      console.error(emailError);

      console.error(
        "========================================"
      );

      /*
       * Delete account if email cannot be sent.
       */

      await User.findByIdAndDelete(
        user._id
      );

      return res.status(500).json({
        message:
          "Account could not be created because the verification email could not be sent.",
      });
    }

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return res.status(201).json({
      message:
        "Account created successfully. Please check your email to verify your account.",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        emailVerified:
          user.emailVerified,
      },
    });

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "❌ REGISTER ERROR"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return res.status(500).json({
      message:
        "Server error while creating account",
    });
  }
};

/* =========================================================
   VERIFY EMAIL
========================================================= */

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message:
          "Verification token is missing",
      });
    }

    console.log("========================================");
    console.log("VERIFYING EMAIL");
    console.log("Token received:", token);
    console.log("========================================");

    /* -----------------------------------------------------
       FIND USER
    ----------------------------------------------------- */

    const user = await User.findOne({
      emailVerificationToken: token,

      emailVerificationExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Verification link is invalid or has expired",
      });
    }

    /* -----------------------------------------------------
       VERIFY USER
    ----------------------------------------------------- */

    user.emailVerified = true;

    user.emailVerificationToken = null;

    user.emailVerificationExpires = null;

    await user.save();

    console.log("========================================");
    console.log("✅ EMAIL VERIFIED");
    console.log("User:", user.email);
    console.log("========================================");

    return res.status(200).json({
      message:
        "Email verified successfully. You can now log in.",
    });

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "❌ EMAIL VERIFICATION ERROR"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return res.status(500).json({
      message:
        "Server error while verifying email",
    });
  }
};

/* =========================================================
   LOGIN
========================================================= */

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    /* -----------------------------------------------------
       REQUIRED FIELDS
    ----------------------------------------------------- */

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    /* -----------------------------------------------------
       FIND USER
    ----------------------------------------------------- */

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    /* -----------------------------------------------------
       CHECK EMAIL VERIFICATION
    ----------------------------------------------------- */

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in.",
      });
    }

    /* -----------------------------------------------------
       CHECK PASSWORD
    ----------------------------------------------------- */

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    /* -----------------------------------------------------
       GENERATE JWT
    ----------------------------------------------------- */

    const token =
      generateToken(user._id);

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return res.status(200).json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        emailVerified:
          user.emailVerified,
      },
    });

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "❌ LOGIN ERROR"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return res.status(500).json({
      message:
        "Server error while logging in",
    });
  }
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  register,
  verifyEmail,
  login,
};