import { v4 as uuidv4 } from "uuid";

export class ItemModel {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.title = data.title || "";
    this.description = data.description || "";
    this.imageUrl = data.imageUrl || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push("Description is required");
    }

    if (this.title && this.title.length > 100) {
      errors.push("Title must be less than 100 characters");
    }

    if (this.description && this.description.length > 1000) {
      errors.push("Description must be less than 1000 characters");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return true;
  }

  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  sanitize() {
    this.title = this.title.trim();
    this.description = this.description.trim();
    return this;
  }

  toPlainObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
