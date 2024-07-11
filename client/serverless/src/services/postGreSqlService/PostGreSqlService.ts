import { neon } from "@neondatabase/serverless";

import { AzureKeyVaultService } from "../../services/azure/AzureService";
import { getUserChannelSubscribers } from "../../functions/subscriptionFunctions/GET";

const AzureKeyVault = new AzureKeyVaultService();

type Comment = {
  content: string;
  video: string;
  owner: string;
};

class PostGresSqlService {
  private sql: any;
  constructor() {
    // this.sql = null;
    this.initialize();
  }

  private async initialize() {
    const connectionString = await AzureKeyVault.getSecret(
      "PostGreSQLConnectionString"
    );
    this.sql = neon(connectionString);
    return;
  }

  public async getVideoComments(videoId: string) {
    try {
      const comments = await this.sql(
        `SELECT * FROM comments WHERE video = $1`,
        [videoId]
      );
      return comments;
    } catch (error) {
      return error;
    }
  }
  public async getComment(commentId: string) {
    const comment = await this.sql.query(
      `SELECT * FROM comments WHERE id = '${commentId}'`
    );
    return comment;
  }
  public async getAllCommentByAUser(owner: string) {
    const comments = await this
      .sql`SELECT * FROM comments WHERE owner = '${owner}'`;
    return comments;
  }
  public async addComment(comment: Comment) {
    // const { content, video, owner } = comment;
    const content = comment.content;
    const video = comment.video;
    const owner = comment.owner;

    await this.sql(
      `INSERT INTO comments (content, video, owner) VALUES ($1, $2, $3)`,
      [content, video, owner]
      // [video],
      // [owner]
    );
    return;
  }
  public async deleteComment(commentId: string) {
    await this.sql.query(`DELETE FROM comments WHERE id = '${commentId}'`);
    return;
  }
  public async updateComment(commentId: string, content: string) {
    await this.sql.query(
      `UPDATE comments SET content = '${content}' WHERE id = '${commentId}'`
    );
    return;
  }

  public async toggleVideoLike(videoId: string, uid: string) {
    try {
      const like = await this.sql(
        `SELECT * FROM video_likes WHERE video = $1 , liked_by = $2`,
        [videoId, uid]
      );
      if (like) {
        await this.sql(
          `DELETE FROM video_likes WHERE video = $1 , liked_by = $2`,
          [videoId, uid]
        );
        return;
      } else {
        await this.sql(
          `INSERT INTO video_likes (video, liked_by) VALUES ($1, $2)`,
          [videoId, uid]
        );
        return;
      }
    } catch (error) {
      return error;
    }
  }

  public async getLikedVideos(uid: string) {
    try {
      const likedVideos = await this.sql(
        `SELECT * FROM video_likes WHERE liked_by = $1`,
        [uid]
      );
      return likedVideos;
    } catch (error) {
      return error;
    }
  }

  public async toggleCommentLike(commentId: string, uid: string) {
    try {
      const like = await this.sql(
        `SELECT * FROM comment_likes WHERE comment = $1 , liked_by = $2`,
        [commentId, uid]
      );
      if (like) {
        await this.sql(
          `DELETE FROM comment_likes WHERE comment = $1 , liked_by = $2`,
          [commentId, uid]
        );
        return;
      } else {
        await this.sql(
          `INSERT INTO comment_likes (comment, liked_by) VALUES ($1, $2)`,
          [commentId, uid]
        );
        return;
      }
    } catch (error) {
      return error;
    }
  }

  public async getUserChannelSubscribers(subscriberId: string) {
    try {
      const subscribers = await this.sql(
        `SELECT * FROM subscriptions WHERE subscriber = $1`,
        [subscriberId]
      );
      return subscribers;
    } catch (error) {
      return error;
    }
  }

  public async getSubscribedChannels(channelId: string) {
    try {
      const subscribedChannels = await this.sql(
        `SELECT * FROM subscriptions WHERE channel = $1`,
        [channelId]
      );
      return subscribedChannels;
    } catch (error) {
      return error;
    }
  }
  public async toggleSubscription(channelId: string, subscriberId: string) {
    try {
      const subscription = await this.sql(
        `SELECT * FROM subscriptions WHERE channel = $1 , subscriber = $2`,
        [channelId, subscriberId]
      );
      if (subscription) {
        await this.sql(
          `DELETE FROM subscriptions WHERE channel = $1 , subscriber = $2`,
          [channelId, subscriberId]
        );
        return false;
      } else {
        await this.sql(
          `INSERT INTO subscriptions (channel, subscriber) VALUES ($1, $2)`,
          [channelId, subscriberId]
        );
        return true;
      }
    } catch (error) {
      return error;
    }
  }
  public async getSubscriptions(subscriberId: string) {
    try {
      const subscriptions = await this.sql(
        `SELECT * FROM subscriptions WHERE subscriber = $1`,
        [subscriberId]
      );
      return subscriptions;
    } catch (error) {
      return error;
    }
  }
  public async getLikesOnVideos(videoId: string) {
    try {
      const likes = await this.sql(
        `SELECT * FROM video_likes WHERE video = $1`,
        [videoId]
      );
      return likes;
    } catch (error) {
      return error;
    }
  }
  public async getAllDislikesOnVideos(videoId: string) {
    try {
      const dislikes = await this.sql(
        `SELECT * FROM video_dislikes WHERE video = $1`,
        [videoId]
      );
      return dislikes;
    } catch (error) {
      return error;
    }
  }
  public async getLikedComments(uid: string) {
    try {
      const likedComments = await this.sql(
        `SELECT * FROM comment_likes WHERE liked_by = $1`,
        [uid]
      );
      return likedComments;
    } catch (error) {
      return error;
    }
  }
  public async getUserPosts(uid: string) {
    try {
      const posts = await this.sql(`SELECT * FROM posts WHERE owner = $1`, [
        uid,
      ]);
      return posts;
    } catch (error) {
      return error;
    }
  }
}

export default PostGresSqlService;
