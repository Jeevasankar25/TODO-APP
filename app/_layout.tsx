import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ActivityIndicator, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TaskProvider } from '../context/TaskContext';
import LoginScreen from './login';
import './textinput-black.css';

function MainApp() {
  const colorScheme = useColorScheme();
  return (
    <TaskProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TaskProvider>
  );
}

function RootLayoutWithAuth() {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!user) {
    return <LoginScreen />;
  }
  return <MainApp />;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  if (!loaded) {
    return null;
  }
  return (
    <PaperProvider>
      <AuthProvider>
        <RootLayoutWithAuth />
      </AuthProvider>
    </PaperProvider>
  );
}
