import { useColorScheme } from "@/hooks/useColorScheme";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import "../global.css";
import { queryClient } from "../lib/queryClient";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        "MateSC-Regular": require("../assets/fonts/MateSC-Regular.ttf"),
    });

    if (!loaded) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <ProtectedRoute>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            // Configuración global de animaciones más natural
                            animation: "slide_from_right",
                            gestureEnabled: true,
                            gestureDirection: "horizontal",
                            presentation: "card",
                            animationDuration: 300,
                            // Configurar comportamiento de back
                            animationTypeForReplace: "pop",
                        }}
                    >
                        <Stack.Screen
                            name="(tabs)"
                            options={{
                                headerShown: false,
                            }}
                        />
                    </Stack>
                    <StatusBar style="auto" />
                </ProtectedRoute>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
