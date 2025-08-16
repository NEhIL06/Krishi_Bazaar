import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { 
  fetchMessages, 
  sendMessage, 
  markAsRead,
  addMessage,
  clearMessages 
} from '../../src/store/slices/messageSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';
import MessageService from '../../src/services/messageService';
import { Message } from '../../src/types';
import useAppwrite from '@/src/services/useAppwrite';

const ChatPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, isLoading, error } = useSelector((state: RootState) => state.messages);
  const { user } = useSelector((state: RootState) => state.auth);
  const params = useLocalSearchParams();
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const partnerId = params.id as string;
  const partnerName = params.name as string || 'Farmer';

  useEffect(() => {
    if (user && partnerId) {
      loadMessages();
      subscribeToMessages();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      dispatch(clearMessages());
    };
  }, [user, partnerId]);

  const loadMessages = async () => {
    if (user && partnerId) {
      try {
        await useAppwrite({
            fn: MessageService.getMessages,
            params: { userId: user.$id, otherUserId: partnerId },
          });
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
  };

  const subscribeToMessages = () => {
    if (user) {
      unsubscribeRef.current = MessageService.subscribeToMessages(
        user.$id,
        (message: Message) => {
          if (message.sender === partnerId || message.receiver === partnerId) {
            dispatch(addMessage(message));
            
            // Mark as read if message is from partner
            if (message.sender === partnerId && !message.isRead) {
              dispatch(markAsRead(message.$id));
            }
            
            // Scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      );
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || isSending) return;

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      await dispatch(sendMessage({
        senderId: user.$id,
        receiverId: partnerId,
        content: text,
        messageType: 'text',
      }));

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessageText(text); // Restore message text
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender === user?.$id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDate = !previousMessage || 
      new Date(item.$createdAt).toDateString() !== new Date(previousMessage.$createdAt).toDateString();

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.$createdAt)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.content}
            </Text>
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
                ]}
              >
                {formatTime(item.$createdAt)}
              </Text>
              {isMyMessage && (
                <MaterialIcons
                  name={item.isRead ? 'done-all' : 'done'}
                  size={16}
                  color={item.isRead ? Colors.primary[400] : Colors.neutral[400]}
                  style={styles.readIndicator}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => {
    const quickReplies = [
      'What is the current price?',
      'Is this available?',
      'What is the minimum order quantity?',
      'When can you deliver?',
      'Can you share more details?',
    ];

    return (
      <View style={styles.quickRepliesContainer}>
        <Text style={styles.quickRepliesTitle}>Quick replies:</Text>
        <FlatList
          horizontal
          data={quickReplies}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickReplyButton}
              onPress={() => setMessageText(item)}
            >
              <Text style={styles.quickReplyText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesList}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={24} color={Colors.neutral[500]} />
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.partnerName}>{partnerName}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <MaterialIcons name="more-vert" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {error ? (
        <ErrorMessage message={error} onRetry={loadMessages} />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.$id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              isLoading ? (
                <LoadingSpinner size="large" />
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="chat-bubble-outline" size={64} color={Colors.neutral[400]} />
                  <Text style={styles.emptyText}>Start the conversation</Text>
                  <Text style={styles.emptySubtext}>
                    Send a message to {partnerName}
                  </Text>
                </View>
              )
            }
          />

          {/* Quick Replies */}
          {messages.length === 0 && !isLoading && renderQuickReplies()}

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                placeholderTextColor={Colors.neutral[400]}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageText.trim() || isSending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <LoadingSpinner size="small" color={Colors.white} />
                ) : (
                  <MaterialIcons 
                    name="send" 
                    size={20} 
                    color={messageText.trim() ? Colors.white : Colors.neutral[400]} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success[500],
    borderWidth: 2,
    borderColor: Colors.white,
  },
  headerText: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  onlineStatus: {
    fontSize: 12,
    color: Colors.success[600],
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary[400],
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: Colors.text.tertiary,
  },
  readIndicator: {
    marginLeft: 4,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  quickRepliesTitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  quickRepliesList: {
    paddingRight: 16,
  },
  quickReplyButton: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  quickReplyText: {
    fontSize: 12,
    color: Colors.primary[600],
  },
  inputContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.neutral[50],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ChatPage;