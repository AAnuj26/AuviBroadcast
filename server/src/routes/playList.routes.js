import { Router } from "express";
import {
  createPlayList,
  getUserPlayLists,
} from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlayList);

router.route("/user/:userId").get(getUserPlayLists);

export default router;
