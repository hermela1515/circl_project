const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory = path.join(
  __dirname,
  "../uploads/profile-pictures"
);

/* =========================================================
   CREATE DIRECTORY IF IT DOES NOT EXIST
========================================================= */

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* =========================================================
   STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `profile-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = function (req, file, cb) {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP, and GIF images are allowed."
      ),
      false
    );
  }
};

/* =========================================================
   MULTER
========================================================= */

const uploadProfilePicture = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = uploadProfilePicture;