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

export async function getAllVideos(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      let page = request.query.get("page") || 1;
      let limit = request.query.get("limit") || 10;
      let query = request.query.get("query") || "";

      page = parseInt(page.toString(), 10);
      limit = parseInt(limit.toString(), 10);

      page = Math.max(1, page);
      limit = Math.min(20, Math.max(1, limit));

      const user = await FireBase.getCurrentUser();

      const videos = await Mongo.getAllVideos(page, limit, query, user.uid);

      if (videos.length === 0) {
        return new Response(404, "No Videos Found", []);
      }

      return new Response(200, "Videos Found", videos);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting All Videos",
        error
      );
    }
  });
}

export async function getVideoById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;

      const video = await Mongo.findVideoById(videoId);

      const user = await FireBase.getCurrentUser();

      if (!video) {
        return new Response(404, "No Video Found", []);
      }
      if (
        !video ||
        (!video?.isPublished &&
          !(video?.owner.toString() === user.uid.toString()))
      ) {
        return new Response(404, "No Video Found", []);
      }

      return new Response(200, "Video Found", video);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Video By Id",
        error
      );
    }
  });
}

app.http("getAllVideos", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "video/getAllVideos",
  handler: getAllVideos,
});

app.http("getVideoById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "video/getVideoById/{videoId}",
  handler: getVideoById,
});
