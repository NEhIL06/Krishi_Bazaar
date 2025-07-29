import React, { useEffect, useState } from 'react';
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
  const { conversations, isLoading, error } = useSelector((state: RootState) => state.messages);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (user) {
      try {
        await dispatch(fetchConversations(user.$id));
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push({
        pathname: '/chat/[id]',
        params: { 
          id: item.partnerId,
          name: item.partnerName || 'Farmer'
        }
      })}
    >
      <View style={styles.avatarContainer}>
        {item.partnerImage ? (
          <Image source={{ uri: item.partnerImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={24} color={Colors.neutral[500]} />
          </View>
        )}
        {!item.isRead && <View style={styles.unreadIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {item.partnerName || 'Farmer'}
          </Text>
          <Text style={styles.messageTime}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.lastMessage,
              !item.isRead && styles.lastMessageUnread
            ]} 
            numberOfLines={2}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/farmers')}
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
          keyExtractor={(item, index) => `${item.partnerId}-${index}`}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingSpinner size="large" />
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="chat-bubble-outline" size={64} color={Colors.neutral[400]} />
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Text style={styles.emptySubtext}>
                  Start chatting with farmers by visiting their profiles
                </Text>
                <TouchableOpacity 
                  style={styles.browseButton}
                  onPress={() => router.push('/categories')}
                >
                  <Text style={styles.browseButtonText}>Browse Products</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
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
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: Colors.primary[400],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
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
    backgroundColor: Colors.primary[400],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  browseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessagesPage;