import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient, KeyVaultSecret } from "@azure/keyvault-secrets";
import { FirebaseOptions } from "firebase/app";
import { S3ClientConfig } from "@aws-sdk/client-s3";

const credential: DefaultAzureCredential = new DefaultAzureCredential();

const vaultURL: string = process.env["AzureVaultURL"];

class AzureKeyVaultService {
  private client: SecretClient;
  constructor() {
    this.client = new SecretClient(vaultURL, credential);
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
  async getAwsValues(): Promise<S3ClientConfig> {
    return {
      region: await this.getSecret("AwsRegion"),
      credentials: {
        accessKeyId: await this.getSecret("AwsAccessKeyId"),
        secretAccessKey: await this.getSecret("AwsSecretAccessKey"),
      },
    };
  }
}

export default AzureKeyVaultService;
