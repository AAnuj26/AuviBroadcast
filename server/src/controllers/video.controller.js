import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const isUserOwnser = async (videoId, req) => {
  const video = await Video.findById(videoId);
  if (video?.owner.toString() !== req.user?._id.toString()) {
    return false;
  }
  return true;
};
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

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  // Retrieve the video and thumbnail
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnailFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  // Cloud
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video?.url) {
    throw new ApiError(500, "Failed to upload video");
  }
  if (!thumbnail?.url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }
  fs.unlinkSync(videoLocalPath);
  fs.unlinkSync(thumbnailLocalPath);

  const newVideo = await Video.create({
    videoFile: video?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: video?.duration,
    isPublished: true,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Get video by ID
  const video = await Video.findById(videoId);

  if (
    !video ||
    (!video?.isPublished &&
      !(video?.owner.toString() === req.user?._id.toString()))
  ) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Doesnt Exist");
  }

  const authorized = await isUserOwnser(videoId, req);
  if (!authorized) {
    throw new ApiError(403, "Unauthorized Access");
  }

  const { title, description } = req.body;
  if (!title && !description) {
    throw new ApiError(400, "Title and description are required");
  }
  const thumbnailLocalPath = req.file?.path;

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail?.url) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }
  fs.unlinkSync(thumbnailLocalPath);
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail?.url,
      },
    },
    {
      new: true,
    }
  );

  if (!updateVideo) {
    throw new ApiError(500, "Failed to update video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Doesnt Exist");
  }
  const authorized = await isUserOwnser(videoId, req);
  if (!authorized) {
    throw new ApiError(403, "Unauthorized Access");
  }
  const videoDeleted = await Video.findByIdAndDelete(videoId);
  if (!videoDeleted) {
    throw new ApiError(500, "Failed to delete video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Doesnt Exist");
  }
  const authorized = await isUserOwnser(videoId, req);
  if (!authorized) {
    throw new ApiError(403, "Unauthorized Access");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedVideo) {
    throw new ApiError(500, "Failed to update video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video publish status updated successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
