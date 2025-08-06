import { ID } from 'react-native-appwrite';
import { databases, storage } from '../config/appwrite';
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
  $id: string;
  $createdAt: string;
  name: string;
  nameHindi: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  parentCategory?: string;
}

interface Farmer {
  $id: string;
  $createdAt: string;
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
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  nameHindi: string;
  description: string;
  category: string;
  farmer: string;
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
  state: string;
  city: string;
  deliveryTimeframe: string;
  isAvailable: boolean;
  category_name?: string; // Added for mapping
  farmer_name?: string; // Added for mapping
}

interface Order {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  buyer: string;
  farmer: string;
  product: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  delivery_street: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
}

interface Message {
  $id: string;
  $createdAt: string;
  sender: string;
  receiver: string;
  content: string;
  messageType: 'text' | 'image' | 'document';
  fileUrl: string;
  isRead: boolean;
  orderId: string;
}

interface Review {
  $id: string;
  $createdAt: string;
  buyer: string;
  farmer: string;
  product: string;
  order: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
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
    console.log(`Documents to delete in ${collectionId}: ${list.documents.length}`);
    await Promise.all(
      list.documents.map((doc) =>
        databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
      )
    );
    console.log(`Collection ${collectionId} cleared`);
  } catch (error) {
    console.error(`Error clearing collection ${collectionId}:`, error);
    throw new Error(error as string);
  }
}

async function clearStorage(): Promise<void> {
  try {
    const list = await storage.listFiles(appwriteConfig.storageBucketId);
    console.log(`Files to delete: ${list.files.length}`);
    await Promise.all(
      list.files.map((file) =>
        storage.deleteFile(appwriteConfig.storageBucketId, file.$id)
      )
    );
    console.log("Storage cleared");
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new Error(error as string);
  }
}

async function uploadImageToStorage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
    console.log(`Fetched image: ${imageUrl}`);
    const blob = await response.blob();
    //const fileName = imageUrl.split('/').pop() || `image-${Date.now()}.jpg`;
    //console.log(`File name: ${fileName}`);
    const fileObj = {
      name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
      type:'image/jpeg',
      size: blob.size,
      uri: imageUrl,
    };
    console.log("File object created :",fileObj);
    const file = await storage.createFile(
      appwriteConfig.storageBucketId,
      ID.unique(),
      fileObj
    );
    console.log(`File created: ${file.$id}`);
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
    console.log("All collections and storage cleared");

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
          imageUrl:imageUrl,
          isActive: cat.isActive,
          parentCategory: cat.parentCategory || undefined,
        }
      );
      categoryMap[cat.name] = doc.$id;
    }
    console.log("Categories created");

    // 3. Create Farmers
    const farmerMap: Record<string, string> = {};
    for (const farmer of data.farmers) {
      const profileImage = farmer.profileImage ? await uploadImageToStorage(farmer.profileImage) : undefined;
      let farmImages;
      if(farmer.farmImages) {
        farmImages = await Promise.all(
        farmer.farmImages.map((url) => uploadImageToStorage(url))
      )};
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
          profileImage:profileImage,
          farmImages:farmImages,
          rating: farmer.rating,
          totalReviews: farmer.totalReviews,
          isVerified: farmer.isVerified,
        }
      );
      farmerMap[farmer.name] = doc.$id;
    }
    console.log("Farmers created");

    // 4. Create Products
    const productMap: Record<string, string> = {};
    for (const product of data.products) {
      let images;
      if(product.images) {
        images = await Promise.all(
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
          category: product.name,
          farmer: product.name,
          images:images,
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
    }
    console.log("Products created");

    // 5. Create Orders
    const orderMap: Record<string, string> = {};
    for (const order of data.orders) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.ordersCollectionId,
        ID.unique(),
        {
          buyer: order.buyer,
          farmer: order.farmer,
          product: order.product,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          status: order.status,
          delivery_street: order.delivery_street,
          delivery_city: order.delivery_city,
          delivery_state: order.delivery_state,
          delivery_pincode: order.delivery_pincode,
          expectedDeliveryDate: order.expectedDeliveryDate,
          actualDeliveryDate: order.actualDeliveryDate || undefined,
          trackingNumber: order.trackingNumber || undefined,
          paymentStatus: order.paymentStatus,
          notes: order.notes || undefined,
        }
      );
      orderMap[order.product] = doc.$id;
    }
    console.log("Orders created");

    // 6. Create Messages
    for (const message of data.messages) {
      let fileUrl = message.fileUrl;
      if (message.messageType === 'image' || message.messageType === 'document') {
        fileUrl = await uploadImageToStorage(message.fileUrl);
      }
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        ID.unique(),
        {
          sender: message.sender,
          receiver: message.receiver,
          content: message.content,
          messageType: message.messageType,
          fileUrl: fileUrl,
          isRead: message.isRead,
          orderId: message.orderId,
        }
      );
    }
    console.log("Messages created");

    // 7. Create Reviews
    for (const review of data.reviews) {
      const images = review.images
        ? await Promise.all(review.images.map((url) => uploadImageToStorage(url)))
        : [];
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.reviewsCollectionId,
        ID.unique(),
        {
          buyer: review.buyer,
          farmer: review.farmer,
          product: review.product,
          order: review.order,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images,
          isVerified: review.isVerified,
        }
      );
    }
    console.log("Reviews created");

    console.log('✅ Seeding complete.');
  } catch (error) {
    console.error('Seeding error:', error);
    throw new Error(error as string);
  }
}

export default seed;