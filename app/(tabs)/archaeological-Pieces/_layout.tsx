import { Stack } from "expo-router";

export default function ArchaeologicalPiecesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                // Por defecto navegación hacia adelante
                animation: "slide_from_right",
                presentation: "card",
                animationDuration: 300,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    // Index del módulo sin animación especial
                    animation: "slide_from_right",
                }}
            />
            <Stack.Screen
                name="deposit-map"
                options={{
                    // Navegación normal hacia adelante
                    animation: "slide_from_right",
                    presentation: "card",
                }}
            />
            <Stack.Screen
                name="View_pieces"
                options={{
                    // Lista de piezas - navegación normal
                    animation: "slide_from_right",
                    presentation: "card",
                }}
            />
            <Stack.Screen
                name="shelf-detail"
                options={{
                    // Card en lugar de modal para permitir navegación fluida
                    animation: "slide_from_right",
                    presentation: "card",
                }}
            />
            <Stack.Screen
                name="View_piece"
                options={{
                    // Ver pieza individual - navegación normal
                    animation: "slide_from_right",
                    presentation: "card",
                }}
            />
            <Stack.Screen
                name="Edit_piece"
                options={{
                    // Editar como modal
                    animation: "slide_from_bottom",
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name="New_piece"
                options={{
                    // Nueva pieza como modal
                    animation: "slide_from_bottom",
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name="New_internal-classifier"
                options={{
                    // Nuevo clasificador como modal
                    animation: "slide_from_bottom",
                    presentation: "modal",
                }}
            />
        </Stack>
    );
}
