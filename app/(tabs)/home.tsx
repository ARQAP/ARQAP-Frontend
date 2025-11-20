import { useAllArchaeologicalSites } from "@/hooks/useArchaeologicalsite";
import { useArchaeologists } from "@/hooks/useArchaeologist";
import { useArtefacts } from "@/hooks/useArtefact";
import { useCollections } from "@/hooks/useCollections";
import { useLoans } from "@/hooks/useLoan";
import { useLogoutMutation } from "@/hooks/useUserAuth";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ActionButton from "../../components/ui/ActionButton";
import Colors from "../../constants/Colors";
import Card from "./Card";
import Navbar from "./Navbar";

export default function HomeScreen() {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const router = useRouter();

    const logoutMutation = useLogoutMutation();

    const { data: artefacts = [] } = useArtefacts();
    const { data: collections = [] } = useCollections();
    const { data: sites = [] } = useAllArchaeologicalSites();
    const { data: archaeologists = [] } = useArchaeologists();
    const { data: loans = [] } = useLoans();

    const activeLoans = loans.filter(
        (loan) => !loan.returnDate || !loan.returnTime
    );

    // Interceptar el botón de atrás del hardware en Android
    useEffect(() => {
        if (Platform.OS === "android") {
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                () => {
                    // Prevenir navegación hacia atrás desde home
                    return true; // true = interceptar y no permitir
                }
            );

            return () => backHandler.remove();
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            // ProtectedRoute se encargará de redirigir al login
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                "MateSC-Regular": require("../../assets/fonts/MateSC-Regular.ttf"),
                "CrimsonText-Regular": require("../../assets/fonts/CrimsonText-Regular.ttf"),
                "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),
            });
            setFontsLoaded(true);
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color={Colors.brown} />
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
            <Navbar title="Inicio" />
            <ScrollView className="pb-8" showsVerticalScrollIndicator={false}>
                <View className="items-center mt-8 mb-8">
                    <Text
                        className="text-[45px] font-bold text-center w-full"
                        style={{
                            fontFamily: "MateSC-Regular",
                            color: Colors.brown,
                        }}
                    >
                        ARQAP
                    </Text>
                </View>
                <View className="items-center mb-8">
                    <Text
                        className="text-[30px] font-bold text-center w-full"
                        style={{
                            fontFamily: "MateSC-Regular",
                            color: Colors.brown,
                        }}
                    >
                        Museo De Ciencias Naturales
                    </Text>
                </View>
                <Card
                    title="Piezas Arqueológicas"
                    subtitle="Registrar y Gestionar las piezas"
                    icon="archive-outline"
                    cubeCount={artefacts.length}
                />
                <Card
                    title="Colecciones Arqueológicas"
                    subtitle="Organizar por colecciones"
                    icon="book-outline"
                    cubeCount={collections.length}
                />
                <Card
                    title="Sitios Arqueológicos"
                    subtitle="Gestionar ubicaciones"
                    icon="location-outline"
                    cubeCount={sites.length}
                />
                <Card
                    title="Arqueólogos"
                    subtitle="Gestionar Especialistas"
                    icon="person-outline"
                    cubeCount={archaeologists.length}
                />
                <Card
                    title="Préstamos"
                    subtitle="Préstamos activos"
                    icon="swap-horizontal-outline"
                    cubeCount={activeLoans.length}
                />
                <View className="items-center mt-7 pb-8">
                    <Text
                        className="text-[28px] font-bold text-[#8B5E3C] mb-3"
                        style={{ fontFamily: "MateSC-Regular" }}
                    >
                        Acciones rápidas
                    </Text>
                    <View className="flex-col md:flex-row justify-center items-center mt-4 gap-4 sm:gap-5 md:gap-4 lg:gap-6 xl:gap-8 w-full md:flex-nowrap md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
                        <ActionButton
                            title="Nueva Pieza"
                            onPress={() =>
                                router.push(
                                    "/(tabs)/archaeological-Pieces/New_piece"
                                )
                            }
                        />
                        <ActionButton
                            title="Nuevo Arqueólogo"
                            onPress={() =>
                                router.push(
                                    "/(tabs)/archaeologist/New_archaeologist"
                                )
                            }
                        />
                        <ActionButton
                            title="Nueva Colección"
                            onPress={() =>
                                router.push("/(tabs)/collection/New_collection")
                            }
                        />
                    </View>
                </View>

                <View className="items-center mt-8 pb-8">
                    <TouchableOpacity
                        onPress={handleLogout}
                        disabled={logoutMutation.isPending}
                        className={`rounded-lg px-8 py-3 ${
                            logoutMutation.isPending
                                ? "bg-gray-400"
                                : "bg-[#A3473B]"
                        }`}
                    >
                        {logoutMutation.isPending ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator size="small" color="#fff" />
                                <Text
                                    className="text-white text-base ml-2"
                                    style={{
                                        fontFamily: "CrimsonText-Regular",
                                    }}
                                >
                                    Cerrando sesión...
                                </Text>
                            </View>
                        ) : (
                            <Text
                                className="text-white text-base font-medium"
                                style={{ fontFamily: "CrimsonText-Regular" }}
                            >
                                Cerrar Sesión
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
