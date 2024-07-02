import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
  GetObjectCommand,
  S3ClientConfig,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import AzureKeyVaultService from "../azure/AzureKeyVaultService";

const azureKeyVault: AzureKeyVaultService = new AzureKeyVaultService();

class AwsService {
  private s3Client: S3Client;
  private bucketName: string;
  constructor() {
    this.s3Client = null;
    this.bucketName = null;
    this.inializeAws();
  }

  async inializeAws(): Promise<void | Error> {
    try {
      if (this.s3Client && this.bucketName) {
        return;
      } else {
        const config: S3ClientConfig = await azureKeyVault.getAwsValues();
        this.s3Client = new S3Client(config);
        this.bucketName = process.env["AwsBucketName"];
        return;
      }
    } catch (error) {
      return error;
    }
  }

  async uploadFile(
    key: string,
    body: Buffer
  ): Promise<PutObjectCommandOutput | Error> {
    try {
      this.inializeAws();
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

  async getSignedUrl(key: string): Promise<string | Error> {
    try {
      await this.inializeAws();
      return await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
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
