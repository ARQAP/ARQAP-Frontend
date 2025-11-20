import { Stack } from "expo-router";

export default function TabsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: false, // Deshabilitar gestos de navegación
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    gestureEnabled: false, // Específicamente para login
                }}
            />
            <Stack.Screen
                name="home"
                options={{
                    headerShown: false,
                    gestureEnabled: false, // Específicamente para home
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
