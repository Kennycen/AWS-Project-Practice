import { useEffect, useState } from "react";
import type { CreateItemRequest, Item, UpdateItemRequest } from "./types";
import { ApiService } from "./services/api";
import { ItemForm } from "./components/ItemForm";
import { ItemCard } from "./components/ItemCard";

type View = "list" | "create" | "edit";

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentView, setCurrentView] = useState<View>("list");
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ApiService.getAllItems();
      setItems(data);
    } catch (error) {
      setError("Failed to load items");
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (data: CreateItemRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await ApiService.createItem(data);
      await loadItems();
      setCurrentView("list");
    } catch (error) {
      setError("Failed to create item");
      console.error("Error creating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (data: UpdateItemRequest) => {
    if (!editingItem) return;

    try {
      setIsLoading(true);
      setError(null);
      await ApiService.updateItem(editingItem.id, data);
      await loadItems();
      setCurrentView("list");
      setEditingItem(undefined);
    } catch (error) {
      setError("Failed to update item");
      console.error("Error updating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      setIsLoading(true);
      setError(null);
      await ApiService.deleteItem(id);
      await loadItems();
    } catch (error) {
      setError("Failed to delete item");
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setCurrentView("edit");
  };

  const renderContent = () => {
    switch (currentView) {
      case "create":
        return (
          <ItemForm
            onSubmit={handleCreateItem}
            onCancel={() => setCurrentView("list")}
            isLoading={isLoading}
          />
        );
      case "edit":
        return (
          <ItemForm
            item={editingItem}
            onSubmit={handleUpdateItem}
            onCancel={() => {
              setCurrentView("list");
              setEditingItem(undefined);
            }}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Image Manager
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {isLoading && items.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No items found. Create your first item!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                AWS Image Manager
              </h1>
            </div>
            {currentView === "list" && (
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView("create")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Add New Item
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>{renderContent()}</main>
    </div>
  );
}

export default App;
