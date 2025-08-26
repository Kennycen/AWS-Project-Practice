import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

export class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async checkBucketExists() {
    if (!this.bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not set");
    }

    try {
      const command = new HeadBucketCommand({ Bucket: this.bucketName });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === "NotFound") {
        throw new Error(`S3 bucket '${this.bucketName}' does not exist`);
      } else if (error.name === "Forbidden") {
        throw new Error(`Access denied to S3 bucket '${this.bucketName}'`);
      } else {
        throw new Error(`Failed to check S3 bucket: ${error.message}`);
      }
    }
  }

  async uploadImage(buffer, fileName, contentType) {
    const params = {
      Bucket: this.bucketName,
      Key: `images/${fileName}`,
      Body: buffer,
      ContentType: contentType,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      return `https://${this.bucketName}.s3.${
        process.env.AWS_REGION || "us-east-1"
      }.amazonaws.com/images/${fileName}`;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw new Error("Failed to upload image");
    }
  }

  async deleteImage(imageUrl) {
    try {
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1);

      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting from s3:", error);
      throw new Error("Failed to delete image");
    }
  }
}
