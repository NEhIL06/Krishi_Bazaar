import { Query } from 'react-native-appwrite';
import { databases, DATABASE_ID, COLLECTION_IDS, ID, client } from '../config/appwrite';
import { Message } from '../types';
 


interface getMessagesParams {  userId: string;  
otherUserId: string; limit?: number; offset?: number; }
class MessageService {
  async sendMessage(senderId: string,receiverId: string,content: string,
    messageType: Message['messageType'] = 'text',
    fileUrl: string = '',
    orderId: string = ''
  ): Promise<Message> {
    try {
      const message = await databases.createDocument(
        DATABASE_ID!,
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
      return message.documents[0] as Message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getMessages({userId,otherUserId,limit = 50,offset = 0}:getMessagesParams) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTION_IDS.MESSAGES,
        [
          Query.equal('sender', userId),
          Query.equal('receiver', otherUserId),
          Query.orderAsc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      const response2 = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTION_IDS.MESSAGES,
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
        DATABASE_ID!,
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
        DATABASE_ID!,
        COLLECTION_IDS.MESSAGES,
        [Query.equal('sender', userId)]
      );

      const receivedResponse = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTION_IDS.MESSAGES,
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