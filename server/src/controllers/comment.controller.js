import mongoose from "mongoose";
import { Comment } from "../models/comment.model";
import { Video } from "../models/video.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiError";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    await Comment.deleteMany({ videoId: videoId });
    throw new ApiError(
      400,
      "Video not found. All associated comments have been deleted"
    );
  }
  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes,likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
        isLiked: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  if (!comments || comments.length === 0) {
    return res.status(404).json(new ApiResponse(404, {}, "No comments found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments obtained successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { commentContent } = req.body;
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }
  try {
    const video = await Video.findById(videoId);
    if (
      !video ||
      (video.owner.toString() !== req.user?._id.toString() &&
        !video.isPublished)
    ) {
      throw new ApiError(400, "There is no such Video");
    }
    if (!commentContent) {
      throw new ApiError(400, "commentContent is required!!");
    }
    const comment = await Comment.create({
      content: commentContent,
      video: videoId,
      owner: req.user?._id,
    });
    if (!comment) {
      throw new ApiError(500, "Unable to create comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment posted successfully"));
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to create comment");
  }
});

export { getVideoComments, addComment };
