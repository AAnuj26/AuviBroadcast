import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnailFile", maxCount: 1 },
    ]),
    publishAVideo
  );
router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnailFile"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
