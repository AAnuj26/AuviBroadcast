import { v2 as cloudinary } from "cloudinary";

import { AzureKeyVaultService } from "../azure/AzureService";

const AzureKeyVault = new AzureKeyVaultService();

class CloudinaryService {
  private cloudinary: any;
  constructor() {
    this.initialize();
  }

  private async initialize() {
    const cloud_name = await AzureKeyVault.getSecret("cloudinaryCloudName");
    const api_key = await AzureKeyVault.getSecret("cloudinaryApiKey");
    const api_secret = await AzureKeyVault.getSecret("cloudinaryApiSecret");
    this.cloudinary = cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret,
    });
  }

  public async uploadImageFromBuffer(key: string, buffer: Buffer) {
    try {
      return await this.cloudinary.uploader.upload(buffer, {
        public_id: key,
        resource_type: "image",
      });
    } catch (error) {
      return error;
    }
  }
}

export default CloudinaryService;
