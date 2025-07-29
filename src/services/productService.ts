import { ImageGravity } from 'react-native-appwrite';
import { databases, storage, DATABASE_ID, COLLECTION_IDS, STORAGE_BUCKET_ID } from '../config/appwrite';
import { Product, Category } from '../types';

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
      const queries = ['isAvailable.equal(true)'];
      
      if (filters?.category) {
        queries.push(`category.equal("${filters.category}")`);
      }
      
      if (filters?.isOrganic !== undefined) {
        queries.push(`isOrganic.equal(${filters.isOrganic})`);
      }
      
      if (filters?.priceRange) {
        queries.push(`price.amount.greaterThanEqual(${filters.priceRange.min})`);
        queries.push(`price.amount.lessThanEqual(${filters.priceRange.max})`);
      }
      
      if (filters?.minimumQuantity) {
        queries.push(`availableQuantity.greaterThanEqual(${filters.minimumQuantity})`);
      }

      if (sort) {
        const sortQuery = sort.direction === 'asc' 
          ? `orderAsc("${sort.field}")` 
          : `orderDesc("${sort.field}")`;
        queries.push(sortQuery);
      }

      queries.push(`limit(${limit})`);
      queries.push(`offset(${offset})`);

      const response = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.PRODUCTS,
        queries
      );

      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      const product = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.PRODUCTS,
        productId
      );
      return product as unknown as Product;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.CATEGORIES,
        ['isActive.equal(true)', 'orderAsc("name")']
      );
      return response.documents as unknown as Category[];
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  async getCategoryById(categoryId: string): Promise<Category> {
    try {
      const category = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.CATEGORIES,
        categoryId
      );
      return category as unknown as Category;
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  }

  async searchProducts(
    query: string,
    filters?: ProductFilters,
    limit = 20
  ): Promise<Product[]> {
    try {
      const queries = [
        'isAvailable.equal(true)',
        `search("${query}")`,
        `limit(${limit})`
      ];

      if (filters?.category) {
        queries.push(`category.equal("${filters.category}")`);
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.PRODUCTS,
        queries
      );

      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.PRODUCTS,
        [
          'isAvailable.equal(true)',
          'orderDesc("$createdAt")',
          `limit(${limit})`
        ]
      );
      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  }

  async getImageUrl(fileId: string): Promise<string> {
    try {
      const result = storage.getFilePreview(
        STORAGE_BUCKET_ID,
        fileId,
        400, // width
        300, // height
        ImageGravity.Center, // gravity
        85 // quality
      );
      return result.toString();
    } catch (error) {
      console.error('Get image URL error:', error);
      throw error;
    }
  }

  async getProductsByFarmer(farmerId: string): Promise<Product[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.PRODUCTS,
        [
          `farmer.equal("${farmerId}")`,
          'isAvailable.equal(true)',
          'orderDesc("$createdAt")'
        ]
      );
      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get products by farmer error:', error);
      throw error;
    }
  }
}

export default new ProductService();