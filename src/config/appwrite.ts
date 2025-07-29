import { Client, Account, Databases, Storage, Functions, ID } from 'react-native-appwrite';

// Appwrite configuration
const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '687defff0035523d7f27')
  .setPlatform(process.env.APPWRITE_PLATFORM || 'com.example.krishibazar');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and collection IDs
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "68849ccf000725f375e5" as string;
export const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || "68849cef001df89be612" as string ;

export const COLLECTION_IDS = {
  CATEGORIES: process.env.CATEGORIES_COLLECTION_ID || '68873a840017ad9cb4a4',
  FARMERS: process.env.FARMERS_COLLECTION_ID || '68873a62001f447ef53f',
  MESSAGES: process.env.MESSAGES_COLLECTION_ID || '68873a970039225e85a7',
  ORDERS: process.env.ORDERS_COLLECTION_ID || '68873aa8003724631e5c',
  PRODUCTS: process.env.PRODUCTS_COLLECTION_ID || '68873ab20023a17f9431',
  REVIEWS: process.env.REVIEWS_COLLECTION_ID || '68873ab900299b95f096',
  USERS: process.env.USERS_COLLECTION_ID || '6884a0b50020a181ca67',
};

export { ID };
export default client;

export { client }