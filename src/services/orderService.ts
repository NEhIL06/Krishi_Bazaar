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
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const order = await databases.createDocument(
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
        ID.unique(),
        {
          ...orderData,
          status: 'pending',
          paymentStatus: 'pending',
        }
      );
      return order.documents[0] as Order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
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
      const order = await databases.getDocument(
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
        orderId
      );
      return order.documents[0] as Order;
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
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
        orderId,
        updateData
      );
      console.log(order.documents[0]);
      return order.documents[0] as Order;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await databases.updateDocument(
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
        orderId,
        {
          status: 'cancelled',
          notes: reason || 'Order cancelled by buyer'
        }
      );

      return order.documents[0] as Order;
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
        `buyer.equal("${buyerId}")`,
        'orderDesc("$createdAt")',
        `limit(${limit})`,
        `offset(${offset})`
      ];

      if (status) {
        queries.push(`status.equal("${status}")`);
      }

      const response = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
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
        DATABASE_ID!,
        COLLECTION_IDS.ORDERS,
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