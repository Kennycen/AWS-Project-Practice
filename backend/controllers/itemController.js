import { v4 as uuidv4 } from "uuid";
import { S3Service } from "../services/s3Service.js";
import { DynamoService } from "../services/dynamoService.js";
import { ItemModel } from "../models/itemModel.js";

export class ItemController {
  constructor() {
    this.s3Service = null;
    this.dynamoService = null;
  }

  getS3Service() {
    if (!this.s3Service) {
      this.s3Service = new S3Service();
    }
    return this.s3Service;
  }

  getDynamoService() {
    if (!this.dynamoService) {
      this.dynamoService = new DynamoService();
    }
    return this.dynamoService;
  }

  getAllItems = async (req, res) => {
    try {
      const items = await this.getDynamoService().getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  };

  getItem = async (req, res) => {
    try {
      const item = await this.getDynamoService().getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  };

  createItem = async (req, res) => {
    try {
      const { title, description } = req.body;
      const imageFile = req.file;

      let imageUrl = null;
      if (imageFile) {
        const fileName = `${uuidv4()}-${imageFile.originalname}`;
        imageUrl = await this.getS3Service().uploadImage(
          imageFile.buffer,
          fileName,
          imageFile.mimetype
        );
      }

      const item = new ItemModel({
        title,
        description,
        imageUrl,
      });

      item.sanitize().validate();

      const plainItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      await this.getDynamoService().createItem(plainItem);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({
        error: "Failed to create item",
        details: error.message,
      });
    }
  };

  updateItem = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const imageFile = req.file;

      const existingItem = await this.getDynamoService().getItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      let imageUrl = existingItem.imageUrl;
      if (imageFile) {
        if (imageUrl) {
          await this.getS3Service().deleteImage(imageUrl);
        }
        const fileName = `${uuidv4()}-${imageFile.originalname}`;
        imageUrl = await this.getS3Service().uploadImage(
          imageFile.buffer,
          fileName,
          imageFile.mimetype
        );
      }

      // Update and validate item
      const item = new ItemModel(existingItem);
      item.update({ title, description, imageUrl });
      item.sanitize().validate();

      const plainItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };

      await this.getDynamoService().updateItem(id, plainItem);
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  };

  deleteItem = async (req, res) => {
    try {
      const { id } = req.params;

      const item = await this.getDynamoService().getItem(id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      const imageUrl = item.imageUrl?.S || item.imageUrl;
      if (imageUrl) {
        await this.getS3Service().deleteImage(imageUrl);
      }

      await this.getDynamoService().deleteItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  };
}
