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

export async function getUserChannelSubscribers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const channelId = request.params.channelId;

      const cache = await Redis.get(`subscribers:${channelId}`);

      if (cache) {
        return new Response(200, "All Subscribers Fetched Successfully", cache);
      }

      const subscribers = await PostGre.getSubscribers(channelId);
      if (!subscribers || subscribers.length === 0) {
        return new Response(200, "No Subscribers Found");
      }

      await Redis.set(`subscribers:${channelId}`, subscribers);

      return new Response(
        200,
        "All Subscribers Fetched Successfully",
        subscribers
      );
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Subscribing",
        error
      );
    }
  });
}

export async function getSubscribedChannels(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const subscriberId = request.params.subscriberId;

      const cache = await Redis.get(`subscriptions:${subscriberId}`);

      if (cache) {
        return new Response(200, "All Subscribers Fetched Successfully", cache);
      }

      const subscribedChannels = await PostGre.getSubscriptions(subscriberId);
      if (!subscribedChannels || subscribedChannels.length === 0) {
        return new Response(200, "No Subscribers Found");
      }

      await Redis.set(`subscriptions:${subscriberId}`, subscribedChannels);

      return new Response(
        200,
        "All Subscriptions Fetched Successfully",
        subscribedChannels
      );
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Subscribing",
        error
      );
    }
  });
}

app.http("getUserChannelSubscribers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "subscription/getUserChannelSubscribers/{channelId}",
  handler: getUserChannelSubscribers,
});

app.http("getSubscribedChannels", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "subscription/getSubscribedChannels/{subscriberId}",
  handler: getSubscribedChannels,
});
