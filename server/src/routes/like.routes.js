import { Router } from "express";
import { toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);

export default router;
