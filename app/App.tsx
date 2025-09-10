import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import HomeScreen from "./(tabs)/index";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "MateSC-Regular": require("../assets/fonts/MateSC-Regular.ttf"),
        "CrimsonText-Regular": require("../assets/fonts/CrimsonText-Regular.ttf"),
        "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  return <HomeScreen />;
}
