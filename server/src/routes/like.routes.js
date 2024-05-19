import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  getLikedVideos,
  toggleTweetLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
// import { get } from "mongoose";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;
