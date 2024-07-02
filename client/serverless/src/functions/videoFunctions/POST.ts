import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

const Firebase: FirebaseService = new FirebaseService();

export async function publishVideo(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const videoData = await request.formData();
  const title = videoData.get("title");
  const description = videoData.get("description");

  if (!title || !description) {
    return new Response(400, "Title and description are required", null);
  }
  

  

  return;
}

app.http("publishVideo", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users/publishVideo",
  handler: publishVideo,
});
