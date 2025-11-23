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
        if (!isLoading && isMounted && segments.length > 0) {
            const inAuthGroup = segments[0] === "(tabs)";

            if (!token && inAuthGroup) {
                // Si no hay token, ir al login
                const currentPath = `/${segments.join("/")}`;
                const isLoginPage =
                    currentPath === "/(tabs)" ||
                    currentPath === "/(tabs)/index";
                if (!isLoginPage) {
                    // Usar setTimeout para asegurar que el router esté listo
                    setTimeout(() => {
                        router.replace("/(tabs)");
                    }, 0);
                }
            } else if (token && inAuthGroup) {
                // Si hay token, verificar si está en login
                const currentPath = `/${segments.join("/")}`;
                const isLoginPage =
                    currentPath === "/(tabs)" ||
                    currentPath === "/(tabs)/index" ||
                    segments.length === 1;

                if (isLoginPage) {
                    // Usar setTimeout para asegurar que el router esté listo
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
