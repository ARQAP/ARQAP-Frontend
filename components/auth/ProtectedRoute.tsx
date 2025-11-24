import { useIsAuthenticated } from "@/hooks/useUserAuth";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Colors from "../../constants/Colors";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { data: token, isLoading } = useIsAuthenticated();
    const router = useRouter();
    const segments = useSegments();
    const [isMounted, setIsMounted] = useState(false);

    // Asegurarse de que el componente esté montado antes de navegar
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Esperar a que el componente esté montado y el router esté listo
        if (!isLoading && isMounted) {
            // Si aún no hay segments, esperar un poco más
            if (segments.length === 0) {
                // Si no hay token, asegurarse de ir a login
                if (!token) {
                    setTimeout(() => {
                        router.replace("/(tabs)");
                    }, 100);
                }
                return;
            }

            const inAuthGroup = segments[0] === "(tabs)";
            const currentPath = `/${segments.join("/")}`;
            const isLoginPage =
                currentPath === "/(tabs)" ||
                currentPath === "/(tabs)/index";

            if (!token) {
                // Si no hay token, ir al login
                if (inAuthGroup && !isLoginPage) {
                    setTimeout(() => {
                        router.replace("/(tabs)");
                    }, 0);
                } else if (!inAuthGroup) {
                    setTimeout(() => {
                        router.replace("/(tabs)");
                    }, 0);
                }
            } else if (token && inAuthGroup) {
                // Si hay token y está en login, redirigir a home
                // Solo redirigir si realmente está en la página de login exacta
                if (isLoginPage) {
                    setTimeout(() => {
                        router.replace("/(tabs)/home");
                    }, 0);
                }
            }
        }
    }, [token, isLoading, segments, isMounted, router]);

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
