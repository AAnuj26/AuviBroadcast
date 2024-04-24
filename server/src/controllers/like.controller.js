import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Video } from "../models/video.model";
import { ApiResponse } from "../utils/ApiResponse";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  try {
    const video = await Video.findById(videoId);
    if (
      !video ||
      (video.owner.toString() !== req.user?._id.toString() &&
        !video.isPublished)
    ) {
      throw new ApiError(404, "Video not found");
    }
    const likeCriteria = { video: videoId, likedBy: req.user?._id };
    const alreadyLiked = await Like.findOne(likeCriteria);
    if (!alreadyLiked) {
      const newLike = await Like.create(likeCriteria);
      if (!newLike) {
        throw new ApiError(500, "Failed to like video");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Successfully liked the video"));
    }
    const dislike = await Like.deleteOne(likeCriteria);
    if (!dislike) {
      throw new ApiError(500, "Failed to dislike video");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully disliked the video"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Unable to toggle the like of the video"
    );
  }
});

export { toggleVideoLike };
