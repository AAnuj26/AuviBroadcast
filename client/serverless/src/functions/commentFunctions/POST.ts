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

export async function addComment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;
      const userData = await request.formData();
      const content = userData.get("content").toString();
      const owner = userData.get("owner").toString();
      const comment = {
        content: content,
        video: videoId,
        owner: owner,
      };
      await PostGre.addComment(comment);

      //Redis Cache
      const existingComments = await Redis.get(videoId);
      let comments = [];
      if (existingComments.length > 0) {
        comments = JSON.parse(existingComments);
      }
      comments.push(comment);
      await Redis.set(videoId, JSON.stringify(comments));
      return new Response(200, "Comment Added Successfully", null);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Video Comments",
        error
      );
    }
  });
}

app.http("addComment", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "comment/addComment/{videoId}",
  handler: addComment,
});
