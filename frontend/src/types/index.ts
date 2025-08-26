export type Item = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateItemRequest = {
  title: string;
  description: string;
  image?: File;
};

export type UpdateItemRequest = {
    title: string;
    description: string;
    image?: File;
}