import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import MongoDBService from "../../services/mongo/mongoDBService";

const Firebase: FirebaseService = new FirebaseService();

const MongoDB: MongoDBService = new MongoDBService();

export async function getAllVideos(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    if(request.queryParams && request.query.getAll) {}
    return new Response(200, "All Videos", videos);
  } catch (error) {
    return new Response(500, "Failed To Get All Videos", error);
  }
}

export async function getVideoById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return Firebase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;
      const video = await MongoDB.getVideoById(videoId);
      return new Response(200, "Video published", video);
    } catch (error) {
      return new Response(500, "Failed to publish video", error);
    }
  });
}

app.http("getAllVideos", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/getAllVideos",
  handler: getAllVideos,
});

app.http("getVideoById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/getVideoById/{videoId}",
  handler: getVideoById,
});
