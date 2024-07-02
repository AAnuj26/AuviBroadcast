import { MongoClient } from "mongodb";
import AzureKeyVaultService from "../azure/AzureKeyVaultService";

const azureKeyVault = new AzureKeyVaultService();

interface User {
  name: string;
  phone: string;
  age: number;
  email: string;
  password: string;
}
interface Video {
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views?: number;
  isPublished?: boolean;
  owner?: string; // Assuming owner is a string representation of ObjectId
  createdAt?: Date;
  updatedAt?: Date;
}

class MongoDBService {
  private client: MongoClient | null;
  private dbName: string;
  private collectionName: string;

  constructor() {
    this.client = null;
    this.dbName = process.env["DB_NAME"];
    this.collectionName = process.env["COLLECTION_NAME"];
    this.initialize();
  }

  public async initialize() {
    if (!this.client) {
      const mongoDBConnectionString = await azureKeyVault.getSecret(
        "mongoConnectionString"
      );
      this.client = new MongoClient(mongoDBConnectionString);
    }
  }

  public async isUserOwner(videoId, req) {
    await this.client.connect();
    const db = this.client.db(this.dbName).collection(this.collectionName);
    const video = await db.findOne(videoId);
    if (video?.owner.toString() !== req.user?._id.toString()) {
      await this.client.close();
      return false;
    }
    await this.client.close();
    return true;
  }

  public async getVideoById(videoId: string) {
    await this.client.connect();
    const db = this.client.db(this.dbName).collection(this.collectionName);
    const video = await db.findOne({ videoId });
    await this.client.close();
    return video;
  }

  public async deleteVideoById(videoId: string) {
    await this.client.connect();
    const db = this.client.db(this.dbName).collection(this.collectionName);
    await db.deleteOne({ videoId });
  }

  // public async getCollection() {
  //   const client = await this.connect();
  //   return client.db(this.dbName).collection(this.collectionName);
  // }

  // public async getUsers() {
  //   try {
  //     const collection = await this.getCollection();
  //     return await collection.find({}).toArray();
  //   } catch (error) {
  //     console.error("Failed to get users:", error);
  //     throw error;
  //   }
  // }

  // public async getUserByEmail(email: any) {
  //   try {
  //     const collection = await this.getCollection();
  //     return collection.findOne({ email: email });
  //   } catch (error) {
  //     console.error("Failed to get user by email:", error);
  //     throw error;
  //   }
  // }

  // public async postUser(user: User) {
  //   try {
  //     const collection = await this.getCollection();
  //     await collection.insertOne(user);
  //     return user;
  //   } catch (error) {
  //     console.error("Failed to post user:", error);
  //     throw error;
  //   }
  // }

  // public async patchUser() {
  //   try {
  //     const collection = await this.getCollection();
  //     const query = { name: "John Doe" };
  //     const update = { $set: { age: 26 } };
  //     await collection.updateOne(query, update);
  //     return { name: "John Doe", age: 26 };
  //   } catch (error) {
  //     console.error("Failed to patch user:", error);
  //     throw error;
  //   }
  // }

  // public async deleteUser() {
  //   try {
  //     const collection = await this.getCollection();
  //     const query = { name: "John Doe" };
  //     await collection.deleteOne(query);
  //     return "User deleted successfully!";
  //   } catch (error) {
  //     console.error("Failed to delete user:", error);
  //     throw error;
  //   }
  // }

  // public async disconnect() {
  //   try {
  //     await this.close();
  //   } catch (error) {
  //     console.error("Failed to close connection:", error);
  //     throw error;
  //   }
  // }
}

export default MongoDBService;
