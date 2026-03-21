const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR 💥:", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || "Something went wrong",
  });
};

export default errorMiddleware;
