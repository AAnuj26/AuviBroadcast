// import {
//   app,
//   HttpRequest,
//   HttpResponseInit,
//   InvocationContext,
// } from "@azure/functions";

// import Response from "../../utils/Response";

// import FirebaseService from "../../services/firebase/FireBaseService";

// import MongoService from "../../services/mongo/MongoDBService";

// import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

// import RedisService from "../../services/redis/RedisService";

// const FireBase: FirebaseService = new FirebaseService();

// const PostGre: PostGresSqlService = new PostGresSqlService();

// const Mongo: MongoService = new MongoService();

// const Redis: RedisService = new RedisService();

// export async function getVideoById(
//   request: HttpRequest,
//   context: InvocationContext
// ): Promise<HttpResponseInit> {
//   return FireBase.authenticator(request, context, async () => {
//     try {
//       const videoId = request.params.videoId;

//       const video = await Mongo.video.findOne({ _id: videoId });
//       return new Response(200, "Video Retrieved Successfully", video);
//     } catch (error) {
//       return new Response(
//         500,
//         "Internal Server Error While Getting Video",
//         error
//       );
//     }
//   });
// }

// app.http("getVideoById", {
//   methods: ["GET"],
//   authLevel: "anonymous",
//   route: "getVideoById/{videoId}",
//   handler: getVideoById,
// });
