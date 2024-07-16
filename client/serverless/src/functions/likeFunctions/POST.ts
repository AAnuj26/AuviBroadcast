import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import { AzureBlobService } from "../../services/azure/AzureService";

import FirebaseService from "../../services/firebase/FireBaseService";

import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

import RedisService from "../../services/redis/RedisService";

const Redis = new RedisService();

const PostGre: PostGresSqlService = new PostGresSqlService();

const AzureBlob = new AzureBlobService();

const FireBase = new FirebaseService();

export async function toggleVideoLike(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await FireBase.getCurrentUser();

    const uid: string = user.uid;
    const videoId: string = request.params.videoId;

    const videoLike: any = await PostGre.toggleVideoLike(videoId, uid);
    console.log("VideoLike -> \n", videoLike);

    if (videoLike instanceof Error) {
      return new Response(
        500,
        "Internal Server Error While Liking The Video",
        videoLike
      );
    }

    if (videoLike) {
      const cache = await PostGre.getLikedVideos(uid);
      await Redis.set(`likedVideos:${uid}`, cache);
      return new Response(
        200,
        "Video Liked"
        // await PostGre.getLikedVideos(uid)
      );
    } else {
      const cache = await PostGre.getLikedVideos(uid);
      await Redis.set(`likedVideos:${uid}`, cache);
      return new Response(
        200,
        "Video Unliked"
        // await PostGre.getLikedVideos(uid)
      );
    }
  } catch (error) {
    return new Response(
      500,
      "Internal Server Error While Liking The Video",
      error
    );
  }
}

export async function toggleCommentLike(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();

      const uid: string = user.uid;
      const commentId: string = request.params.commentId;

      const commentLike: boolean = await PostGre.toggleCommentLike(
        commentId,
        uid
      );

      if (commentLike) {
        const cache = await PostGre.getLikedComments(uid);
        await Redis.set(`likedComments:${uid}`, cache);
        return new Response(200, "Comment Liked");
      } else {
        const cache = await PostGre.getLikedComments(uid);
        await Redis.set(`likedComments:${uid}`, cache);
        return new Response(200, "Comment Unliked");
      }
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Liking The Video",
        error
      );
    }
  });
}

app.http("toggleVideoLike", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "like/togglevideolike/{videoId}",
  handler: toggleVideoLike,
});

app.http("toggleCommentLike", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "like/toggleCommentLike/{commentId}",
  handler: toggleCommentLike,
});
