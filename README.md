# Krishibazar - Agricultural Marketplace Mobile App

A comprehensive React Native mobile application connecting wholesale buyers directly with farmers in India, built with Expo and Appwrite backend.

## 🌾 Overview

Krishibazar (कृषिबाजार) is a B2B agricultural marketplace that eliminates middlemen by connecting wholesale buyers directly with farmers. The app features real-time messaging, order management, product discovery, and secure authentication.

## 🚀 Features

### Core Functionality
- **User Authentication**: Email/phone login with OTP verification
- **Product Discovery**: Browse products by categories with advanced filtering
- **Real-time Messaging**: Direct communication between buyers and farmers
- **Order Management**: Complete order lifecycle tracking
- **Business Verification**: GST-based business verification system
- **Multi-language Support**: Hindi and English interface

### Key Screens
- **Home**: Featured products, categories, and quick actions
- **Categories**: Advanced filtering and search functionality
- **Product Details**: Comprehensive product information with farmer profiles
- **Orders**: Order history with real-time status tracking
- **Messages**: Real-time chat with farmers
- **Profile**: User management and settings

## 🛠 Technology Stack

### Frontend
- **React Native** with Expo SDK 52
- **Redux Toolkit** for state management
- **React Navigation v6** for navigation
- **TypeScript** for type safety
- **React Hook Form** for form validation

### Backend (Appwrite)
- **Authentication**: Email/phone with OTP
- **Database**: Real-time NoSQL database
- **Storage**: Image and file storage
- **Real-time**: Live messaging and updates

### Key Libraries
- `react-native-appwrite` - Appwrite SDK
- `@reduxjs/toolkit` - State management
- `react-hook-form` - Form handling
- `react-native-shimmer-placeholder` - Loading states
- `@react-native-async-storage/async-storage` - Local storage

## 📱 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   └── products/        # Product-specific components
├── config/              # Configuration files
├── constants/           # Colors, styles, and constants
├── services/            # API services
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
└── utils/               # Utility functions

app/                     # Expo Router screens
├── (tabs)/             # Tab navigation screens
├── auth/               # Authentication screens
└── _layout.tsx         # Root layout
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd krishibazar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Appwrite**
   
   Create a `.env` file in the project root:
   ```env
   APPWRITE_ENDPOINT=
   APPWRITE_PROJECT_ID=
   APPWRITE_DATABASE_ID=
   APPWRITE_STORAGE_BUCKET_ID=
   APPWRITE_PLATFORM=

   # Collection IDs
   CATEGORIES_COLLECTION_ID=
   FARMERS_COLLECTION_ID=
   MESSAGES_COLLECTION_ID=
   ORDERS_COLLECTION_ID=
   PRODUCTS_COLLECTION_ID=
   REVIEWS_COLLECTION_ID=
   USERS_COLLECTION_ID=
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run on device/simulator**
   ```bash
   # For iOS
   npx expo run:ios
   
   # For Android
   npx expo run:android
   
   # For web
   npx expo start --web
   ```

## 🗄 Database Schema

### Collections

#### USERS 
- User profiles with business information
- Address and location data
- Verification status

#### PRODUCTS 
- Product details with images
- Pricing and availability
- Location and delivery information

#### CATEGORIES 
- Product categories
- Multilingual names and descriptions

#### FARMERS 
- Farmer profiles and farm information
- Ratings and reviews
- Verification status

#### ORDERS 
- Order details and status
- Payment and delivery information
- Tracking data

#### MESSAGES 
- Real-time messaging

#### REVIEWS 
- Product and farmer reviews
- Ratings 
- Verification status

## 🎨 Design System

### Color Palette
- **Primary**: Earth tones and greens (#4A7C59)
- **Secondary**: Saffron accents (#FF9933)
- **Success**: Green variants
- **Warning**: Orange variants
- **Error**: Red variants
- **Neutral**: Gray scale

### Typography
- **Primary Font**: System default
- **Hindi Support**: Devanagari script
- **Font Weights**: 400, 600, 700

## 🔐 Authentication Flow

1. **Registration**
   - Email verification
   - Business details collection
   - GST number validation
   - Address and location setup

2. **Login**
   - Email login
   - Session management

3. **Profile Management**
   - Business verification
   - Profile updates
   - Address management

## 🚢 Deployment



## 🔮 Future Enhancements

- Payment gateway integration
- GPS-based location services
- Push notifications
- Offline mode support
- Advanced analytics
- Multi-language expansion
