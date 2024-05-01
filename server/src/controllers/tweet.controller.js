import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { tweetContent } = req.body;
  if (!tweetContent) {
    throw new ApiError(400, "TweetContent is required!!");
  }
  try {
    const tweet = await Tweet.create({
      content: tweetContent,
      owner: req.user?._id,
    });
    if (!tweet) {
      throw new ApiError(500, "Unable to create tweet!!");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet published Successfully!!"));
  } catch (e) {
    throw new ApiError(500, e?.messgae || " Unable to create tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is Required!!!");
  }
  try {
    const tweet = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "owner",
          tweets: { $push: "$content" },
        },
      },
      {
        $project: {
          _id: 0,
          tweets: 1,
        },
      },
    ]);
    if (!tweet || tweet.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "User have no tweets"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, tweet, "Tweet for the user fetched successfully!")
      );
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to fetch tweets");
  }
});

export { createTweet, getUserTweets };
