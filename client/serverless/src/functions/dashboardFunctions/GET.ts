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

export async function getChannelStats(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      await Mongo.connect();
      const user = await FireBase.getCurrentUser();
      const allVideos = await Mongo.video.find({ owner: user.uid }).toArray();
      const likesOnVideos = await PostGre.getLikesOnVideos(allVideos);
      const dislikesOnVideos = await PostGre.getAllDislikesOnVideos(allVideos);

      const content = {
        user,
        allVideos,
        likesOnVideos,
        dislikesOnVideos,
      };

      return new Response(200, "Video Stats Retrieved Successfully", content);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Video",
        error
      );
    }
  });
}

app.http("getChannelStats", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "dashboard/getChannelStats",
  handler: getChannelStats,
});
