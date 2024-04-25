import { Router } from "express";
import {
  createPlayList,
  getUserPlayLists,
  getPlayListById,
  addVideoToPlayList,
  removeVideoFromPlayList,
  updatePlayList,
  deletePlayList,
} from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlayList);

router
  .route("/:playListId")
  .get(getPlayListById)
  .patch(updatePlayList)
  .delete(deletePlayList);

router.route("/add/:videoId/:playListId").patch(addVideoToPlayList);

router.route("/remove/:videoId/:playListId").patch(removeVideoFromPlayList);

router.route("/user/:userId").get(getUserPlayLists);

export default router;
