import { neon } from "@neondatabase/serverless";

const connectionString = process.env["PostGreSQLConnectionString"];

class PostGreSqlService {
  private sql: any;
  constructor() {
    this.sql = neon(connectionString);
  }
  public async isVideoLiked(videoId: string, uid: string) {
    return this
      .sql`SELECT * FROM video_likes WHERE video_id = ${videoId} AND uid = ${uid}`;
  }
  public async isCommentLiked(commentId: string, uid: string) {
    return this
      .sql`SELECT * FROM comment_likes WHERE comment_id = ${commentId} AND uid = ${uid}`;
  }
  public async getVideoLikes(videoId: string) {
    return this.sql`SELECT * FROM video_likes WHERE video_id = ${videoId}`;
  }
  public async getLikedVideos(uid: string) {
    return this.sql`SELECT * FROM video_likes WHERE uid = ${uid}`;
  }
  public async toggleVideoLike(videoId: string, uid: string) {
    if (await this.isVideoLiked(videoId, uid)) {
      return this
        .sql`DELETE FROM video_likes WHERE video_id = ${videoId} AND uid = ${uid}`;
    } else {
      return this
        .sql`INSERT INTO video_likes (video_id, uid) VALUES (${videoId}, ${uid})`;
    }
  }

  public async toggleCommentLike(commentId: string, uid: string) {
    if (await this.isCommentLiked(commentId, uid)) {
      return this
        .sql`DELETE FROM comment_likes WHERE comment_id = ${commentId} AND uid = ${uid}`;
    } else {
      return this
        .sql`INSERT INTO comment_likes (comment_id, uid) VALUES (${commentId}, ${uid})`;
    }
  }

  public async getVideoComments(videoId: string, uid: string) {
    return await this
      .sql`SELECT * FROM video_comments WHERE video_id = ${videoId}`;
  }
  public async addAComment(videoId: string, uid: string, comment: string) {
    return await this
      .sql`INSERT INTO video_comments (video_id, commented_buy, comment) VALUES (${videoId}, ${uid}, ${comment})`;
  }
  public async updateAComment(commentId: string, comment: string) {
    return await this
      .sql`UPDATE video_comments SET comment = ${comment} WHERE id = ${commentId}`;
  }
  public async deleteAComment(commentId: string) {
    return await this.sql`DELETE FROM video_comments WHERE id = ${commentId}`;
  }
}
