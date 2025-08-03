import { ID } from 'react-native-appwrite';
import { databases, storage } from '../config/appwrite'; // Import from your client file
import sampleData from './sampleData';

const appwriteConfig = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "688f4f530024f4b39ef6",
  platform: "com.nehil.react-native",
  databaseId: "688f5012002f53e1b1de",
  userCollectionId: "688fbb6300056efcbff0",
  storageBucketId: "688f502a003b047969d9",
  categoriesCollectionId: "688fcf55003266123ae4",
  productsCollectionId: "688fd04200142b03e8bc",
  reviewsCollectionId: "688fd6b4002d22dfeb93",
  ordersCollectionId: "688fd43600046ffb7b9d",
  messagesCollectionId: "688fd5e20033a85ba9ed",
  farmersCollectionId: "688fd2fb003bfc7c3a15",
};

interface Category {
  name: string;
  nameHindi: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

interface Farmer {
  name: string;
  phone?: string;
  email?: string;
  farmName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  profileImage?: string;
  farmImages: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
}

interface Product {
  name: string;
  nameHindi: string;
  description: string;
  category_name: string;
  farmer_name: string;
  images: string[];
  price: number;
  minimumQuantity: number;
  availableQuantity: number;
  variety: string;
  grade: string;
  harvestDate: string;
  expiryDate: string;
  storageConditions: string;
  isOrganic: boolean;
  city: string;
  state: string;
  deliveryTimeframe: string;
  isAvailable: boolean;
}

interface Order {
  buyer_id: string;
  farmer_name: string;
  product_name: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  delivery_street: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  expectedDeliveryDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
}

interface Message {
  sender_id: string;
  receiver_id: string;
  content: string;
  messageType: 'text' | 'image' | 'document';
  isRead: boolean;
  order_product_name: string;
}

interface Review {
  buyer_id: string;
  farmer_name: string;
  product_name: string;
  order_product_name: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerified: boolean;
}

interface SampleData {
  categories: Category[];
  farmers: Farmer[];
  products: Product[];
  orders: Order[];
  messages: Message[];
  reviews: Review[];
}

const data = sampleData as SampleData;

async function clearAll(collectionId: string): Promise<void> {
  try {
    const list = await databases.listDocuments(appwriteConfig.databaseId, collectionId);
    console.log("docs to delete",list.documents.length);
    await Promise.all(
      list.documents.map((doc) =>
        databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
      )
    );
    console.log("collection cleared");
  } catch (error) {
    console.error(`Error clearing collection ${collectionId}:`, error);
    throw new Error(error as string);
  }
}

async function clearStorage(): Promise<void> {
  try {
    const list = await storage.listFiles(appwriteConfig.storageBucketId);
    console.log("files to delete",list.files.length);
    await Promise.all(
      list.files.map((file) =>
        storage.deleteFile(appwriteConfig.storageBucketId, file.$id)
      )
    );
    console.log("storage cleared");
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new Error(error as string);
  }
}

async function uploadImageToStorage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
    console.log("fetched",imageUrl);
    const blob = await response.blob();
    const fileName = imageUrl.split('/').pop() || `image-${Date.now()}.jpg`;
    console.log("file name",fileName);
    const fileObj = {
      name: fileName,
      type: blob.type || 'image/jpeg',
      size: blob.size,
      uri: imageUrl,
    };
    console.log("fileobj created");
    const file = await storage.createFile(
      appwriteConfig.storageBucketId,
      ID.unique(),
      fileObj
    );
    console.log("file created");
    return storage.getFileView(appwriteConfig.storageBucketId, file.$id).toString();
  } catch (error) {
    console.error(`Error uploading image ${imageUrl}:`, error);
    throw new Error(error as string);
  }
}

