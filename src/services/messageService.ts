import { Query } from 'react-native-appwrite';
import { databases, DATABASE_ID, COLLECTION_IDS, ID, client } from '../config/appwrite';
import { Message } from '../types';
 

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

interface getMessagesParams {  
  userId: string;  
  otherUserId: string; 
  limit?: number; 
  offset?: number; 
}



class MessageService {
  async sendMessage(senderId: string,receiverId: string,content: string,
    messageType: Message['messageType'] = 'text',
    fileUrl: string = '',
    orderId: string = ''
  ): Promise<Message> {
    try {
      const message = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
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
      return message.documents[0] as Message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getMessages({userId,otherUserId,limit = 50,offset = 0}:getMessagesParams) {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [
          Query.equal('sender', userId),
          Query.equal('receiver', otherUserId),
          Query.orderAsc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      const response2 = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [
          Query.equal('sender', otherUserId),
          Query.equal('receiver', userId),
          Query.orderAsc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      const allMessages = [...response.documents, ...response2.documents];
      const sortedMessages = allMessages.sort((a, b) => 
        new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
      );

      console.log(sortedMessages);
      return sortedMessages as unknown as Message[];
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string) {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
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
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [Query.equal('sender', userId)]
      );

      const receivedResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messagesCollectionId,
        [Query.equal('receiver', userId)]
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

  subscribeToMessages(userId: string,callback: (message: Message) => void): () => void {
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_IDS.MESSAGES}.documents`, // see the official documentation for more info
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