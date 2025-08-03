import { Databases, Query, Storage, ImageGravity, Client } from 'react-native-appwrite';
import { Product, Category } from '../types';
import { databases, storage } from '../config/appwrite';

const appwriteConfig = {
  endpoint: "https://fra.cloud.appwrite.io/v1",//changed
  projectId: "688f4f530024f4b39ef6",//changed
  platform: "com.nehil.react-native",//changed
  databaseId: "688f5012002f53e1b1de",//changed
  userCollectionId: "688fbb6300056efcbff0",//changed
  storageBucketId: "688f502a003b047969d9",//changed
  categoriesCollectionId: "688fcf55003266123ae4",
  productsCollectionId: "688fd04200142b03e8bc",
  reviewsCollectionId: "688fd6b4002d22dfeb93",
  ordersCollectionId: "688fd43600046ffb7b9d",
  messagesCollectionId: "688fd5e20033a85ba9ed",
  farmersCollectionId: "688fd2fb003bfc7c3a15",
};



interface ProductFilters {
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  isOrganic?: boolean;
  minimumQuantity?: number;
}

interface SortOptions {
  field: 'price' | 'createdAt' | 'rating' | 'distance';
  direction: 'asc' | 'desc';
}

class ProductService {
  async getProducts(
    filters?: ProductFilters,
    sort?: SortOptions,
    limit = 20,
    offset = 0
  ): Promise<Product[]> {
    try {
      const queries: string[] = [Query.equal('isAvailable', true)];

      if (filters?.category) {
        queries.push(Query.equal('category', filters.category));
      }

      if (filters?.isOrganic !== undefined) {
        queries.push(Query.equal('isOrganic', filters.isOrganic));
      }

      if (filters?.priceRange) {
        queries.push(Query.greaterThanEqual('price.amount', filters.priceRange.min));
        queries.push(Query.lessThanEqual('price.amount', filters.priceRange.max));
      }

      if (filters?.minimumQuantity) {
        queries.push(Query.greaterThanEqual('availableQuantity', filters.minimumQuantity));
      }

      if (sort) {
        if (sort.field === 'price') {
          queries.push(sort.direction === 'asc' ? Query.orderAsc('price.amount') : Query.orderDesc('price.amount'));
        } else {
          queries.push(sort.direction === 'asc' ? Query.orderAsc(sort.field) : Query.orderDesc(sort.field));
        }
      }

      queries.push(Query.limit(limit));
      queries.push(Query.offset(offset));

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        queries
      );

      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get products error:', error);
      throw new Error(error as string);
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      const product = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        productId
      );
      return product as unknown as Product;
    } catch (error) {
      console.error('Get product error:', error);
      throw new Error(error as string);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        [Query.equal('isActive', true), Query.orderAsc('name')]
      );
      return response.documents as unknown as Category[];
    } catch (error) {
      console.error('Get categories error:', error);
      throw new Error(error as string);
    }
  }

  async getCategoryById(categoryId: string): Promise<Category> {
    try {
      const category = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        categoryId
      );
      return category as unknown as Category;
    } catch (error) {
      console.error('Get category error:', error);
      throw new Error(error as string);
    }
  }

  async searchProducts(
    query: string,
    filters?: ProductFilters,
    limit = 20
  ): Promise<Product[]> {
    try {
      const queries: string[] = [
        Query.equal('isAvailable', true),
        Query.search('name', query),
        Query.limit(limit)
      ];

      if (filters?.category) {
        queries.push(Query.equal('category', filters.category));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        queries
      );

      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Search products error:', error);
      throw new Error(error as string);
    }
  }

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        [
          Query.equal('isAvailable', true),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );
      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get featured products error:', error);
      throw new Error(error as string);
    }
  }

  async getImageUrl(fileId: string): Promise<string> {
    try {
      const result = storage.getFilePreview(
        appwriteConfig.storageBucketId,
        fileId,
        400, // width
        300, // height
        ImageGravity.Center, // gravity
        85 // quality
      );
      return result.toString();
    } catch (error) {
      console.error('Get image URL error:', error);
      throw new Error(error as string);
    }
  }

  async getProductsByFarmer(farmerId: string): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        [
          Query.equal('farmer', farmerId),
          Query.equal('isAvailable', true),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get products by farmer error:', error);
      throw new Error(error as string);
    }
  }
}

export default new ProductService();