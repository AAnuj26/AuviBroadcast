import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "channelId is Required!!");
  }
  const userId = req.user?._id;
  const credential = { subscriber: userId, channel: channelId };
  try {
    const subscribed = await Subscription.findOne(credential);
    if (!subscribed) {
      //not subscribed :- delete the existing one
      const newSubscription = await Subscription.create(credential);
      if (!newSubscription) {
        throw new ApiError(500, "Unable to Subscribe channel");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            newSubscription,
            "Channel Subscribed Successfully!!"
          )
        );
    } else {
      //subscribed :-delete the subscription
      const deletedSubscription = await Subscription.deleteOne(credential);
      if (!deletedSubscription) {
        throw new ApiError(500, "Unable to Unsubscribe channel");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            deletedSubscription,
            "Channel Unsubscribed Successfully!!"
          )
        );
    }
  } catch (e) {
    throw new ApiError(500, e?.message || "Unable to toggle subscription");
  }
});

export { toggleSubscription };
