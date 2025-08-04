import { Client, Account, Databases, Storage, Functions, ID } from 'react-native-appwrite';

// Appwrite configuration
const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.APPWRITE_PLATFORM!);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and collection IDs
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ;
export const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID ;

export const COLLECTION_IDS = {
  CATEGORIES: process.env.CATEGORIES_COLLECTION_ID as string,
  FARMERS: process.env.FARMERS_COLLECTION_ID as string,
  MESSAGES: process.env.MESSAGES_COLLECTION_ID as string,
  ORDERS: process.env.ORDERS_COLLECTION_ID as string,
  PRODUCTS: process.env.PRODUCTS_COLLECTION_ID as string,
  REVIEWS: process.env.REVIEWS_COLLECTION_ID as string,
  USERS: process.env.USERS_COLLECTION_ID as string,
};

export { ID };
export default client;

export { client }
