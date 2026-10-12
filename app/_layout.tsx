import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ItemsProvider } from '../src/hooks/useItems';
import { ThemeProvider, useTheme } from '../src/hooks/useTheme';
import { colors } from '../src/theme';

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
            title: 'Item Detail',
            headerBackTitle: 'Gullak',
          }}
        />
        <Stack.Screen
          name="item/edit/[id]"
          options={{
            title: 'Edit Item',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ItemsProvider>
          <NavigationStack />
        </ItemsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
