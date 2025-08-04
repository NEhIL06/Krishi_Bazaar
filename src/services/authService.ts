import { Account, Client, Databases, ID, Query } from "react-native-appwrite";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { account, databases } from "../config/appwrite";
import { Double } from "react-native/Libraries/Types/CodegenTypes";

const appwriteConfig = {
    endpoint: "",//changed
    projectId: "",//changed
    platform: "",//changed
    databaseId: "",//changed
    userCollectionId: "688fbb6300056efcbff0",//changed
    storageBucketId: "688f502a003b047969d9",//changed
    categoriesCollectionId: "688fcf55003266123ae4",
    productsCollectionId: "688fd04200142b03e8bc",
    reviewsCollectionId: "688fd6b4002d22dfeb93",
    ordersCollectionId: "688fd43600046ffb7b9d",
    messagesCollectionId: "688fd5e20033a85ba9ed",
    farmersCollectionId: "688fd2fb003bfc7c3a15",
  };
  


interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    gstNumber: string;
    accountId: string;
}

interface LoginCredentials {
    email?: string;
    phone?: string;
    password: string;
}

class AuthService {
    async register(userData: RegisterData): Promise<User> {
        try {
            const newAccount = await account.create(
                ID.unique(),
                userData.email,
                userData.password,
                userData.name
            );

            if (!newAccount) throw new Error('Account creation failed');

            await account.createEmailPasswordSession(userData.email, userData.password);

            const userDoc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                {
                    accountId: newAccount.$id,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    businessName: userData.businessName,
                    gstNumber: userData.gstNumber,
                    //address: userData.address,
                    //location: userData.location,
                    isVerified: false,
                }
            );

            await AsyncStorage.setItem('user', JSON.stringify(userDoc));

            return userDoc as unknown as User;
        } catch (e) {
            console.error('Registration error:', e);
            throw new Error(e as string);
        }
    }

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            if (!credentials.email) {
                throw new Error('Email is required');
            }

            const session = await account.createEmailPasswordSession(
                credentials.email,
                credentials.password
            );

            if (!session) {
                throw new Error('Invalid email or password');
            }

            const accountUser = await account.get();

            const userDocs = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('accountId', accountUser.$id)]
            );

            if (!userDocs.documents.length) {
                throw new Error('User data not found');
            }

            const user = userDocs.documents[0] as unknown as User;
            await AsyncStorage.setItem('user', JSON.stringify(user));

            return user;
        } catch (e) {
            console.error('Login error:', e);
            throw new Error(e as string);
        }
    }

    async logout(): Promise<void> {
        try {
            await account.deleteSession('current');
            await AsyncStorage.removeItem('user');
        } catch (e) {
            console.error('Logout error:', e);
            throw new Error(e as string);
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const cachedUser = await AsyncStorage.getItem('user');
            if (cachedUser) {
                return JSON.parse(cachedUser);
            }

            const accountUser = await account.get();
            if (!accountUser) return null;

            const userDocs = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('accountId', accountUser.$id)]
            );

            if (!userDocs.documents.length) {
                return null;
            }

            const user = userDocs.documents[0] as unknown as User;
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (e) {
            console.error('Get current user error:', e);
            return null;
        }
    }

    async sendOTP(phone: string): Promise<void> {
        try {
            await account.createPhoneToken(ID.unique(), phone);
        } catch (e) {
            console.error('Send OTP error:', e);
            throw new Error(e as string);
        }
    }

    async verifyOTP(userId: string, secret: string): Promise<void> {
        try {
            await account.createSession(userId, secret);
        } catch (e) {
            console.error('Verify OTP error:', e);
            throw new Error(e as string);
        }
    }

    async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
        try {
            const updatedUser = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId,
                updates
            );

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser as unknown as User;
        } catch (e) {
            console.error('Update profile error:', e);
            throw new Error(e as string);
        }
    }
}

export default new AuthService();