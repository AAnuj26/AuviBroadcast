// asyncHandler WITH try and catch ->

const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    const response = await requestHandler(req, res, next);
    return response;
  } catch (error) {
    res.status(error.statusCode || 500).json({
      sucess: false,
      message: error.message || "Server Error at asyncHandler",
    });
  }
};

// // asyncHandler WITH promise ->

// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

export { asyncHandler };
