export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  isVerified: boolean;
  profileImage?: string;
}

export interface Category {
  $id: string;
  $createdAt: string;
  name: string;
  nameHindi: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  parentCategory?: string;
}

export interface Product {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  nameHindi: string;
  description: string;
  category: string;
  farmer: string;
  images: string[];
  price: {
    amount: number;
    unit: string;
    currency: string;
  };
  minimumQuantity: number;
  availableQuantity: number;
  variety: string;
  grade: string;
  harvestDate: string;
  expiryDate: string;
  storageConditions: string;
  isOrganic: boolean;
  certifications: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryTimeframe: string;
  isAvailable: boolean;
}

export interface Farmer {
  $id: string;
  $createdAt: string;
  name: string;
  phone?: string;
  email?: string;
  farmName: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  profileImage?: string;
  farmImages: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
}

export interface Order {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  buyer: string;
  farmer: string;
  product: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
}

export interface Message {
  $id: string;
  $createdAt: string;
  sender: string;
  receiver: string;
  content: string;
  messageType: 'text' | 'image' | 'document';
  fileUrl?: string;
  isRead: boolean;
  orderId?: string;
}

export interface Review {
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

export interface AppwriteError {
  message: string;
  code: number;
  type: string;
}