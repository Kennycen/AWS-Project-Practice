import React from "react";
import type { Item } from "../types";

type ItemCardProps = {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {item.imageUrl && (
        <div className="aspect-video bg-gray-200">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {item.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(item.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
