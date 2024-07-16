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

const Redis = new RedisService();

const FireBase = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

export async function getLikedVideos(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();

      const cache = await Redis.get(`likedVideos:${user.uid}`);

      if (cache) {
        return new Response(200, "Videos Liked By User", cache);
      }

      const likedVideos = await PostGre.getLikedVideos(user.uid);

      await Redis.set(`likedVideos:${user.uid}`, likedVideos);

      return new Response(200, "Videos Liked By User", likedVideos);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Videos Liked By User",
        error
      );
    }
  });
}

export async function getCommentLikes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      // const commentId = request.params.commentId;
      // const user = await FireBase.getCurrentUser();
      // const cache = await Redis.get(`commentLikes:${commentId}`);
      // if (cache) {
      //   return new Response(
      //     200,
      //     "Likes On Comment Fetched Successfully",
      //     cache
      //   );
      // }
      // const commentLikes = await PostGre.getCommentLikes(commentId);
      // await Redis.set(`commentLikes:${commentId}`, commentLikes);
      // return new Response(200, "Comment Likes", commentLikes);

      const commentId = request.params.commentId;

      // const user = await FireBase.getCurrentUser();

      // const cache = await Redis.get(`commentLikes:${commentId}`);
      // if (cache) {
      //   return new Response(
      //     200,
      //     "Likes On Comment Fetched Successfully",
      //     cache
      //   );
      // }

      const commentLikes = await PostGre.getLikesOnComment(commentId);

      if (commentLikes instanceof Error) {
        return new Response(
          500,
          "Internal Server Error While Getting Likes On Comment",
          commentLikes
        );
      }

      return new Response(200, "Likes On Comment Fetched Successfully", {
        commentLikes,
      });
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Comments Liked By User",
        error
      );
    }
  });
}

app.http("getLikedVideos", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "like/getLikedVideos",
  handler: getLikedVideos,
});

app.http("getCommentLikes", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "like/getCommentLikes/{commentId}",
  handler: getCommentLikes,
});
