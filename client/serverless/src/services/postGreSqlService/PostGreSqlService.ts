import { neon } from "@neondatabase/serverless";

import { AzureKeyVaultService } from "../../services/azure/AzureService";

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

  /*------------------------ Init -----------------------------------------------------------*/

  private async initialize() {
    const connectionString = await AzureKeyVault.getSecret(
      "PostGreSQLConnectionString"
    );
    this.sql = neon(connectionString);
    return;
  }

  /*------------------------ comments -----------------------------------------------------------*/

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
    // await this.sql.query(`DELETE FROM comments WHERE id = '${commentId}'`);
    // return;
    try {
      return await this.sql(`DELETE FROM comments WHERE id = $1`, [commentId]);
    } catch (error) {
      return error;
    }
  }

  public async updateComment(commentId: string, content: string) {
    try {
      return await this.sql(`UPDATE comments SET content = $1 WHERE id = $2`, [
        content,
        commentId,
      ]);
    } catch (error) {
      return error;
    }
  }

  /*------------------------ Likes -----------------------------------------------------------*/

  public async toggleVideoLike(videoId: string, uid: string) {
    try {
      const like = await this.sql(
        `SELECT * FROM video_likes WHERE video = $1 AND liked_by = $2`,
        [videoId, uid]
      );

      console.log("Like -> \n", like);
      if (like && like.length > 0) {
        await this.sql(
          `DELETE FROM video_likes WHERE video = $1 AND liked_by = $2`,
          [videoId, uid]
        );
        return false;
      } else {
        await this.sql(
          `INSERT INTO video_likes (video, liked_by) VALUES ($1, $2)`,
          [videoId, uid]
        );
        return true;
      }
    } catch (error) {
      return error;
    }
  }

  public async toggleCommentLike(commentId: string, uid: string) {
    try {
      const like = await this.sql(
        `SELECT * FROM comment_likes WHERE comment_id = $1 AND liked_by = $2`,
        [commentId, uid]
      );
      if (like && like.length > 0) {
        await this.sql(
          `DELETE FROM comment_likes WHERE comment_id = $1 AND liked_by = $2`,
          [commentId, uid]
        );
        return false;
      } else {
        await this.sql(
          `INSERT INTO comment_likes (comment_id, liked_by) VALUES ($1, $2)`,
          [commentId, uid]
        );
        return true;
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

  public async getLikesOnComment(commentId: string) {
    try {
      const likes = await this.sql(
        `SELECT * FROM comment_likes WHERE comment_id = $1`,
        [commentId]
      );
      console.log("Likes -> \n", likes);
      return likes;
    } catch (error) {
      return error;
    }
  }
  /*------------------------ Dislikes -----------------------------------------------------------*/

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

  /*------------------------ Subscription -----------------------------------------------------------*/

  public async getSubscribers(channelId: string) {
    try {
      const subscribers = await this.sql(
        `SELECT * FROM subscriptions WHERE channel = $1`,
        [channelId]
      );
      return subscribers;
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

  public async toggleSubscription(uid: string, channelId: string) {
    try {
      const subscription = await this.sql(
        `SELECT * FROM subscriptions WHERE subscriber = $1 AND channel = $2`,
        [uid, channelId]
      );
      if (subscription && subscription.length > 0) {
        await this.sql(
          `DELETE FROM subscriptions WHERE subscriber = $1 AND channel = $2`,
          [uid, channelId]
        );
        return false;
      } else {
        await this.sql(
          `INSERT INTO subscriptions (subscriber, channel) VALUES ($1, $2)`,
          [uid, channelId]
        );
        return true;
      }
    } catch (error) {
      return error;
    }
  }

  /*------------------------------- Posts -------------------------------------------------*/

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
