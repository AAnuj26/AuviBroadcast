import { Router } from "express";
import {
  createPlayList,
  getUserPlayLists,
  getPlayListById,
  addVideoToPlayList,
  removeVideoFromPlaylist,
} from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlayList);

router.route("/:playListId").get(getPlayListById);

router.route("/add/:videoId/:playListId").patch(addVideoToPlayList);

router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlayLists);

export default router;
