import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import MongoService from "../../services/mongo/MongoDBService";

import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

import RedisService from "../../services/redis/RedisService";

import AwsService from "../../services/aws/AwsService";

import CloudinaryService from "../../services/cloudinary/CloudinaryService";

const Cloudinary = new CloudinaryService();

const Aws: AwsService = new AwsService();

const FireBase: FirebaseService = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

const Mongo: MongoService = new MongoService();

const Redis: RedisService = new RedisService();

export async function togglePublishStatus(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;

      const video = await Mongo.findVideoById(videoId);

      if (video instanceof Error || !video || video.length === 0) {
        return new Response(404, "Video Not Found", []);
      }

      const user = await FireBase.getCurrentUser();

      const authorized = await Mongo.isUserVideoOwner(videoId, user.uid);

      if (authorized instanceof Error || !authorized) {
        return new Response(401, "Unauthorized", []);
      }

      const updatedVideo = await Mongo.updateVideoPublication(videoId, video);

      if (updatedVideo instanceof Error) {
        return new Response(
          500,
          "Internal Server Error While Toggling Publish Status",
          updatedVideo
        );
      }

      return new Response(200, "Video Publish Status Toggled", updatedVideo);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Toggling Publish Status",
        error
      );
    }
  });
}

export async function publishAVideo(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const data = await request.formData();
      const title = data.get("title");
      const description = data.get("description");

      const user = await FireBase.getCurrentUser();

      let videoUrl: string;
      let thumbnailUrl: string;
      for (const [key, value] of data.entries()) {
        if (value instanceof Blob) {
          if (key === "video") {
            const VideoName = `S3-${key}-${Date.now()}-blob.mp4`;
            const VideoData = await value.arrayBuffer().then((buffer) => {
              return Buffer.from(buffer);
            });

            const uploadVideo = await Aws.uploadFile(VideoName, VideoData);

            videoUrl = uploadVideo.url;
          } else if (key === "thumbnail") {
            const ThumbnailName = `${key}-thumbnail-${Date.now()}-blob.jpg`;
            const ThumbnailData = await value.arrayBuffer().then((buffer) => {
              return Buffer.from(buffer);
            });

            const uploadThumbnail = await Cloudinary.uploadImageFromBuffer(
              ThumbnailName,
              ThumbnailData
            );

            thumbnailUrl = uploadThumbnail.url;
          }
        }
      }
      const newVideo = await Mongo.createVideo({
        videoFile: videoUrl,
        thumbnail: thumbnailUrl,
        title: title,
        description: description,
        duration: 0,
        isPublished: true,
        owner: user.uid,
      });

      if (newVideo instanceof Error) {
        return new Response(
          500,
          "Internal Server Error While Publishing A Video",
          newVideo
        );
      }

      return new Response(200, "Video Published", newVideo);

      // const thumbnail = data.get("thumbnail");

      // if(video.value.size > 100000000) {
      //   return new Response(400, "Video Size Too Large", []);
      // }
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Publishing A Video",
        error
      );
    }
  });
}

app.http("togglePublishStatus", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "video/togglePublishStatus/{videoId}",
  handler: togglePublishStatus,
});

app.http("publishAVideo", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "video/publishAVideo",
  handler: publishAVideo,
});
