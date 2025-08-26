import multer from "multer";

// Configure multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error("Invalid file extension. Allowed: jpg, jpeg, png, gif, webp"),
        false
      );
    }

    cb(null, true);
  },
});

// Error handling for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size too large. Maximum size is 5MB.",
      });
    }
  }

  if (
    error.message.includes("Only image files are allowed") ||
    error.message.includes("Invalid file extension")
  ) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next(error);
};
