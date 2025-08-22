import { Query } from 'react-native-appwrite';
import { databases, DATABASE_ID, COLLECTION_IDS, ID } from '../config/appwrite';
import { Order } from '../types';

interface CreateOrderData {
  buyer: string;
  farmer: string;
  product: string;
  quantity: number;
  totalAmount: number;
  delivery_street: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  expectedDeliveryDate: string;
  notes?: string;
}

class OrderService {
  // Test method to verify Appwrite connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Appwrite connection...');
      console.log('Client endpoint:', 'https://fra.cloud.appwrite.io/v1');
      console.log('Project ID:', '688f4f530024f4b39ef6');
      
      // Check if databases service is available
      if (!databases) {
        console.error('Databases service not available');
        return false;
      }
      
      // Try to list documents to test the connection
      const response = await databases.listDocuments(
        "688f5012002f53e1b1de",
        "688fd43600046ffb7b9d",
        [],
        
      );
      
      console.log('Connection test successful:', response);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Full error object:', error);
      return false;
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      console.log('Creating order with data:', orderData);
      
      // Validate order data
      if (!orderData.buyer || !orderData.farmer || !orderData.product || !orderData.quantity || !orderData.totalAmount) {
        throw new Error('Missing required order data: buyer, farmer, product, quantity, and totalAmount are required');
      }
      
      if (orderData.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      if (orderData.totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }
      
      // Use configuration from appwrite config if available, otherwise fallback to hardcoded values
      const databaseId = DATABASE_ID || "688f5012002f53e1b1de";
      const collectionId = COLLECTION_IDS?.ORDERS || "688fd43600046ffb7b9d";
      
      console.log('Using database ID:', databaseId);
      console.log('Using collection ID:', collectionId);
      
      // Check if databases service is properly initialized
      if (!databases) {
        throw new Error('Databases service not initialized');
      }
      
      // Test connection first
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to Appwrite. Please check your internet connection and try again.');
      }
      
      const order = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          ...orderData,
          status: 'pending',
          paymentStatus: 'pending',
        }
      );
      
      console.log('Order created successfully:', order);
      console.log('Order ID:', order.$id);
      
      return order as unknown as Order;
    } catch (error) {
      console.error('Create order error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      throw error;
    }
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(
        "688f5012002f53e1b1de",//Database Id
        "688fd43600046ffb7b9d",// orders collection id
        [
          Query.equal('buyer', buyerId),
          Query.orderDesc('$createdAt')
        ]
      );
      return response.documents as unknown as Order[];
    } catch (error) {
      console.error('Get orders by buyer error:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      console.log('Fetching order with ID:', orderId);
      const order = await databases.getDocument(
        "688f5012002f53e1b1de",
        "688fd43600046ffb7b9d", // orders collection id
        orderId
      );
      return order as unknown as Order;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string, 
    status: Order['status'],
    trackingNumber?: string
  ): Promise<Order> {
    try {
      const updateData: any = { status };
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
      if (status === 'delivered') {
        updateData.actualDeliveryDate = new Date().toISOString();
      }

      const order = await databases.updateDocument(
        "688f5012002f53e1b1de", // Database Id
        "688fd43600046ffb7b9d", // orders collection id
        orderId,
        updateData
      );
      console.log(order);
      return order as unknown as Order;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await databases.updateDocument(
        "688f5012002f53e1b1de", // Database Id
        "688fd43600046ffb7b9d", // orders collection id 
        orderId,
        {
          status: 'cancelled',
          notes: reason || 'Order cancelled by buyer'
        }
      );

      return order as unknown as Order;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }

  async getOrderHistory(
    buyerId: string, 
    status?: Order['status'],
    limit = 20,
    offset = 0
  ): Promise<Order[]> {
    try {
      const queries = [
        Query.equal('buyer', buyerId),  
        Query.orderDesc('$createdAt'),            
        Query.limit(limit),
        Query.offset(offset)
      ];

      if (status) {
        queries.push(Query.equal('status', status));
      }

      const response = await databases.listDocuments(
        "688f5012002f53e1b1de", // Database Id
        "688fd43600046ffb7b9d", // orders collection id
        queries
      );
      return response.documents as unknown as Order[];
    } catch (error) {
      console.error('Get order history error:', error);
      throw error;
    }
  }

  async updatePaymentStatus(
    orderId: string, 
    paymentStatus: Order['paymentStatus']
  ): Promise<Order> {
    try {
      const order = await databases.updateDocument(
        "688f5012002f53e1b1de", // Database Id
        "688fd43600046ffb7b9d", // orders collection id
        orderId,
        { paymentStatus }
      );
      return order as unknown as Order;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  }
}

export default new OrderService();