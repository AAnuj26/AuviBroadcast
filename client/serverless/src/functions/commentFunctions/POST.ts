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
      const data = await request.formData();
      const content = data.get("content").toString();
      const user = await FireBase.getCurrentUser();
      const comment = {
        content: content,
        video: videoId,
        owner: user.uid,
      };

      await PostGre.addComment(comment);
      const uploadedComments = await PostGre.getVideoComments(videoId);
      await Redis.set(`comments:${videoId}`, uploadedComments);

      return new Response(200, "Comment Added Successfully", comment);
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
