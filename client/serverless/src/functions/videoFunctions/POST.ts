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

      const user = await FireBase.getCurrentUser();

      const authorized = await Mongo.isUserVideoOwner(videoId, user.uid);

      if (!authorized) {
        return new Response(401, "Unauthorized", []);
      }

      const updatedVideo = await Mongo.updateVideo(videoId, video);

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

app.http("togglePublishStatus", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "video/togglePublishStatus/{videoId}",
  handler: togglePublishStatus,
});
