import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

const FireBase = new FirebaseService();

export async function deleteUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      //   const userData = await request.formData();
      //   const uid = userData.get("uid").toString();
      const user = await FireBase.getCurrentUser();

      if (user instanceof Error) {
        return new Response(403, "Forbidden", null);
      } else {
        if (!user.uid) {
          return new Response(403, "Forbidden", null);
        } else {
          await FireBase.deleteUser(user.uid);
          return new Response(200, "User Deleted Successfully", null);
        }
      }
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Deleting user",
        error
      );
    }
  });
}

app.http("deleteUser", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "user/deleteUser",
  handler: deleteUser,
});
