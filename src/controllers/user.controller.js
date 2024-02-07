import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, email, username, password } = req.body;

  // validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists: username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // check for image, check for avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  //check if avatar file path is available
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Avatar uploaded successfully");

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("cover image uploaded successfully");

  //check if avatar is uploaded
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user object - create enter in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username,
  });

  // remove password and refresh token from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Remove files from server
  fs.unlinkSync(avatarLocalPath);
  fs.unlinkSync(coverImageLocalPath);

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "User not created");
  }

  // send back response
  return (
    res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully")),
    console.log("User created successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  // username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // find the user
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // access and refresh token
  const generateAccessAndRefreshTokens = async (userId) => {
    try {
      await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Refresh and Access Token generation failed");
    }
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // clear cookies
  res.clearCookie("accessToken").clearCookie("refreshToken");

  // remove refresh token from db
  const user = await User.findById(req.user._id);
  user.refreshToken = "";
  await user.save({ validateBeforeSave: false });

  // send response
  return res.status(200).json(new ApiResponse(200, null, "User logged out"));
});

export { registerUser, loginUser, logoutUser };
