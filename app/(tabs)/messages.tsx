import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RootState, AppDispatch } from '../../src/store';
import { fetchConversations } from '../../src/store/slices/messageSlice';
import Colors from '../../src/constants/colors';
import GlobalStyles from '../../src/constants/styles';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import ErrorMessage from '../../src/components/common/ErrorMessage';

interface Conversation {
  $id: string;
  partnerId: string;
  partnerName?: string;
  partnerImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  isRead: boolean;
  unreadCount?: number;
}

const MessagesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Safe selectors with fallbacks
  const {
    conversations = [],
    isLoading = false,
    error = null
  } = useSelector((state: RootState) => state.messages ?? {});
  
  const {
    user = null
  } = useSelector((state: RootState) => state.auth ?? {});
  
  const [refreshing, setRefreshing] = useState(false);

  // Memoized time formatting function
  const formatTime = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check for invalid date
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        // Today - show time
        return date.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (days === 1) {
        // Yesterday
        return 'Yesterday';
      } else if (days < 7) {
        // This week - show day
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      } else if (days < 365) {
        // This year - show date without year
        return date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short' 
        });
      } else {
        // Show full date
        return date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user?.$id) {
      console.warn('Cannot load conversations: user not found');
      return;
    }

    try {
      console.log('Loading conversations for user:', user.$id);
      await dispatch(fetchConversations(user.$id)).unwrap();
      console.log('Conversations loaded successfully');
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      // Error is handled by Redux state, no need to throw
    }
  }, [dispatch, user?.$id]);

  useEffect(() => {
    if (user?.$id) {
      loadConversations();
    }
  }, [loadConversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleConversationPress = useCallback((conversation: Conversation) => {
    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: conversation.partnerId,
        name: conversation.partnerName || 'Farmer'
      }
    });
  }, []);

  const handleNewChatPress = useCallback(() => {
    router.push('/farmers');
  }, []);

  const handleBrowsePress = useCallback(() => {
    router.push('/categories');
  }, []);

  // Memoized render function
  const renderConversationItem = useCallback(({ item }: { item: Conversation }) => (
    <ConversationCard
      conversation={item}
      onPress={() => handleConversationPress(item)}
      formatTime={formatTime}
    />
  ), [handleConversationPress, formatTime]);

  const keyExtractor = useCallback((item: Conversation) => item.$id || item.partnerId, []);

  const emptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="chat-bubble-outline" size={64} color={Colors.neutral[400]} />
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>
          Start chatting with farmers by visiting their profiles
        </Text>
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={handleBrowsePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="search" size={20} color={Colors.white} style={styles.browseIcon} />
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, handleBrowsePress]);

  // Don't render if user is not loaded yet
  if (!user) {
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          {conversations.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {conversations.filter(c => !c.isRead).length} unread
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleNewChatPress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add-comment" size={24} color={Colors.primary[400]} />
        </TouchableOpacity>
      </View>

      {error ? (
        <ErrorMessage message={error} onRetry={loadConversations} />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.conversationsList,
            conversations.length === 0 && styles.conversationsListEmpty
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={emptyComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          getItemLayout={(data, index) => ({
            length: 76, // Approximate item height
            offset: 76 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

// Memoized ConversationCard component
const ConversationCard = React.memo<{
  conversation: Conversation;
  onPress: () => void;
  formatTime: (dateString: string) => string;
}>(({ conversation, onPress, formatTime }) => {
  const [imageError, setImageError] = useState(false);
  
  const formattedTime = useMemo(() => 
    formatTime(conversation.lastMessageTime), 
    [conversation.lastMessageTime, formatTime]
  );

  const unreadCountDisplay = useMemo(() => {
    if (!conversation.unreadCount || conversation.unreadCount === 0) return null;
    return conversation.unreadCount > 99 ? '99+' : conversation.unreadCount.toString();
  }, [conversation.unreadCount]);

  return (
    <TouchableOpacity
      style={[
        styles.conversationCard,
        !conversation.isRead && styles.conversationCardUnread
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {conversation.partnerImage && !imageError ? (
          <Image 
            source={{ uri: conversation.partnerImage }} 
            style={styles.avatar}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={24} color={Colors.neutral[500]} />
          </View>
        )}
        {!conversation.isRead && <View style={styles.unreadIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {conversation.partnerName || 'Farmer'}
          </Text>
          {formattedTime && (
            <Text style={styles.messageTime}>
              {formattedTime}
            </Text>
          )}
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.lastMessage,
              !conversation.isRead && styles.lastMessageUnread
            ]} 
            numberOfLines={2}
          >
            {conversation.lastMessage || 'No messages yet'}
          </Text>
          {unreadCountDisplay && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadCountDisplay}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

ConversationCard.displayName = 'ConversationCard';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationsList: {
    flexGrow: 1,
  },
  conversationsListEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  conversationCardUnread: {
    backgroundColor: Colors.primary[100] || Colors.neutral[50],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neutral[200],
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary[400],
    borderWidth: 2,
    borderColor: Colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginLeft: 8,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: Colors.primary[400],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  unreadCount: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    lineHeight: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[400],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  browseIcon: {
    marginRight: 8,
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessagesPage;