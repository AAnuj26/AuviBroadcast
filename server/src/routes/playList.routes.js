import { Router } from "express";
import {
  createPlayList,
  getUserPlayLists,
  getPlayListById,
} from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlayList);

router.route("/:playListId").get(getPlayListById);

router.route("/user/:userId").get(getUserPlayLists);

export default router;
