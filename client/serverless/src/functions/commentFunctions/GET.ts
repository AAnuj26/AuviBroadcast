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
      const cachedComments = await Redis.get(`comments:${videoId}`);
      if (cachedComments) {
        return new Response(200, "Video Comments Found", cachedComments);
      }

      const comments = await PostGre.getVideoComments(videoId);

      if (comments instanceof Error) {
        return new Response(403, "PostgreSQL Service Error", comments);
      }
      await Redis.set(`comments:${videoId}`, comments);
      return new Response(200, "Video Comments Found", comments);
      // }
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
