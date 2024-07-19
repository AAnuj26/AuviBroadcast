import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import FirebaseService from "../../services/firebase/FireBaseService";

const FireBase = new FirebaseService();

export async function getCurrentUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();
      return {
        jsonBody: {
          status: 200,
          message: "User Found",
          data: user,
        },
      };
    } catch (error) {
      return {
        jsonBody: {
          status: 500,
          message: "Internal Server Error While Getting User",
        },
      };
    }
  });
}

app.http("getCurrentUser", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/getCurrentUser",
  handler: getCurrentUser,
});
