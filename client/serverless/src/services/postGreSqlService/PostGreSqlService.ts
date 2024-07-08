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
    const { content, video, owner } = comment;
    await this.sql.query(
      `INSERT INTO comments (content, videoId, owner) VALUES ('${content}', '${video}', '${owner}')`
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
}

export default PostGresSqlService;
