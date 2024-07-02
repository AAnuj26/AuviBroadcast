import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient, KeyVaultSecret } from "@azure/keyvault-secrets";
import { FirebaseOptions } from "firebase/app";

class AzureKeyVaultService {
  private vaultURL: string;
  private credential: DefaultAzureCredential;
  private client: SecretClient;
  constructor() {
    this.vaultURL = process.env["AzureVaultURL"];
    this.credential = new DefaultAzureCredential();
    this.client = new SecretClient(this.vaultURL, this.credential);
  }
  async getSecret(secretName: string): Promise<string> {
    const secret: KeyVaultSecret = await this.client.getSecret(secretName);
    return secret.value;
  }
  async getFireBaseValues(): Promise<FirebaseOptions> {
    return {
      apiKey: await this.getSecret("FireBaseApiKey"),
      authDomain: await this.getSecret("FireBaseAuthDomain"),
      databaseURL: await this.getSecret("FireBaseDataBaseURL"),
      projectId: await this.getSecret("FireBaseProjectId"),
      appId: await this.getSecret("FireBaseAppId"),
    };
  }
  // async getAwsValues(): Promise<S3ClientConfig> {
  //   return {
  //     region: await this.getSecret("AwsRegion"),
  //     credentials: {
  //       accessKeyId: await this.getSecret("AwsAccessKeyId"),
  //       secretAccessKey: await this.getSecret("AwsSecretAccessKey"),
  //     },
  //   };
  // }
}

const AzureKeyVault = new AzureKeyVaultService();

class AzureBlobService {
  private blobServiceClient: BlobServiceClient | null;
  private containerClient: ContainerClient | null;
  constructor() {
    this.blobServiceClient = null;
    this.containerClient = null;
    this.initialize();
  }

  async initialize() {
    const blobConnectionString = await AzureKeyVault.getSecret(
      "blobConnection"
    );
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(blobConnectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(
      process.env["BlobContainerName"]
    );
  }

  async uploadBlob(
    blobName: string,
    blobArrayBuffer: ArrayBuffer
  ): Promise<string> {
    const blobClient = this.containerClient.getBlockBlobClient(blobName);
    const options = {
      blobHTTPHeaders: {
        blobContentType: "image/jpeg",
      },
    };
    await blobClient.uploadData(blobArrayBuffer, options);

    return blobClient.url;
  }
}

export { AzureBlobService, AzureKeyVaultService };
