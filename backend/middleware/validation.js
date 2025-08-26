import { ItemModel } from "../models/itemModel.js";

export const validateItemData = (req, res, next) => {
  try {
    const { title, description } = req.body;

    const item = new ItemModel({ title, description });
    item.validate();

    next();
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const validateItemId = (req, res, next) => {
  const { id } = req.params;

  if (!id || id.trim().length === 0) {
    return res.status(400).json({
      error: "Item ID is required",
    });
  }

  // Basic UUID validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      error: "Invalid item ID format",
    });
  }

  next();
};
