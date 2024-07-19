import { v2 as cloudinary } from "cloudinary";

import { AzureKeyVaultService } from "../azure/AzureService";

const AzureKeyVault = new AzureKeyVaultService();

class CloudinaryService {
  private cloudinary = cloudinary;
  constructor() {
    this.initialize();
  }

  private async initialize() {
    const cloud_name = await AzureKeyVault.getSecret("cloudinaryCloudName");
    const api_key = await AzureKeyVault.getSecret("cloudinaryApiKey");
    const api_secret = await AzureKeyVault.getSecret("cloudinaryApiSecret");
    this.cloudinary.config({
      cloud_name: cloud_name,
      api_key: api_key,
      api_secret: api_secret,
    });
  }

  public async uploadImageFromBuffer(key: string, buffer: Buffer) {
    try {
      const uploadResult = await new Promise((resolve) => {
        this.cloudinary.uploader
          .upload_stream((error, uploadResult) => {
            return resolve(uploadResult);
          })
          .end(buffer);
      });
      return uploadResult;
    } catch (error) {
      console.log("Error uploading image to cloudinary", error);
      return error;
    }
  }
}

export default CloudinaryService;
