import { Databases, Query, Storage, ImageGravity, Client } from 'react-native-appwrite';
import { Product, Category } from '../types';
import { databases, storage } from '../config/appwrite';
import * as Sentry from '@sentry/react-native';
import { AsyncStorageCache } from '../config/cache';
import ProductCard from '../components/products/ProductCard';
const appwriteConfig = {
  endpoint: "",//changed
  projectId: "",//changed
  platform: "",//changed
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


  private readonly CACHE_TTL = {
    PRODUCTS: 300,        // 5 minutes - frequently changing
    CATEGORIES: 3600,     // 1 hour - less frequent changes
    FEATURED: 600,        // 10 minutes - moderate freshness needed
    SEARCH: 180,          // 3 minutes - search results change often
    FARMER_PRODUCTS: 300, // 5 minutes - inventory changes
    IMAGE_URLS: 86400,    // 24 hours - URLs rarely change
    USER_PROFILE: 1800,   // 30 minutes - user data
    APP_CONFIG: 43200,    // 12 hours - app configuration
  };


  private isExpired(item: any): boolean {
    if (!item.ttl) return false;
    const now = Date.now();
    return (now - item.timestamp) > (item.ttl * 1000);
  }
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
        queries.push(Query.greaterThanEqual('price', filters.priceRange.min));
        queries.push(Query.lessThanEqual('price', filters.priceRange.max));
      }
  
      if (filters?.minimumQuantity) {
        queries.push(Query.greaterThanEqual('availableQuantity', filters.minimumQuantity));
      }
  
      if (sort) {
        if (sort.field === 'price') {
          queries.push(sort.direction === 'asc' ? Query.orderAsc('price') : Query.orderDesc('price'));
        } else if (sort.field === 'createdAt') {
          // Use $createdAt instead of createdAt
          queries.push(sort.direction === 'asc' ? Query.orderAsc('$createdAt') : Query.orderDesc('$createdAt'));
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
      const cachedProduct = localStorage.getItem(`product:${productId}`);
      if(cachedProduct && !this.isExpired(JSON.parse(cachedProduct))) {
        return cachedProduct as unknown as Product;
      }
      if(localStorage.getItem(`product:${productId}`)) {
        return localStorage.getItem(`product:${productId}`) as unknown as Product;
      }
      const product = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        productId
      );
      console.log('Product fetched:', product);
      Sentry.captureException(new Error('Product fetched'))
      product.tll = this.CACHE_TTL.PRODUCTS; // Set TTL for caching
      product.timestamp = Date.now(); // Set current timestamp for caching
      localStorage.setItem(`product:${productId}`, product as unknown as string);
      return product as unknown as Product;
    } catch (error) {
      console.error('Get product error:', error);
      throw new Error(error as string);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {

      // if(this.isExpired(JSON.parse(localStorage.getItem('categories') || '{}'))) {
      //   localStorage.removeItem('categories');
      // } 
      // if(localStorage.getItem('categories')) {
      // return localStorage.getItem('categories') as unknown as Category[];
      // }
      
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        [Query.equal('isActive', true), Query.orderAsc('name')]
      );
     
      //localStorage.setItem('categories', JSON.stringify(response.documents as unknown as Category[]));
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

  async searchProducts(query: string,filters?: ProductFilters,limit = 20): Promise<Product[]> {
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
          Query.limit(limit)
        ]
      );
      console.log('Featured products:', response.documents);
      return response.documents as unknown as Product[];
    } catch (error) {
      console.error('Get featured products error:', error);
      throw new Error(error as string);
    }
  }

  async getImageUrl(fileId: string): Promise<string> {
    try {
      const cachedImage = localStorage.getItem(`imageUrl:${fileId}`);
      if( cachedImage && !this.isExpired(JSON.parse(cachedImage))) {
        return cachedImage as unknown as string;
      }
      console.log('Fetching image URL for fileId:', fileId);
      const result = storage.getFilePreviewURL(
        "688f502a003b047969d9", // appwriteConfig.storageBucketId,
        fileId,
        400, // width
        300, // height
        ImageGravity.Center, // gravity
        85 // quality
      );
      console.log('Image URL:', result);
      localStorage.setItem(`imageUrl:${fileId}`, result.toString());
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