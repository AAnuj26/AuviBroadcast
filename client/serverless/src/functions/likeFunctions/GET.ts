import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

const FireBase = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

export async function getLikedVideos(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();
      const likedVideos = await PostGre.getLikedVideos(user.uid);
      return new Response(200, "User Found", user);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Deleting user",
        error
      );
    }
  });
}

app.http("getLikedVideos", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "videos/getLikedVideos",
  handler: getLikedVideos,
});
