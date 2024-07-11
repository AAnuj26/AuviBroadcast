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

export async function createPlaylist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const userData = await request.formData();
      const name = userData.get("name").toString();
      const description = userData.get("description").toString();
      const user = await FireBase.getCurrentUser();

      await Mongo.connect();

      const playlist = {
        name: name,
        description: description,
        owner: user.uid,
        videos: [],
      };

      const playlistData = await Mongo.playlist.insertOne(playlist);

      if (playlistData instanceof Error) {
        return new Response(400, "Error Creating A Playlist", playlistData);
      }

      await Redis.set(`playlist:${playlistData._id}`, playlist);

      await Mongo.close();

      return new Response(200, "Playlist Created Successfully", playlist);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Creating Playlist",
        error
      );
    }
  });
}

app.http("createPlaylist", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "playlist/createplaylist",
  handler: createPlaylist,
});
