import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

// import RedisService from "../../services/redis/RedisService";

const FireBase: FirebaseService = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

// const Redis: RedisService = new RedisService();

export async function deleteComment(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // return FireBase.authenticator(request, context, async () => {
  try {
    const videoId = request.params.videoId;
    const commentId = request.params.commentId;

    await PostGre.deleteComment(commentId);
    // const cachedComments = await Redis.get(videoId);
    // if (cachedComments.length === 1) {
    //   // await Redis.delete(videoId);
    // } else {
    //   await Redis.set(
    //     videoId,
    //     JSON.stringify(await PostGre.getVideoComments(videoId))
    //   );
    // }
    return new Response(200, "Comment Deleted Successfully", null);
  } catch (error) {
    return new Response(
      500,
      "Internal Server Error While Getting Video Comments",
      error
    );
  }
  // });
}

app.http("deleteComment", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "comment/deleteComment/{videoId}/{commentId}",
  handler: deleteComment,
});
