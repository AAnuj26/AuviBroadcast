import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import FirebaseService from "../../services/firebase/FireBaseService";

import MongoService from "../../services/mongo/MongoDBService";

import PostGresSqlService from "../../services/postGreSqlService/PostGreSqlService";

import RedisService from "../../services/redis/RedisService";

const FireBase: FirebaseService = new FirebaseService();

const PostGre: PostGresSqlService = new PostGresSqlService();

const Mongo: MongoService = new MongoService();

const Redis: RedisService = new RedisService();

export async function getUserPlaylists(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const user = await FireBase.getCurrentUser();

      // const cachedPlaylists = await Redis.get(`playlists:${user.uid}`);
      // if (cachedPlaylists) {
      //   return new Response(200, "User Playlists", cachedPlaylists);
      // }

      const result = await Mongo.findUserPlaylists(user.uid);
      // await Redis.set(`playlists:${result._id}`, result);

      return new Response(200, "User Playlists", result);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Video Comments",
        error
      );
    }
  });
}

export async function getPlaylistById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const playlistId = request.params.playlistId;

      const cachedPlaylist = await Redis.get(`playlist:${playlistId}`);

      if (cachedPlaylist) {
        return new Response(200, "Playlist By Id", cachedPlaylist);
      }

      const playlist = await Mongo.findPlaylistById(playlistId);
      return new Response(200, "Playlist By Id", playlist);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Getting Playlist By Id",
        error
      );
    }
  });
}

app.http("getUserPlaylists", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "playlist/getUserPlaylists",
  handler: getUserPlaylists,
});

app.http("getPlaylistById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "playlist/getPlaylistById/{playlistId}",
  handler: getPlaylistById,
});
