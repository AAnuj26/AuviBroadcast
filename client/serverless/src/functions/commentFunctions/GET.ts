import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

import RedisService from "../../services/redis/RedisService";

const FireBase: FirebaseService = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

const Redis: RedisService = new RedisService();

export async function getVideoComments(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;
      const cachedComments = await Redis.get(videoId);
      if (cachedComments.length > 0) {
        return new Response(200, "Video Comments Found", cachedComments);
      } else {
        const comments = await PostGre.getVideoComments(videoId);
        return new Response(200, "Video Comments Found", comments);
      }
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Video Comments",
        error
      );
    }
  });
}

app.http("getVideoComments", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "comment/getVideoComments/{videoId}",
  handler: getVideoComments,
});
