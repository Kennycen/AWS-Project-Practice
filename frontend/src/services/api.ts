import axios, { type AxiosResponse } from "axios";
import type { CreateItemRequest, Item, UpdateItemRequest } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ApiService {
  static async getAllItems(): Promise<Item[]> {
    try {
      const response: AxiosResponse<Item[]> = await apiClient.get(`/items`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch items");
    }
  }

  static async getItem(id: string): Promise<Item> {
    try {
      const response: AxiosResponse<Item> = await apiClient.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch item");
    }
  }

  static async createItem(data: CreateItemRequest): Promise<Item> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);

      if (data.image) {
        formData.append("image", data.image);
      }

      const response: AxiosResponse<Item> = await apiClient.post(
        `/items`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Failed to create item");
    }
  }

  static async updateItem(id: string, data: UpdateItemRequest): Promise<Item> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);

      formData.append("description", data.description);

      if (data.image) {
        formData.append("image", data.image);
      }

      const response: AxiosResponse<Item> = await apiClient.put(
        `/items/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Failed to update item");
    }
  }

  static async deleteItem(id: string): Promise<void> {
    try {
      await apiClient.delete(`/items/${id}`);
    } catch (error) {
      throw new Error("Failed to delete item");
    }
  }
}
