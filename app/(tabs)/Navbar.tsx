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
        // Intentar usar back() siempre que sea posible para animación suave
        // Si hay un redirectTo específico, verificar si podemos usar back()
        if (redirectTo) {
            // Para rutas específicas, usar push pero con animación
            // Esto evita la pantalla negra que causa replace()
            router.push(redirectTo as any);
            return;
        }

        if (backToHome) {
            // Para home, usar push con animación
            router.push("/(tabs)/home");
            return;
        }

        // Para navegación normal hacia atrás, usar back() para animación correcta
        // Esto funciona tanto para modales como para navegación normal
        router.back();
    };

    const handleLogoPress = () => {
        // Para el logo, siempre ir a home con replace
        router.replace("/(tabs)/home");
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
