import { account, databases, DATABASE_ID, COLLECTION_IDS, ID } from '../config/appwrite';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

class AuthService {
  async register(userData: RegisterData): Promise<User> {
    try {
      // Create account
      const user = await account.create(
        ID.unique(),
        userData.email,
        userData.password,
        userData.name
      );

      // Create user document in database
      const userDoc = await databases.createDocument(
        DATABASE_ID as string,
        COLLECTION_IDS.USERS,
        ID.unique(),
        {
          accountId: user.$id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          businessName: userData.businessName,
          gstNumber: userData.gstNumber,
          address: userData.address,
          location: userData.location,
          isVerified: false,
        }
      );

      // Create session
      await account.createEmailPasswordSession(userData.email, userData.password);
      
      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(userDoc));
      
      return userDoc as unknown as User;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      let session:any;
      
      if (credentials.email) {
        session = await account.createEmailPasswordSession(
          credentials.email,
          credentials.password
        );
      } else {
        throw new Error('Email or phone is required');
      }

      // Get current user
      const accountUser = await account.get();
      
      // Get user document from database
      const userDocs = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.USERS,
        [`accountId.equal("${accountUser.$id}")`]
      );

      if (userDocs.documents.length === 0) {
        throw new Error('User data not found');
      }

      const user = userDocs.documents[0] as unknown as User;
      
      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Try to get from local storage first
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // If not in cache, try to get from Appwrite
      const accountUser = await account.get();
      const userDocs = await databases.listDocuments(
        DATABASE_ID as string,
        COLLECTION_IDS.USERS,
        [`accountId.equal("${accountUser.$id}")`]
      );

      if (userDocs.documents.length > 0) {
        const user = userDocs.documents[0] as unknown as User;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return user;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async sendOTP(phone: string): Promise<void> {
    try {
      await account.createPhoneToken(ID.unique(), phone);
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  async verifyOTP(userId: string, secret: string): Promise<void> {
    try {
      await account.createSession(userId, secret);
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updatedUser = await databases.updateDocument(
        DATABASE_ID as string,
        COLLECTION_IDS.USERS,
        userId,
        updates
      );
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser as unknown as User;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}

export default new AuthService();