import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  getVideoComments,
  addComment,
} from "../controllers/comment.controller";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment);
