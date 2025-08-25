// config/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export class AsyncStorageCache {
  private keyPrefix = 'cache:';

  private getCacheKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    if (!item.ttl) return false;
    const now = Date.now();
    return (now - item.timestamp) > (item.ttl * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key);
      const stored = await AsyncStorage.getItem(cacheKey);
      
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      
      // Check if expired
      if (this.isExpired(item)) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key);
      const item: CacheItem<any> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttlSeconds
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map(key => [key, this.getCacheKey(key)]);
      const results = await Promise.all(
        cacheKeys.map(async ([originalKey, cacheKey]) => {
          try {
            const stored = await AsyncStorage.getItem(cacheKey);
            if (!stored) return null;

            const item: CacheItem<T> = JSON.parse(stored);
            
            if (this.isExpired(item)) {
              await AsyncStorage.removeItem(cacheKey);
              return null;
            }

            return item.data;
          } catch {
            return null;
          }
        })
      );

      return results;
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    try {
      const setOperations = Object.entries(keyValuePairs).map(([key, value]) =>
        this.set(key, value, ttlSeconds)
      );

      const results = await Promise.all(setOperations);
      return results.every(result => result);
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key);
      await AsyncStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const matchingKeys = allKeys.filter(key => 
        key.startsWith(this.keyPrefix) && 
        this.matchesPattern(key.substring(this.keyPrefix.length), pattern)
      );

      if (matchingKeys.length === 0) return 0;

      await AsyncStorage.multiRemove(matchingKeys);
      return matchingKeys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  private matchesPattern(key: string, pattern: string): boolean {
    // Simple pattern matching - convert * to regex
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key);
      const stored = await AsyncStorage.getItem(cacheKey);
      
      if (!stored) return false;

      const item: CacheItem<any> = JSON.parse(stored);
      
      if (this.isExpired(item)) {
        await AsyncStorage.removeItem(cacheKey);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key);
      const stored = await AsyncStorage.getItem(cacheKey);
      
      if (!stored) return false;

      const item: CacheItem<any> = JSON.parse(stored);
      item.ttl = ttlSeconds;
      item.timestamp = Date.now(); // Reset timestamp
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const cacheKey = this.getCacheKey(key);
      const stored = await AsyncStorage.getItem(cacheKey);
      
      if (!stored) return -2; // Key doesn't exist

      const item: CacheItem<any> = JSON.parse(stored);
      
      if (!item.ttl) return -1; // No expiration set

      const elapsed = (Date.now() - item.timestamp) / 1000;
      const remaining = item.ttl - elapsed;
      
      return remaining > 0 ? Math.ceil(remaining) : -2;
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -2;
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.keyPrefix));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    usedMemory?: string;
    keyspace?: any;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.keyPrefix));
      
      return {
        connected: true,
        usedMemory: 'N/A (AsyncStorage)',
        keyspace: [`db0:keys=${cacheKeys.length}`]
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: false };
    }
  }

  async ping(): Promise<boolean> {
    try {
      // Test AsyncStorage availability
      const testKey = `${this.keyPrefix}_ping_test`;
      await AsyncStorage.setItem(testKey, 'pong');
      const result = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      return result === 'pong';
    } catch (error) {
      console.error('Cache ping error:', error);
      return false;
    }
  }

  async warmCache(key: string, fetchFunction: () => Promise<any>, ttlSeconds?: number): Promise<any> {
    try {
      // First try to get from cache
      const cached = await this.get(key);
      if (cached) {
        return cached;
      }

      // If not in cache, fetch the data
      const data = await fetchFunction();
      
      // Cache the result
      await this.set(key, data, ttlSeconds);
      
      return data;
    } catch (error) {
      console.error('Cache warm error:', error);
      // Fallback to direct fetch
      return await fetchFunction();
    }
  }

  // Utility method to clean expired items
  async cleanExpired(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.keyPrefix));
      
      let cleanedCount = 0;
      
      for (const cacheKey of cacheKeys) {
        try {
          const stored = await AsyncStorage.getItem(cacheKey);
          if (!stored) continue;

          const item: CacheItem<any> = JSON.parse(stored);
          
          if (this.isExpired(item)) {
            await AsyncStorage.removeItem(cacheKey);
            cleanedCount++;
          }
        } catch {
          // If we can't parse the item, remove it
          await AsyncStorage.removeItem(cacheKey);
          cleanedCount++;
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Cache clean error:', error);
      return 0;
    }
  }

  isConnected(): boolean {
    return true; // AsyncStorage is always available
  }
}

// Singleton instance
export const cacheService = new AsyncStorageCache();