exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value error." });
  }

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation failed", details });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};
