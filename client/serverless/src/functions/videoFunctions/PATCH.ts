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

import CloudinaryService from "../../services/cloudinary/CloudinaryService";

const FireBase: FirebaseService = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

const Mongo: MongoService = new MongoService();

const Redis: RedisService = new RedisService();

const Cloudinary: CloudinaryService = new CloudinaryService();

export async function updateVideo(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const data = await request.formData();
      const videoId = request.params.videoId;

      const video = await Mongo.findVideoById(videoId);

      if (video instanceof Error || !video || video.length === 0) {
        return new Response(404, "Video Not Found", []);
      }

      const user = await FireBase.getCurrentUser();

      const authorized = await Mongo.isUserVideoOwner(videoId, user.uid);

      if (!authorized) {
        return new Response(401, "Unauthorized", []);
      }

      const title = data.get("title");

      const description = data.get("description");

      let thumbnail: string;

      for (const [key, value] of data.entries()) {
        if (value instanceof Blob) {
          const ThumbnailName = `${key}-thumbnail-${Date.now()}-blob.jpg`;
          const buffer = await value.arrayBuffer().then((buffer) => {
            return Buffer.from(buffer);
          });

          const uploadThumbnail = await Cloudinary.uploadImageFromBuffer(
            ThumbnailName,
            buffer
          );
          thumbnail = uploadThumbnail.url;
        }
      }

      const updatedVideo = await Mongo.updateVideoDetails(
        videoId,
        title,
        description,
        thumbnail
      );

      if (updatedVideo instanceof Error) {
        return new Response(
          500,
          "Internal Server Error While Updating Video",
          updatedVideo
        );
      }

      return new Response(200, "Video Updated", updatedVideo);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Updating Video",
        error
      );
    }
  });
}

app.http("updateVideo", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "video/updateVideo/{videoId}",
  handler: updateVideo,
});
