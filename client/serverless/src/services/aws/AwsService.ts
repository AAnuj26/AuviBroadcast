import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  /*  GetObjectCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand, */
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

  public async uploadVideoFile(key, body) {
    try {
      const upload = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Body: body,
          Key: key,
          ContentType: "video/mp4",
        })
      );
      // console.log("Upload -> \n", upload);
      return upload;
    } catch (error) {
      // console.log("Error uploading file to aws", error);
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
