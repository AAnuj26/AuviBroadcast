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

export async function addVideoInPlaylist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;
      const playlistId = request.params.playlistId;

      const user = await FireBase.getCurrentUser();
      const isOwner = await Mongo.isUserOwnerOfPlaylist(playlistId, user.uid);

      if (!isOwner) {
        return new Response(400, "User Is Not Owner Of Playlist", null);
      }

      const video = await Mongo.findVideoById(videoId);

      //   console.log("Video ->\n", video);

      const cachedPlaylist = await Redis.get(`playlist:${playlistId}`);

      //   console.log("CachedPlayList ->\n", cachedPlaylist);

      if (cachedPlaylist) {
        const isVideoInplayList = await Mongo.findVideoByIdInPlaylist(
          playlistId,
          videoId
        );
        // console.log("Cached IsVideoInPlaylist ->\n", isVideoInplayList);
        if (isVideoInplayList) {
          return new Response(400, "Video Already In Playlist", null);
        }
        const addedPlaylist = await Mongo.addVideosInPlaylist(
          playlistId,
          video
        );
        if (addedPlaylist instanceof Error) {
          return new Response(
            400,
            "Error Adding Video In Playlist",
            addedPlaylist
          );
        }
        const updatedPlaylist = await Mongo.findPlaylistById(playlistId);
        await Redis.set(`playlist:${playlistId}`, updatedPlaylist);

        return new Response(200, "Video Added In Playlist Successfully");
      }

      const playlist = await Mongo.findPlaylistById(playlistId);

      //   console.log("Playlist ->\n", playlist);

      if (playlist instanceof Error) {
        return new Response(400, "Error Finding Playlist", playlist);
      }

      const isVideoInplayList = await Mongo.findVideoByIdInPlaylist(
        playlistId,
        videoId
      );

      if (isVideoInplayList) {
        return new Response(400, "Video Already In Playlist", null);
      }

      const addedPlaylist = await Mongo.addVideosInPlaylist(playlistId, video);
      if (addedPlaylist instanceof Error) {
        return new Response(
          400,
          "Error Adding Video In Playlist",
          addedPlaylist
        );
      }
      const updatedPlaylist = await Mongo.findPlaylistById(playlistId);

      await Redis.set(`playlist:${playlistId}`, updatedPlaylist);

      return new Response(200, "Video Added In Playlist Successfully");
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Adding Video In Playlist",
        error
      );
    }
  });
}

export async function removeVideoFromPlaylist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const videoId = request.params.videoId;
      const playlistId = request.params.playlistId;

      const user = await FireBase.getCurrentUser();

      const isOwner = await Mongo.isUserOwnerOfPlaylist(playlistId, user.uid);

      if (!isOwner) {
        return new Response(400, "User Is Not Owner Of Playlist", null);
      }

      const video = await Mongo.findVideoById(videoId);

      if (!video || video instanceof Error) {
        return new Response(400, "Error Finding Video", video);
      }

      //  if(!video?.isPublished){
      //  }

      await Mongo.removeVideoFromPlaylist(playlistId, videoId);

      const updatedPlaylist = await Mongo.findPlaylistById(playlistId);

      await Redis.set(`playlist:${playlistId}`, updatedPlaylist);

      return new Response(200, "Video Removed From Playlist Successfully");
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Removing Video From Playlist",
        error
      );
    }
  });
}

export async function updatePlaylist(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const playlistId = request.params.playlistId;
      const data = await request.formData();
      const name = data.get("name").toString();
      const description = data.get("description").toString();

      const updatePlaylist = await Mongo.updatePlaylist(
        playlistId,
        name,
        description
      );

      if (updatePlaylist instanceof Error) {
        return new Response(400, "Error Updating Playlist", updatePlaylist);
      }

      return new Response(200, "Playlist Updated Successfully");
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Updating Playlist",
        error
      );
    }
  });
}

app.http("addVideoInPlaylist", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "playlist/addVideoInPlaylist/{videoId}/{playlistId}",
  handler: addVideoInPlaylist,
});

app.http("removeVideoFromPlaylist", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "playlist/removeVideoFromPlaylist/{videoId}/{playlistId}",
  handler: removeVideoFromPlaylist,
});

app.http("updatePlaylist", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  route: "playlist/updatePlaylist/{playlistId}",
  handler: updatePlaylist,
});
