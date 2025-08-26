import express from "express";
import { ItemController } from "../controllers/itemController.js";
import { upload, handleUploadError } from "../middleware/upload.js";
import { validateItemData, validateItemId } from "../middleware/validation.js";

const router = express.Router();

// Initialize controller
const itemController = new ItemController();

// CRUD routes with middleware
router.get("/", itemController.getAllItems);
router.get("/:id", validateItemId, itemController.getItem);
router.post(
  "/",
  upload.single("image"),
  handleUploadError,
  validateItemData,
  itemController.createItem
);
router.put(
  "/:id",
  validateItemId,
  upload.single("image"),
  handleUploadError,
  validateItemData,
  itemController.updateItem
);
router.delete("/:id", validateItemId, itemController.deleteItem);

export default router;
