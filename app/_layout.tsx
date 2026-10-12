import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ItemsProvider } from '../src/hooks/useItems';
import { ThemeProvider, useTheme } from '../src/hooks/useTheme';
import { colors, fontFamilies } from '../src/theme';

// Prevent splash screen from auto hiding before fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

function NavigationStack() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: colors.terracotta,
          headerTitleStyle: {
            fontFamily: fontFamilies.serif,
            fontSize: 20,
            fontWeight: '700',
            color: theme.text,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="item/new"
          options={{
            title: 'Drop into Gullak',
            headerBackTitle: 'Gullak',
          }}
        />
        <Stack.Screen
          name="item/[id]"
          options={{
            title: 'Detail',
            headerBackTitle: 'Gullak',
          }}
        />
        <Stack.Screen
          name="item/edit/[id]"
          options={{
            title: 'Edit Item',
            headerBackTitle: 'Cancel',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [frauncesLoaded] = useFonts({
    Fraunces_700Bold,
  });

  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsReady = frauncesLoaded && interLoaded;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ItemsProvider>
            <NavigationStack />
          </ItemsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
