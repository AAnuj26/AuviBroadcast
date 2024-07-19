// import {
//   app,
//   HttpRequest,
//   HttpResponseInit,
//   InvocationContext,
// } from "@azure/functions";

// import Response from "../../utils/Response";

// import FirebaseService from "../../services/firebase/FireBaseService";

// const FireBase = new FirebaseService();

// export async function getCurrentUser(
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> {
//   return FireBase.authenticator(request, context, async () => {
//     try {
//       const user = await FireBase.getCurrentUser();
//       return new Response(200, "User Found", user);
//     } catch (error) {
//       return new Response(
//         500,
//         "Internal Server Error While Deleting user",
//         error
//       );
//     }
//   });
// }

// app.http("getCurrentUser", {
//   methods: ["GET"],
//   authLevel: "anonymous",
//   route: "user/getCurrentUser",
//   handler: getCurrentUser,
// });
