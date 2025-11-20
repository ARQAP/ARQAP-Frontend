import { Stack } from "expo-router";

export default function TabsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                // Animación por defecto para navegación hacia adelante
                animation: "slide_from_right",
                // Configuración de animaciones
                presentation: "card",
                animationTypeForReplace: "push",
                animationDuration: 300,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: "none", // Sin animación para login
                }}
            />
            <Stack.Screen
                name="home"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    // Para home, usar slide normal en lugar de fade
                    animation: "slide_from_right",
                    // Configurar transición personalizada para cuando se navega hacia home
                    animationTypeForReplace: "pop",
                }}
            />
            <Stack.Screen
                name="Card"
                options={{
                    headerShown: false,
                    animation: "slide_from_right", // Animación de deslizado
                }}
            />
            <Stack.Screen
                name="archaeological-Pieces"
                options={{
                    headerShown: false,
                    animation: "slide_from_right", // Animación de deslizado
                }}
            />
            <Stack.Screen
                name="archaeologist"
                options={{
                    headerShown: false,
                    animation: "slide_from_right", // Animación de deslizado
                }}
            />
            <Stack.Screen
                name="collection"
                options={{
                    headerShown: false,
                    animation: "slide_from_right", // Animación de deslizado
                }}
            />
            <Stack.Screen
                name="loan"
                options={{
                    headerShown: false,
                    animation: "slide_from_right", // Animación de deslizado
                }}
            />
            <Stack.Screen
                name="location"
                options={{
                    headerShown: false,
                    animation: "slide_from_right", // Animación de deslizado
                }}
            />
        </Stack>
    );
}
