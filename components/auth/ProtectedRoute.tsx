import { useIsAuthenticated } from "@/hooks/useUserAuth";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Colors from "../../constants/Colors";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { data: token, isLoading } = useIsAuthenticated();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (!isLoading) {
            const inAuthGroup = segments[0] === "(tabs)";

            if (!token && inAuthGroup) {
                // Si no hay token, ir al login
                const currentPath = `/${segments.join("/")}`;
                const isLoginPage =
                    currentPath === "/(tabs)" ||
                    currentPath === "/(tabs)/index";
                if (!isLoginPage) {
                    router.replace("/(tabs)");
                }
            } else if (token && inAuthGroup) {
                // Si hay token, verificar si está en login
                const currentPath = `/${segments.join("/")}`;
                const isLoginPage =
                    currentPath === "/(tabs)" ||
                    currentPath === "/(tabs)/index" ||
                    segments.length === 1;

                if (isLoginPage) {
                    // Usar replace para evitar que puedan volver atrás al login
                    router.replace("/(tabs)/home");
                }
            }
        }
    }, [token, isLoading, segments]);

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: Colors.cream }}
            >
                <ActivityIndicator size="large" color={Colors.brown} />
            </View>
        );
    }

    return <>{children}</>;
}
