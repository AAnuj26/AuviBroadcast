import { Router } from "express";
import { createTweet, getUserTweets } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);

export default router;
