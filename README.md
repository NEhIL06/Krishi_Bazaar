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
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=687defff0035523d7f27
   APPWRITE_DATABASE_ID=krishibazar
   APPWRITE_STORAGE_BUCKET_ID=68849cef001df89be612
   APPWRITE_PLATFORM=com.example.krishibazar

   # Collection IDs
   CATEGORIES_COLLECTION_ID=68873a840017ad9cb4a4
   FARMERS_COLLECTION_ID=68873a62001f447ef53f
   MESSAGES_COLLECTION_ID=68873a970039225e85a7
   ORDERS_COLLECTION_ID=68873aa8003724631e5c
   PRODUCTS_COLLECTION_ID=68873ab20023a17f9431
   REVIEWS_COLLECTION_ID=68873ab900299b95f096
   USERS_COLLECTION_ID=6884a0b50020a181ca67
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

#### USERS (6884a0b50020a181ca67)
- User profiles with business information
- Address and location data
- Verification status

#### PRODUCTS (68873ab20023a17f9431)
- Product details with images
- Pricing and availability
- Location and delivery information

#### CATEGORIES (68873a840017ad9cb4a4)
- Product categories
- Multilingual names and descriptions

#### FARMERS (68873a62001f447ef53f)
- Farmer profiles and farm information
- Ratings and reviews
- Verification status

#### ORDERS (68873aa8003724631e5c)
- Order details and status
- Payment and delivery information
- Tracking data

#### MESSAGES (68873a970039225e85a7)
- Real-time messaging
- File attachments support
- Read receipts

#### REVIEWS (68873ab900299b95f096)
- Product and farmer reviews
- Ratings and comments
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
   - Email/phone verification
   - Business details collection
   - GST number validation
   - Address and location setup

2. **Login**
   - Email or phone login
   - OTP verification
   - Session management

3. **Profile Management**
   - Business verification
   - Profile updates
   - Address management

## 📱 Features Implementation

### Real-time Messaging
- Appwrite Realtime API integration
- Message status tracking
- File sharing capabilities
- Conversation management

### Order Management
- Complete order lifecycle
- Status tracking
- Payment integration ready
- Delivery management

### Product Discovery
- Advanced filtering
- Category-based browsing
- Location-based recommendations
- Search functionality

## 🔄 State Management

### Redux Store Structure
```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  products: {
    products: Product[],
    categories: Category[],
    filters: FilterState,
    isLoading: boolean
  },
  orders: {
    orders: Order[],
    selectedOrder: Order | null,
    isLoading: boolean
  },
  messages: {
    messages: Message[],
    conversations: Conversation[],
    isLoading: boolean
  }
}
```

## 🚢 Deployment

### Building for Production

1. **Configure app.json**
   ```json
   {
     "expo": {
       "name": "Krishibazar",
       "slug": "krishibazar",
       "version": "1.0.0"
     }
   }
   ```

2. **Build for Android**
   ```bash
   npx expo build:android
   ```

3. **Build for iOS**
   ```bash
   npx expo build:ios
   ```

### Environment Configuration
- Production Appwrite endpoint
- Production database IDs
- App store configurations
- Push notification setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Payment gateway integration
- GPS-based location services
- Push notifications
- Offline mode support
- Advanced analytics
- Multi-language expansion

---

**Made with ❤️ for Indian farmers and wholesale buyers**