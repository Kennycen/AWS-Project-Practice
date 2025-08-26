import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class DynamoService {
  constructor() {
    this.client = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.tableName = process.env.DYNAMODB_TABLE_NAME;
  }

  async checkTableExists() {
    if (!this.tableName) {
      throw new Error("DYNAMODB_TABLE_NAME environment variable is not set");
    }

    try {
      const command = new DescribeTableCommand({ TableName: this.tableName });
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === "ResourceNotFoundException") {
        throw new Error(`DynamoDB table '${this.tableName}' does not exist`);
      }
      throw new Error(`Failed to check DynamoDB table: ${error.message}`);
    }
  }

  async createItem(item) {
    try {
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item),
      });
      await this.client.send(command);
      return item;
    } catch (error) {
      console.error("Error creating item in DynamoDB:", error);
      throw new Error("Failed to create item");
    }
  }

  async getAllItems() {
    try {
      const command = new ScanCommand({ TableName: this.tableName });
      const result = await this.client.send(command);
      return (result.Items || []).map((item) => unmarshall(item));
    } catch (error) {
      console.error("Error scanning DynamoDB:", error);
      throw new Error("Failed to fetch items");
    }
  }

  async getItem(id) {
    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
      });
      const result = await this.client.send(command);
      return result.Item ? unmarshall(result.Item) : null;
    } catch (error) {
      console.error("Error getting item from DynamoDB:", error);
      throw new Error("Failed to fetch item");
    }
  }

  async updateItem(id, item) {
    try {
      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
        UpdateExpression:
          "SET title = :title, description = :description, imageUrl = :imageUrl, updatedAt = :updatedAt",
        ExpressionAttributeValues: marshall({
          ":title": item.title,
          ":description": item.description,
          ":imageUrl": item.imageUrl,
          ":updatedAt": item.updatedAt,
        }),
        ReturnValues: "ALL_NEW",
      });
      const result = await this.client.send(command);
      return unmarshall(result.Attributes);
    } catch (error) {
      console.error("Error updating item in DynamoDB:", error);
      throw new Error("Failed to update item");
    }
  }

  async deleteItem(id) {
    try {
      const command = new DeleteItemCommand({
        TableName: this.tableName,
        Key: marshall({ id }),
      });
      await this.client.send(command);
    } catch (error) {
      console.error("Error deleting item from DynamoDB:", error);
      throw new Error("Failed to delete item");
    }
  }
}
