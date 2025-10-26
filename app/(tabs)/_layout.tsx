// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      {/* si querés que Card sea un tab visible, descomenta: */}
      {/* <Tabs.Screen name="Card" options={{ title: "Cards" }} /> */}
    </Tabs>
  );
}
