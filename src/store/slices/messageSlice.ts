import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Message } from '../../types';
import MessageService from '../../services/messageService';

interface MessageState {
  messages: Message[];
  conversations: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  conversations: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData: {
    senderId: string;
    receiverId: string;
    content: string;
    messageType?: Message['messageType'];
    fileUrl?: string;
    orderId?: string;
  }) => {
    return await MessageService.sendMessage(
      messageData.senderId,
      messageData.receiverId,
      messageData.content,
      messageData.messageType,
      messageData.fileUrl,
      messageData.orderId
    );
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ userId, otherUserId, limit, offset }: {
    userId: string;
    otherUserId: string;
    limit?: number;
    offset?: number;
  }) => {
    return await MessageService.getMessages(userId, otherUserId, limit, offset);
  }
);

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId: string) => {
    return await MessageService.getConversations(userId);
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId: string) => {
    await MessageService.markAsRead(messageId);
    return messageId;
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      // Fetch messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      // Fetch conversations
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const messageIndex = state.messages.findIndex(m => m.$id === action.payload);
        if (messageIndex !== -1) {
          state.messages[messageIndex].isRead = true;
        }
      });
  },
});

export const { addMessage, clearError, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;