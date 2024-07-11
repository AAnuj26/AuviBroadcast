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

export async function getUserChannelSubscribers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const subscriberId = request.params.subscriberId;
      const subscribers = await PostGre.getUserChannelSubscribers(subscriberId);
      if (!subscribers || subscribers.length === 0) {
        return new Response(200, "No Subscribers Found");
      }
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
      const channelId = request.params.channelId;
      const subscribedChannels = await PostGre.getSubscribedChannels(channelId);
      if (!subscribedChannels || subscribedChannels.length === 0) {
        return new Response(200, "No Subscribers Found");
      }
      return new Response(
        200,
        "All Subscribers Fetched Successfully",
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
  route: "channel/{subscriberId}",
  handler: getUserChannelSubscribers,
});

app.http("getSubscribedChannels", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "channel/{channelId}",
  handler: getSubscribedChannels,
});
