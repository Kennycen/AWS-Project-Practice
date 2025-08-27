import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

export class DynamoService {
  constructor() {
    this.rawClient = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    });

    this.client = DynamoDBDocumentClient.from(this.rawClient);
    this.tableName = process.env.DYNAMODB_TABLE_NAME;

    if (!this.tableName) {
      throw new Error("❌ DYNAMODB_TABLE_NAME environment variable is not set");
    }
  }

  // Run once at app startup to verify table exists
  async init() {
    try {
      await this.rawClient.send(
        new DescribeTableCommand({ TableName: this.tableName })
      );
      console.log(`✅ DynamoDB table '${this.tableName}' verified`);
    } catch (error) {
      if (error.name === "ResourceNotFoundException") {
        throw new Error(`❌ DynamoDB table '${this.tableName}' does not exist`);
      }
      throw new Error(`❌ Failed to check DynamoDB table: ${error.message}`);
    }
  }

  async createItem(item) {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: item,
        })
      );
      return item;
    } catch (error) {
      console.error("CreateItem Error:", error);
      throw new Error("Failed to create item in DynamoDB");
    }
  }

  async getAllItems() {
    try {
      const result = await this.client.send(
        new ScanCommand({ TableName: this.tableName })
      );
      return result.Items || [];
    } catch (error) {
      console.error("GetAllItems Error:", error);
      throw new Error("Failed to fetch items from DynamoDB");
    }
  }

  async getItem(id) {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        })
      );
      return result.Item || null;
    } catch (error) {
      console.error("GetItem Error:", error);
      throw new Error("Failed to fetch item from DynamoDB");
    }
  }

  async updateItem(id, updates) {
    try {
      const result = await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id },
          UpdateExpression:
            "SET title = :title, description = :description, imageUrl = :imageUrl, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":title": updates.title,
            ":description": updates.description,
            ":imageUrl": updates.imageUrl,
            ":updatedAt": updates.updatedAt,
          },
          ReturnValues: "ALL_NEW",
        })
      );
      return result.Attributes;
    } catch (error) {
      console.error("UpdateItem Error:", error);
      throw new Error("Failed to update item in DynamoDB");
    }
  }

  async deleteItem(id) {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { id },
        })
      );
      return { message: "Item deleted" };
    } catch (error) {
      console.error("DeleteItem Error:", error);
      throw new Error("Failed to delete item from DynamoDB");
    }
  }
}
