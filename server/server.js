// =========================================================
// LOAD ENVIRONMENT VARIABLES FIRST
// =========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// =========================================================
// ROUTES
// =========================================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const testEmailRoutes = require("./routes/testEmailRoutes");
const messageRoutes = require("./routes/messageRoutes");

// =========================================================
// APP
// =========================================================

const app = express();

// =========================================================
// ENVIRONMENT
// =========================================================

console.log("========================================");
console.log("        CIRCL SERVER STARTING");
console.log("========================================");

console.log(
  "CLIENT_URL:",
  process.env.CLIENT_URL
);

console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER
);

console.log(
  "EMAIL_PASS length:",
  process.env.EMAIL_PASS
    ? process.env.EMAIL_PASS.length
    : 0
);

console.log(
  "MONGODB_URI exists:",
  !!process.env.MONGODB_URI
);

console.log("========================================");

// =========================================================
// CORS
// =========================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

// Add deployed frontend URL from .env
if (process.env.CLIENT_URL) {
  if (
    !allowedOrigins.includes(
      process.env.CLIENT_URL
    )
  ) {
    allowedOrigins.push(
      process.env.CLIENT_URL
    );
  }
}

app.use(
  cors({
    origin: function (
      origin,
      callback
    ) {
      // Allow requests with no origin
      // Example: Postman, Thunder Client,
      // server-to-server requests

      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      console.log(
        "Blocked CORS origin:",
        origin
      );

      return callback(
        new Error(
          `CORS: Origin ${origin} not allowed`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =========================================================
// BODY PARSER
// =========================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =========================================================
// PROFILE IMAGE UPLOADS
// =========================================================
//
// Uploaded profile pictures are stored in:
//
// server/uploads/profile-pictures/
//
// This makes them accessible through:
//
// http://localhost:5000/uploads/profile-pictures/filename.jpg
//
// =========================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// =========================================================
// REQUEST LOGGER
// =========================================================

app.use(
  (req, res, next) => {
    console.log(
      `${req.method} ${req.originalUrl}`
    );

    next();
  }
);

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Circl API is running",
  });
});

// =========================================================
// API HEALTH CHECK
// =========================================================

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Circl API is working",
    version: "1.0.0",
  });
});

// =========================================================
// AUTH ROUTES
// =========================================================
//
// POST /api/auth/register
// GET  /api/auth/verify-email
// POST /api/auth/login
//
// =========================================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================================
// USER ROUTES
// =========================================================
//
// GET /api/users/me
// PUT /api/users/me
// GET /api/users/:id
//
// =========================================================

app.use(
  "/api/users",
  userRoutes
);

// =========================================================
// POST ROUTES
// =========================================================
//
// GET    /api/posts
// POST   /api/posts
// etc.
//
// =========================================================

app.use(
  "/api/posts",
  postRoutes
);

// =========================================================
// NOTIFICATION ROUTES
// =========================================================
//
// GET    /api/notifications
// PATCH  /api/notifications/:id/read
// PATCH  /api/notifications/read-all
// etc.
//
// =========================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =========================================================
// MESSAGING ROUTES
// =========================================================
//
// GET    /api/messages/conversations
// GET    /api/messages/conversations/:conversationId
// POST   /api/messages
// PATCH  /api/messages/conversations/:conversationId/read
// DELETE /api/messages/conversations/:conversationId
//
// =========================================================

app.use(
  "/api/messages",
  messageRoutes
);

// =========================================================
// TEST EMAIL ROUTES
// =========================================================
//
// Used only for testing the Gmail/Nodemailer setup.
//
// =========================================================

app.use(
  "/api/test-email",
  testEmailRoutes
);

// =========================================================
// 404 HANDLER
// =========================================================
//
// IMPORTANT:
// This MUST come AFTER all API routes.
// =========================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `Route ${req.method} ${req.originalUrl} not found`,
    });
  }
);

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "========================================"
    );

    console.error(
      "SERVER ERROR"
    );

    console.error(err);

    console.error(
      "========================================"
    );

    // -----------------------------------------------------
    // CORS ERROR
    // -----------------------------------------------------

    if (
      err.message?.startsWith(
        "CORS:"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          err.message,
      });
    }

    // -----------------------------------------------------
    // MULTER FILE SIZE ERROR
    // -----------------------------------------------------

    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Profile picture must be smaller than 5MB.",
      });
    }

    // -----------------------------------------------------
    // MULTER FILE TYPE ERROR
    // -----------------------------------------------------

    if (
      err.message &&
      err.message.includes(
        "Only JPG"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          err.message,
      });
    }

    // -----------------------------------------------------
    // GENERAL ERROR
    // -----------------------------------------------------

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

// =========================================================
// SERVER STARTUP
// =========================================================

const PORT =
  process.env.PORT || 5000;

const startServer =
  async () => {
    try {
      // ---------------------------------------------------
      // CONNECT TO MONGODB FIRST
      // ---------------------------------------------------

      await connectDB();

      // ---------------------------------------------------
      // START EXPRESS SERVER
      // ---------------------------------------------------

      app.listen(
        PORT,
        () => {
          console.log(
            "========================================"
          );

          console.log(
            `Circl server running on port ${PORT}`
          );

          console.log(
            `http://localhost:${PORT}`
          );

          console.log(
            "Profile uploads:",
            `http://localhost:${PORT}/uploads`
          );

          console.log(
            "========================================"
          );
        }
      );
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "❌ CIRCL SERVER FAILED TO START"
      );

      console.error(
        error.message
      );

      console.error(
        "========================================"
      );

      process.exit(1);
    }
  };

// =========================================================
// START CIRCL
// =========================================================

startServer();