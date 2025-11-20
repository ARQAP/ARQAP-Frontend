import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
    title: string;
    showBackArrow?: boolean;
    backToHome?: boolean;
    redirectTo?: string;
}

function Navbar({ title, showBackArrow, backToHome, redirectTo }: NavbarProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (backToHome) {
            // Para ir al home desde cualquier lugar, usar replace con animación hacia la derecha
            router.replace("/(tabs)/home");
        } else if (redirectTo) {
            // Si hay una ruta específica, usar back() para mantener la pila de navegación
            router.back();
        } else {
            // Navegación normal hacia atrás - esto mostrará deslizamiento hacia la derecha
            router.back();
        }
    };

    const handleLogoPress = () => {
        // Para el logo, verificar si ya estamos en home
        const currentRoute = router.canGoBack();
        if (currentRoute) {
            // Si podemos ir atrás, usar replace para evitar duplicar home
            router.replace("/(tabs)/home");
        }
    };

    return (
        <View
            className="w-full bg-[#D9C6A5] flex-row items-center h-[80px] px-4"
            style={{
                position: "relative",
                paddingTop: insets.top,
                height: 80 + insets.top,
            }}
        >
            <View
                className="flex-1 flex-row items-center"
                style={{ maxWidth: "100%" }}
            >
                {showBackArrow && (
                    <TouchableOpacity
                        onPress={handleBackPress}
                        className="mr-2"
                        activeOpacity={1}
                    >
                        <Text
                            className="text-[32px] text-[#222]"
                            style={{
                                fontFamily: "MateSC-Regular",
                            }}
                        >
                            {"\u2190"}
                        </Text>
                    </TouchableOpacity>
                )}

                <Text
                    className="font-bold text-xl text-black flex-shrink leading-tight"
                    style={{
                        fontFamily: "MateSC-Regular",
                        lineHeight: 24,
                        fontSize: 20,
                    }}
                    numberOfLines={2}
                >
                    {title}
                </Text>
            </View>

            <TouchableOpacity
                onPress={handleLogoPress}
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 15,
                    paddingTop: 15,
                    paddingBottom: 15,
                }}
                activeOpacity={0.7}
            >
                <Image
                    source={require("../../assets/images/museo.png")}
                    style={{
                        width: 50,
                        height: 50,
                        resizeMode: "contain",
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        overflow: "hidden",
                    }}
                    fadeDuration={0}
                    accessible={true}
                    accessibilityLabel="Logo del Museo - Ir al inicio"
                />
            </TouchableOpacity>
        </View>
    );
}

export default Navbar;
