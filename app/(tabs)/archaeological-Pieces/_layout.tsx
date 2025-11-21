import { Stack } from 'expo-router';

export default function ArchaeologicalPiecesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="deposit-map" 
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen 
        name="View_pieces" 
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="shelf-detail" 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="View_piece" 
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="Edit_piece" 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="New_piece" 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="New_shelf" 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="New_internal-classifier" 
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
