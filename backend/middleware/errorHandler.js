export const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  // Handle validation errors
  if (
    error.message.includes("Title is required") ||
    error.message.includes("Description is required") ||
    error.message.includes("must be less than")
  ) {
    return res.status(400).json({
      error: error.message,
    });
  }

  // Handle AWS errors
  if (error.name === "ResourceNotFoundException") {
    return res.status(404).json({
      error: "Resource not found",
    });
  }

  if (error.name === "AccessDeniedException") {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
};
