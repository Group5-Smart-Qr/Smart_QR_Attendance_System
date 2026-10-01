import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AttendanceProvider } from '@/context/attendance-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AttendanceProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </AttendanceProvider>
  );
}
