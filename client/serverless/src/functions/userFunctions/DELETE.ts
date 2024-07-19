import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import FirebaseService from "../../services/firebase/FireBaseService";

const FireBase = new FirebaseService();

export async function deleteUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();

      if (user instanceof Error) {
        return {
          jsonBody: {
            status: 403,
            message: "Forbidden To Delete User",
          },
        };
      } else {
        if (!user.uid) {
          return {
            jsonBody: {
              status: 403,
              message: "Forbidden To Delete User",
            },
          };
        } else {
          await FireBase.deleteUser(user.uid);
          await FireBase.logoutUser();
          return {
            jsonBody: {
              status: 200,
              message: "Deleted User Successfully",
            },
          };
        }
      }
    } catch (error) {
      return {
        jsonBody: {
          status: 500,
          message: "Internal Server Error While Deleting User",
        },
      };
    }
  });
}

app.http("deleteUser", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "user/deleteuser",
  handler: deleteUser,
});
