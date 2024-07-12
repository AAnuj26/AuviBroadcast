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

export async function deleteVideo(
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
      const deletedVideo = await Mongo.deleteVideo(videoId);

      // await PostGre.deleteLikes(videoId);
      // await PostGre.deleteComments(videoId);

      if (deletedVideo instanceof Error) {
        return new Response(
          500,
          "Internal Server Error While Deleting Video",
          deletedVideo
        );
      }

      const deleteVideoFromPlaylist = Mongo.deleteVideoFromPlaylist(videoId);

      if (deleteVideoFromPlaylist instanceof Error) {
        return new Response(
          500,
          "Internal Server Error While Deleting Video",
          deleteVideoFromPlaylist
        );
      }

      return new Response(200, "Video Deleted", deletedVideo);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Deleting Video",
        error
      );
    }
  });
}

app.http("deleteVideo", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "video/deleteVideo/{videoId}",
  handler: deleteVideo,
});
