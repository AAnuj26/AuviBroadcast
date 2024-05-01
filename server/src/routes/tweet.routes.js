import { Router } from "express";
import { createTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet);

export default router;
