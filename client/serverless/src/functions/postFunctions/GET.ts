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

export async function getUserPosts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();
      const posts = await PostGre.getUserPosts(user.uid);
      return new Response(200, "Posts Retrieved Successfully", posts);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Posts",
        error
      );
    }
  });
}

app.http("getUserPosts", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "post/getUserPosts",
  handler: getUserPosts,
});
