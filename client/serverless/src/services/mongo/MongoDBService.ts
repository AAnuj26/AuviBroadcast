import { MongoClient, ObjectId } from "mongodb";
import { AzureKeyVaultService } from "../../services/azure/AzureService";

const AzureKeyVault = new AzureKeyVaultService();

class MongoService {
  private client: MongoClient;
  public playlist: any;
  public video: any;
  constructor() {
    this.initialize();
  }

  private async initialize() {
    const uri = await AzureKeyVault.getSecret("mongoConnectionString");
    this.client = new MongoClient(uri);
    this.playlist = this.client.db("auvi").collection("playlist");
    this.video = this.client.db("auvi").collection("video");
  }

  private async connect() {
    return await this.client.connect();
  }

  private async close() {
    return await this.client.close();
  }

  public async isUserOwnerOfPlaylist(playlistId: string, uid: string) {
    try {
      await this.connect();
      const playlist = await this.playlist.findOne({ _id: playlistId });
      if (playlist.owner === uid) {
        await this.close();
        return true;
      }
      await this.close();
      return false;
    } catch (error) {
      return error;
    }
  }

  public async findVideoById(videoId: string) {
    try {
      await this.connect();
      const video = await this.video.findOne({ _id: new ObjectId(videoId) });
      await this.close();
      return video;
    } catch (error) {
      return error;
    }
  }

  public async findUserPlaylists(uid: string) {
    try {
      await this.connect();
      const pipeline = [
        {
          $match: {
            owner: uid,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            owner: 1,
            createdAt: 1,
            updatedAt: 1,
            videos: {
              $cond: {
                if: { $eq: ["$owner", uid] },
                then: "$videos",
                else: {
                  $filter: {
                    input: "$videos",
                    as: "video",
                    cond: {
                      $eq: ["$$video.isPublished", true],
                    },
                  },
                },
              },
            },
          },
        },
      ];
      const result = await this.playlist.aggregate(pipeline).toArray();
      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }
  public async findPlaylistById(playlistId: string) {
    try {
      await this.connect();
      const playlist = await this.playlist.findOne({
        _id: new ObjectId(playlistId),
      });
      await this.close();
      return playlist;
    } catch (error) {
      return error;
    }
  }
  public async findVideoByIdInPlaylist(playlistId: string, videoId: string) {
    try {
      await this.connect();
      //taxing query needs change
      const playlist = await this.playlist.findOne({
        _id: new ObjectId(playlistId),
        videos: { $elemMatch: { _id: new ObjectId(videoId) } },
      });
      await this.close();
      return playlist ? true : false;
    } catch (error) {
      return error;
    }
  }

  public async addVideosInPlaylist(playlistId: string, video: any) {
    try {
      await this.connect();
      const result = await this.playlist.updateOne(
        { _id: new ObjectId(playlistId) },
        {
          $push: { videos: video },
        }
      );
      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }

  public async removeVideoFromPlaylist(playlistId: string, videoId: string) {
    try {
      await this.connect();
      const result = await this.playlist.updateOne(
        { _id: new ObjectId(playlistId) },
        {
          $pull: { videos: { _id: new ObjectId(videoId) } },
        }
      );
      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }

  public async updatePlaylist(
    playlistId: string,
    name: string,
    description: string
  ) {
    try {
      await this.connect();
      const result = await this.playlist.updateOne(
        { _id: new ObjectId(playlistId) },
        {
          $set: { name: name, description: description },
        }
      );
      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }
  public async deletePlaylist(playlistId: string) {
    try {
      await this.connect();
      const result = await this.playlist.deleteOne({
        _id: new ObjectId(playlistId),
      });
      console.log("Result ->\n", result);
      await this.close();
      return result.deletedCount == 1 ? true : false;
    } catch (error) {
      return error;
    }
  }

  /*--------------------------------------------------*/

  public async isUserVideoOwner(videoId: any, uid: string) {
    try {
      await this.connect();
      const video = await this.video.findOne({ _id: videoId });
      if (video.owner === uid) {
        await this.close();
        return true;
      }
      await this.close();
      return false;
    } catch (error) {
      return error;
    }
  }

  public async getAllUserVideos(uid: string) {
    try {
      await this.connect();
      const result = await this.video.find({ owner: uid }).toArray();
      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }

  public async getAllVideos(
    // page: number,
    limit: number,
    query: string,
    uid?: string
  ) {
    try {
      // console.log("Checking Parameters\nuid ->\n", uid);
      // console.log("page ->\n", page);
      // console.log("limit ->\n", limit);
      // console.log("query ->\n", query);

      await this.connect();
      const videos = await this.video
        .find({
          $or: [{ published: true }, { published: false, userId: uid }],
          $and: [{ title: { $regex: query, $options: "i" } }],
        })
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();
      // const pipeline = [];
      // console.log("Pipeline ->\n", pipeline);

      // if (uid) {
      //   pipeline.push({
      //     $match: {
      //       owner: new ObjectId(uid),
      //     },
      //   });
      //   console.log("uid pipe ->\n", pipeline);
      // }
      // if (query) {
      //   pipeline.push({
      //     $match: {
      //       $text: {
      //         $search: query,
      //       },
      //     },
      //   });
      //   console.log("query pipe ->\n", pipeline);
      // }

      // const sortCriteria = {};

      // sortCriteria["createdAt"] = -1;
      // pipeline.push({
      //   $sort: -1,
      // });

      // pipeline.push({
      //   $skip: (page - 1) * limit,
      // });
      // pipeline.push({
      //   $limit: limit,
      // });

      // const videos = await this.video.aggregate(pipeline).toArray();

      // console.log("Videos ->\n", videos);

      await this.close();
      return videos;
    } catch (error) {
      return error;
    }
  }

  public async createVideo(video: any) {
    try {
      await this.connect();
      const result = await this.video.insertOne(video);
      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }

  public async updateVideoPublication(videoId: string, video: any) {
    try {
      await this.connect();
      const result = await this.video.updateOne(
        { _id: new ObjectId(videoId) },
        {
          $set: {
            isPublished: !video.isPublished,
          },
        },
        { new: true }
      );

      await this.close();
      return result;
    } catch (error) {
      return error;
    }
  }

  public async updateVideoDetails(
    videoId: string,
    title,
    description,
    thumbnailUrl
  ) {
    try {
      await this.connect();
      const updatedVideo = await this.video.updateOne(
        { _id: new ObjectId(videoId) },
        {
          $set: {
            title: title,
            description: description,
            thumbnail: thumbnailUrl,
          },
        },
        {
          new: true,
        }
      );
      await this.close();
      return updatedVideo;
    } catch (error) {
      return error;
    }
  }

  public async deleteVideo(videoId: string) {
    try {
      await this.connect();
      const result = await this.video.deleteOne({ _id: new ObjectId(videoId) });
      await this.close();
      return result.deletedCount >= 1 ? true : false;
    } catch (error) {
      return error;
    }
  }
  public async deleteVideoFromPlaylist(videoId: string) {
    try {
      await this.connect();
      const result = await this.playlist.find({
        videos: new ObjectId(videoId),
      });
      for (const playlist of result) {
        await result.findByIdAndUpdate(
          playlist._id,
          {
            $pull: { videos: videoId },
          },
          {
            new: true,
          }
        );
      }
      await this.close();
      return true;
    } catch (error) {
      return error;
    }
  }
}

export default MongoService;
