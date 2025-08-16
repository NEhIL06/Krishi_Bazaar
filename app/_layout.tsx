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
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://ec9b641b879f04e4ec78ea1ff33bc0dd@o4509705428729856.ingest.de.sentry.io/4509775036088400',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

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

export default Sentry.wrap(function RootLayout() {
  useFrameworkReady();
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
});