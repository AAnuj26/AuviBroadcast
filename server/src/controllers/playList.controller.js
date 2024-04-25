import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { createPlayList };
