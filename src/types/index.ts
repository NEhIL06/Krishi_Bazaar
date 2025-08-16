export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  accountId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  address?: string;
  isVerified: boolean;
  profileImage?: string;
  password: string;
  country: string;
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
  rating?: number;
}

export interface Farmer {
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
  profileImage: string;
  farmImages: string[];
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

export interface Message {
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