import { databases, DATABASE_ID, COLLECTION_IDS, ID, client } from '../config/appwrite';
import { Message } from '../types';

class MessageService {
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    messageType: Message['messageType'] = 'text',
    fileUrl?: string,
    orderId?: string
  ): Promise<Message> {
    try {
      const message = await databases.createDocument(
        DATABASE_ID as string,
        COLLECTION_IDS.MESSAGES,
        ID.unique(),
        {
          sender: senderId,
          receiver: receiverId,
          content,
          messageType,
          fileUrl,
          orderId,
          isRead: false,
        }
      );
      return message as unknown as Message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getMessages(
    userId: string,
    otherUserId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.MESSAGES,
        [
          `sender.equal("${userId}")`,
          `receiver.equal("${otherUserId}")`,
          'orderAsc("$createdAt")',
          `limit(${limit})`,
          `offset(${offset})`
        ]
      );

      const response2 = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.MESSAGES,
        [
          `sender.equal("${otherUserId}")`,
          `receiver.equal("${userId}")`,
          'orderAsc("$createdAt")',
          `limit(${limit})`,
          `offset(${offset})`
        ]
      );

      const allMessages = [...response.documents, ...response2.documents];
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
      );

      return sortedMessages as unknown as Message[];
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID as string,
        COLLECTION_IDS.MESSAGES,
        messageId,
        { isRead: true }
      );
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  async getConversations(userId: string): Promise<any[]> {
    try {
      // Get all messages where user is sender or receiver
      const sentResponse = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.MESSAGES,
        [`sender.equal("${userId}")`]
      );

      const receivedResponse = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.MESSAGES,
        [`receiver.equal("${userId}")`]
      );

      const allMessages = [...sentResponse.documents, ...receivedResponse.documents];
      
      // Group by conversation partner
      const conversations = new Map();
      
      for (const message of allMessages) {
        const partnerId = message.sender === userId ? message.receiver : message.sender;
        
        if (!conversations.has(partnerId) || 
            new Date(message.$createdAt) > new Date(conversations.get(partnerId).lastMessageTime)) {
          conversations.set(partnerId, {
            partnerId,
            lastMessage: message.content,
            lastMessageTime: message.$createdAt,
            isRead: message.isRead || message.sender === userId,
          });
        }
      }

      return Array.from(conversations.values()).sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  subscribeToMessages(
    userId: string,
    callback: (message: Message) => void
  ): () => void {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_IDS.MESSAGES}.documents`,
      (response) => {
        const message = response.payload as Message;
        if (message.receiver === userId || message.sender === userId) {
          callback(message);
        }
      }
    );

    return unsubscribe;
  }
}

export default new MessageService();