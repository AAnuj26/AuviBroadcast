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

import AwsService from "../../services/aws/AwsService";

import CloudinaryService from "../../services/cloudinary/CloudinaryService";

const Cloudinary = new CloudinaryService();

const Aws: AwsService = new AwsService();

const FireBase: FirebaseService = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

const Mongo: MongoService = new MongoService();

const Redis: RedisService = new RedisService();

export async function createPost(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
    } catch (error) {
      return new Response(500, "Internal Server Error While Posting", error);
    }
  });
}

app.http("createPost", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "video/createpost",
  handler: createPost,
});
