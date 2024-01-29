// asyncHandler WITH try and catch ->
const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      sucess: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// asyncHandler WITH promise ->
//   const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//       Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//     };
//   };

export { asyncHandler };