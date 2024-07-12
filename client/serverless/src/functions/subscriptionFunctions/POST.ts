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

export async function toggleSubscription(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await FireBase.getCurrentUser();

    const uid: string = user.uid;
    const channelId = request.params.channelId;

    const subscription: boolean = await PostGre.toggleSubscription(
      uid,
      channelId
    );

    if (subscription) {
      const subscribers = await PostGre.getSubscribers(channelId);
      await Redis.set(`subscribers:${channelId}`, subscribers);
      const subscriptions = await PostGre.getSubscriptions(uid);
      await Redis.set(`subscriptions:${uid}`, subscriptions);

      return new Response(200, "Subscribed Successfully");
    } else {
      const subscribers = await PostGre.getSubscribers(channelId);
      await Redis.set(`subscribers:${channelId}`, subscribers);
      const subscriptions = await PostGre.getSubscriptions(uid);
      await Redis.set(`subscriptions:${uid}`, subscriptions);

      return new Response(200, "Unsubscribed Successfully");
    }
  } catch (error) {
    return new Response(
      500,
      "Internal Server Error While Liking The Video",
      error
    );
  }
}

app.http("toggleSubscription", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "subscription/togglesubscription/{channelId}",
  handler: toggleSubscription,
});
