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
  async connect() {
    return await this.client.connect();
  }
  async close() {
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
}

export default MongoService;
