import { useIsAuthenticated } from '@/hooks/useUserAuth';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const { data: token, isLoading } = useIsAuthenticated();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Card"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="archaeological-Pieces"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="archaeologist"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="collection"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="loan"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="location"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}