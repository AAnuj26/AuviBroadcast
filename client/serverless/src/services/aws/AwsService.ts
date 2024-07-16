import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";

import { AzureKeyVaultService } from "../azure/AzureService";

const AzureKeyVault: AzureKeyVaultService = new AzureKeyVaultService();

class AwsService {
  private s3Client: S3Client;
  private bucketName: string;
  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const credentials = await AzureKeyVault.getAwsValues();
      this.s3Client = new S3Client(credentials);
      this.bucketName = process.env["AwsBucketName"];
      return;
    } catch (error) {
      console.log("Error initializing AWS Service", error);
      return error;
    }
  }

  public async uploadFile(key, body) {
    try {
      return await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Body: body,
          Key: key,
          ContentType: "image/jpeg",
        })
      );
    } catch (error) {
      return error;
    }
  }
  public async deleteFile(key) {
    try {
      return await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      return error;
    }
  }
}

export default AwsService;
