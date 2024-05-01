import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export { createTweet };
