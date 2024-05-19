import { Router } from "express";

import { toggleSubscription } from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/c/:channelId").post(toggleSubscription);

export default router;