async function seed(): Promise<void> {
  try {
    // 1. Clear existing data (excluding User collection)
    await Promise.all([
      clearAll(appwriteConfig.categoriesCollectionId),
      clearAll(appwriteConfig.farmersCollectionId),
      clearAll(appwriteConfig.productsCollectionId),
      clearAll(appwriteConfig.ordersCollectionId),
      clearAll(appwriteConfig.messagesCollectionId),
      clearAll(appwriteConfig.reviewsCollectionId),
      clearStorage(),
    ]);
    console.log("cleared");
    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const imageUrl = await uploadImageToStorage(cat.imageUrl);
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        ID.unique(),
        {
          name: cat.name,
          nameHindi: cat.nameHindi,
          description: cat.description,
          imageUrl,
          isActive: cat.isActive,
          parentCategory: null, // No parent categories in sample data
        }
      );
      categoryMap[cat.name] = doc.$id;
    }
    console.log("categories created");

    // 3. Create Farmers
    const farmerMap: Record<string, string> = {};
    for (const farmer of data.farmers) {
      const profileImage = farmer.profileImage ? await uploadImageToStorage(farmer.profileImage) : undefined;
      const farmImages = await Promise.all(
        farmer.farmImages.map((url) => uploadImageToStorage(url))
      );
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.farmersCollectionId,
        ID.unique(),
        {
          name: farmer.name,
          phone: farmer.phone,
          email: farmer.email,
          farmName: farmer.farmName,
          street: farmer.street,
          city: farmer.city,
          state: farmer.state,
          pincode: farmer.pincode,
          profileImage,
          farmImages,
          rating: farmer.rating,
          totalReviews: farmer.totalReviews,
          isVerified: farmer.isVerified,
        }
      );
      farmerMap[farmer.name] = doc.$id;
    }
    console.log("farmers created");
    // 4. Create Products
    const productMap: Record<string, string> = {};
    for (const product of data.products) {
      const images = await Promise.all(
        product.images.map((url) => uploadImageToStorage(url))
      );
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        ID.unique(),
        {
          name: product.name,
          nameHindi: product.nameHindi,
          description: product.description,
          category: categoryMap[product.category_name],
          farmer: farmerMap[product.farmer_name],
          images,
          price: product.price,
          minimumQuantity: product.minimumQuantity,
          availableQuantity: product.availableQuantity,
          variety: product.variety,
          grade: product.grade,
          harvestDate: product.harvestDate,
          expiryDate: product.expiryDate,
          storageConditions: product.storageConditions,
          isOrganic: product.isOrganic,
          city: product.city,
          state: product.state,
          deliveryTimeframe: product.deliveryTimeframe,
          isAvailable: product.isAvailable,
        }
      );
      productMap[product.name] = doc.$id;
    }
    console.log("products created");

    // 5. Create Orders
    const orderMap: Record<string, string> = {};
    for (const order of data.orders) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.ordersCollectionId,
        ID.unique(),
        {
          buyer: order.buyer_id, // Placeholder, replace with actual User.$id
          farmer: farmerMap[order.farmer_name],
          product: productMap[order.product_name],
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          status: order.status,
          delivery_street: order.delivery_street,
          delivery_city: order.delivery_city,
          delivery_state: order.delivery_state,
          delivery_pincode: order.delivery_pincode,
          expectedDeliveryDate: order.expectedDeliveryDate,
          paymentStatus: order.paymentStatus,
          notes: order.notes,
        }
      );
      orderMap[order.product_name] = doc.$id;
    }
    console.log("orders created");
    // 6. Create Messages
    for (const message of data.messages) {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        ID.unique(),
        {
          sender: message.sender_id, // Placeholder, replace with actual User.$id
          receiver: farmerMap[message.receiver_id] || message.receiver_id, // Handle farmer or user ID
          content: message.content,
          messageType: message.messageType,
          isRead: message.isRead,
          orderId: orderMap[message.order_product_name],
        }
      );
    }
    console.log("messages created");
    // 7. Create Reviews
    for (const review of data.reviews) {
      const images = await Promise.all(
        review.images.map((url) => uploadImageToStorage(url))
      );
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.reviewsCollectionId,
        ID.unique(),
        {
          buyer: review.buyer_id, // Placeholder, replace with actual User.$id
          farmer: farmerMap[review.farmer_name],
          product: productMap[review.product_name],
          order: orderMap[review.order_product_name],
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images,
          isVerified: review.isVerified,
        }
      );
    }
    console.log("reviews created");
    console.log('✅ Seeding complete.');
  } catch (error) {
    console.error('Seeding error:', error);
    throw new Error(error as string);
  }
}

export default seed;