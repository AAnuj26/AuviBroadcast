import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createPlayList = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  if (!name) {
    throw new ApiError(400, "Name is Required to Create a Playlist!!");
  }
  let playlistDescription = description || " ";
  try {
    const playlist = await Playlist.create({
      name,
      description: playlistDescription,
      owner: req.user?._id,
      videos: [],
    });
    if (!playlist) {
      throw new ApiError(
        500,
        "Something error happened while trying to create a playlist"
      );
    }
    return res
      .status(201)
      .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to create playlist ");
  }
});

const getUserPlayLists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const playlist = await Playlist.aggregate([
      {
        $match: {
          owner: user?._id,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          owner: 1,
          createdAt: 1,
          updatedAt: 1,
          videos: {
            $cond: {
              if: {
                $eq: ["$owner", new mongoose.Types.ObjectId(req?.user?._id)],
              },
              then: "$videos",
              else: {
                $filter: {
                  input: "$videos",
                  as: "video",
                  cond: {
                    $eq: ["$video.isPublished", true],
                  },
                },
              },
            },
          },
        },
      },
    ]);

    if (!playlist) {
      throw new ApiError(404, "There is no Playlist made by this user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist Fetched Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Unable to fetch playlist or playlists doesn't exist"
    );
  }
});

const getPlayListById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist ID is required");
  }
  try {
    const playList = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
        },
      },
      {
        //if the user is owner then he can see the playlist with the unpublished video of himself
        //but others can see the published video only
        $project: {
          name: 1,
          description: 1,
          owner: 1,
          videos: {
            $cond: {
              if: {
                $eq: ["$owner", new mongoose.Types.ObjectId(req?.user?._id)],
              },
              then: "$videos",
              else: {
                $filter: {
                  input: "$videos",
                  as: "video",
                  cond: {
                    $eq: ["$video.isPublished", true],
                  },
                },
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!playList) {
      throw new ApiError(404, "Playlist not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, playList, "Playlist Fetched Successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "playListId is not correct or playlist doesn't exist"
    );
  }
});

export { createPlayList, getUserPlayLists, getPlayListById };
