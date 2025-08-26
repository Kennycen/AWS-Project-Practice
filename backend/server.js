import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { DynamoService } from "./services/dynamoService.js";
import { S3Service } from "./services/s3Service.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/items", itemRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Server running in port ${port}`);
  console.log(` Health check: http://localhost:${port}/api/health`);
  console.log(` API Base URL: http://localhost:${port}/api`);

  // Test AWS services connections
  console.log("\n🔍 Testing AWS Services Connections...");

  // Test DynamoDB connection
  try {
    const dynamoService = new DynamoService();
    await dynamoService.checkTableExists();
    console.log("✅ DynamoDB connection successful");
  } catch (error) {
    console.error("❌ DynamoDB connection failed:", error.message);
  }

  // Test S3 connection
  try {
    const s3Service = new S3Service();
    await s3Service.checkBucketExists();
    console.log("✅ S3 connection successful");
  } catch (error) {
    console.error("❌ S3 connection failed:", error.message);
  }

  console.log("✅ AWS connected successfully!\n");
});
