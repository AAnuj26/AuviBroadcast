import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import MongoService from "../../services/mongo/MongoDBService";

import RedisService from "../../services/redis/RedisService";

const FireBase: FirebaseService = new FirebaseService();

const Mongo: MongoService = new MongoService();

const Redis: RedisService = new RedisService();

export async function deletePlaylist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const playlistId = request.params.playlistId;
      const deletePlaylist = await Mongo.deletePlaylist(playlistId);
      if (deletePlaylist) {
        await Redis.delete(`playlist:${playlistId}`);
        return new Response(200, "Playlist Deleted Successfully");
      } else {
        return new Response(400, "No Such Playlist", null);
      }

      //   return new Response(200, "Playlist Deleted Successfully");
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Deleting Playlist",
        error
      );
    }
  });
}

app.http("deletePlaylist", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "playlist/deleteplaylist/{playlistId}",
  handler: deletePlaylist,
});
