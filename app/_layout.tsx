import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { RootState, AppDispatch } from '../src/store';
import { getCurrentUser } from '../src/store/slices/authSlice';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import LoadingSpinner from '../src/components/common/LoadingSpinner';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useFrameworkReady();

  useEffect(() => {
    // Check authentication status on app start
    dispatch(getCurrentUser()).finally(() => {
      setIsInitialized(true);
    });
  }, [dispatch]);

  useEffect(() => {
    // Handle navigation after initialization
    if (isInitialized && !isLoading) {
      if (!isAuthenticated && !user) {
        // Use setTimeout to ensure navigation happens after layout is mounted
        setTimeout(() => {
          router.replace('/auth/login');
        }, 0);
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user]);

  // Show loading screen while checking authentication
  if (!isInitialized || isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}