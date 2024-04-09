import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Parse page and limit to numbers
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  //Validate and adjust page and limit values
  page = Math.max(1, page); // Ensure page is at least 1
  limit = Math.min(20, Math.max(1, limit)); // Ensure limit is between 1 and 20

  const pipeline = [];

  // Match videos by owner userId if provided
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    pipeline.push({
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    });
  }

  // Match videos Based on search query
  if (query) {
    pipeline.push({
      $match: {
        $text: {
          $search: query,
        },
      },
    });
  }

  // Sort pipeline stage based on sortBy and sortType
  const sortCriteria = {};
  if (sortBy && sortType) {
    sortCriteria[sortBy] = sortType === "asc" ? 1 : -1;
    pipeline.push({
      $sort: sortCriteria,
    });
  } else {
    // Default sorting by createAt if sortBy and sortType are not provided
    sortCriteria["createdAt"] = -1;
    pipeline.push({
      $sort: sortCriteria,
    });
  }

  // Apply pagination using skip and limit
  pipeline.push({
    $skip: (page - 1) * limit,
  });
  pipeline.push({
    $limit: limit,
  });
  // Execute aggregation pipeline
  const Videos = await Video.aggregate(pipeline);

  if (!Videos || Videos.length === 0) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, Videos, "Videos fetched successfully"));
});

export { getAllVideos };
