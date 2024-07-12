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

export async function updateComment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;
      const userData = await request.formData();
      const content = userData.get("content").toString();
      const commentId = request.params.commentId;

      await PostGre.updateComment(commentId, content);
      const updatedComments = await PostGre.getVideoComments(videoId);
      await Redis.set(`comments:${videoId}`, updatedComments);
      return new Response(200, "Comment updated Successfully", videoId);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Video Comments",
        error
      );
    }
  });
}

app.http("updateComment", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "comment/updateComment/{videoId}/{commentId}",
  handler: updateComment,
});
