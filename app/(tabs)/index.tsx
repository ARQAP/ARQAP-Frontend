import { useIsAuthenticated, useLoginMutation } from "@/hooks/useUserAuth";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../../constants/Colors";

export default function IndexScreen() {
    const [fontsLoaded] = useFonts({
        MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
        CrimsonText: require("../../assets/fonts/CrimsonText-Regular.ttf"),
    });

    const router = useRouter();
    const { data: token, isLoading } = useIsAuthenticated();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const loginMutation = useLoginMutation();

    // Si ya está autenticado, redirigir inmediatamente
    useEffect(() => {
        if (!isLoading && token) {
            router.replace("/(tabs)/home");
        }
    }, [token, isLoading, router]);

    const handleLogin = async () => {
        if (!username || !password) return;

        try {
            await loginMutation.mutateAsync({ username, password });
            // El useEffect se encargará de la redirección
            setUsername("");
            setPassword("");
        } catch (error) {
            console.error("Error en login:", error);
        }
    };

    if (!fontsLoaded || (token && !isLoading)) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={Colors.brown} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            style={{ backgroundColor: Colors.cream }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 justify-center items-center px-4">
                    <View
                        className="rounded-2xl p-6 sm:p-8 w-full max-w-md items-center"
                        style={{ backgroundColor: Colors.cremitLight }}
                    >
                        <Text
                            className="text-[45px] font-bold text-center w-full"
                            style={{
                                fontFamily: "MateSC-Regular",
                                color: Colors.brown,
                            }}
                        >
                            ARQAP
                        </Text>
                        <Text
                            className="text-[18px] sm:text-[22px] text-center mb-6"
                            style={{
                                fontFamily: "MateSC",
                                letterSpacing: 1,
                                color: Colors.brown,
                            }}
                        >
                            Museo de ciencias naturales
                        </Text>
                        <Text
                            className="text-[16px] sm:text-[20px] text-center mb-4"
                            style={{
                                fontFamily: "CrimsonText-Regular",
                                color: Colors.accent,
                            }}
                        >
                            Iniciar Sesión
                        </Text>

                        <View className="w-full mb-4">
                            <View
                                className="flex-row items-center border-2 rounded-lg mb-2"
                                style={{
                                    borderColor: Colors.accent,
                                    backgroundColor: "#F7F5F2",
                                }}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={22}
                                    color={Colors.accent}
                                    style={{ marginRight: 6 }}
                                    className="pl-2 mr-2"
                                />
                                <TextInput
                                    placeholder="Ingresa tu usuario"
                                    placeholderTextColor={Colors.accent}
                                    className="flex-1 h-11 text-base text-[#222]"
                                    style={{
                                        fontFamily: "CrimsonText-Regular",
                                        borderWidth: 0,
                                        outlineWidth: 0,
                                    }}
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>

                            <View
                                className="flex-row items-center border-2 rounded-lg"
                                style={{
                                    borderColor: Colors.accent,
                                    backgroundColor: "#F7F5F2",
                                }}
                            >
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={22}
                                    color={Colors.accent}
                                    style={{ marginRight: 6 }}
                                    className="pl-2 mr-2"
                                />
                                <TextInput
                                    placeholder="**************"
                                    placeholderTextColor={Colors.accent}
                                    secureTextEntry
                                    className="flex-1 h-11 text-base text-[#222] pt-1"
                                    style={{
                                        fontFamily: "CrimsonText-Regular",
                                        borderWidth: 0,
                                        outlineWidth: 0,
                                    }}
                                    value={password}
                                    onChangeText={setPassword}
                                    onSubmitEditing={handleLogin}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            disabled={loginMutation.isPending}
                            className="rounded-lg w-full py-3 mt-2"
                            style={{
                                backgroundColor: loginMutation.isPending
                                    ? Colors.accent
                                    : Colors.green,
                            }}
                            onPress={handleLogin}
                        >
                            {loginMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text
                                    className="text-white text-base text-center"
                                    style={{
                                        fontFamily: "CrimsonText-Regular",
                                    }}
                                >
                                    Iniciar sesión
                                </Text>
                            )}
                        </TouchableOpacity>

                        {loginMutation.isError && (
                            <Text
                                className="text-center mt-3"
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    color: "#b91c1c",
                                }}
                            >
                                {(loginMutation.error as Error).message ===
                                "Request failed with status code 401"
                                    ? "Usuario o contraseña incorrectos"
                                    : (loginMutation.error as Error).message ||
                                      "Error al iniciar sesión"}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
