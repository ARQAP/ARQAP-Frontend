import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Navbar from "../Navbar";
import { useCollections, useDeleteCollection } from "../../../hooks/useCollections";

export default function ViewCollection() {
    const [fontsLoaded] = useFonts({
        "MateSC-Regular": require("../../../assets/fonts/MateSC-Regular.ttf"),
        "CrimsonText-Regular": require("../../../assets/fonts/CrimsonText-Regular.ttf"),
    });

    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [menuVisible, setMenuVisible] = useState<string | null>(null);
    
    // Hooks de react-query
    const { data: collections = [], isLoading, isError, error } = useCollections();
    const deleteMutation = useDeleteCollection();

    const filteredCollections = collections.filter((collection) =>
        collection.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleEdit = (id: number) => {
        setMenuVisible(null);
        router.push({
            pathname: "/(tabs)/collection/Edit_collection",
            params: { id: String(id) },
        });
    };

    const handleDelete = (id: number) => {
        setMenuVisible(null);
        
        const collection = collections.find(c => c.id === id);
        const collectionName = collection?.name || "esta colección";

        const doDelete = () => {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    Alert.alert("Éxito", "Colección eliminada correctamente.");
                },
                onError: (error) => {
                    const errorMessage = (error as Error).message || "Error al eliminar la colección.";
                    Alert.alert("Error", errorMessage);
                },
            });
        };

        if (Platform.OS === "web") {
            const confirmed = window.confirm(
                `¿Eliminar ${collectionName}? Esta acción es irreversible.`
            );
            if (confirmed) doDelete();
            return;
        }

        Alert.alert(
            "Eliminar",
            `¿Eliminar ${collectionName}? Esta acción es irreversible.`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: doDelete },
            ],
            { cancelable: true }
        );
    };

    if (!fontsLoaded || isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#F3E9DD]">
                <ActivityIndicator size="large" color="#8B5E3C" />
            </View>
        );
    }

    if (isError) {
        return (
            <View className="flex-1 bg-[#F3E9DD] justify-center items-center px-4">
                <Text style={{ fontFamily: "MateSC-Regular", color: 'red', marginBottom: 8 }}>
                    Error al cargar las colecciones
                </Text>
                <Text style={{ fontFamily: "CrimsonText-Regular", color: '#666' }}>
                    {(error as Error)?.message}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F3E9DD]">
            <Navbar
                title="Colecciones Arqueológicas"
                showBackArrow
                backToHome
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-5 mt-6">
                    <TouchableOpacity
                        className="bg-[#6B705C] rounded-xl py-4 items-center"
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push(
                                "/(tabs)/collection/New_collection" as any
                            )
                        }
                    >
                        <Text
                            className="text-white text-lg"
                            style={{ fontFamily: "MateSC-Regular" }}
                        >
                            Registrar Colección Arqueológica
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="px-5 mt-6">
                    <View className="flex-row items-center border-2 border-[#6B705C] rounded-lg px-3 py-2 bg-white">
                        <FontAwesome
                            name="search"
                            size={20}
                            color="#6B705C"
                            style={{ marginRight: 8 }}
                        />
                        <TextInput
                            placeholder="Buscar por nombre"
                            placeholderTextColor="#A68B5B"
                            className="flex-1 text-base text-[#222]"
                            style={{ fontFamily: "CrimsonText-Regular" }}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>

                <View className="px-5 mt-4">
                    <Text
                        className="text-[#8B5E3C] text-base"
                        style={{ fontFamily: "MateSC-Regular" }}
                    >
                        {filteredCollections.length} Colecciones Arqueológicas encontradas
                    </Text>
                </View>

                <Pressable
                    className="px-5 mt-4 pb-8"
                    onPress={() => menuVisible && setMenuVisible(null)}
                >
                    {filteredCollections.map((collection) => (
                        <Pressable
                            key={collection.id}
                            className="bg-[#D9C6A5] rounded-2xl p-4 mb-4"
                            onPress={() => {}}
                        >
                            {/* Header con título y menú */}
                            <View className="flex-row justify-between items-start mb-3">
                                <Text
                                    className="text-black text-2xl flex-1"
                                    style={{ fontFamily: "MateSC-Regular" }}
                                >
                                    {collection.name}
                                </Text>
                                <TouchableOpacity
                                    className="p-2"
                                    onPress={() =>
                                        setMenuVisible(
                                            menuVisible === String(collection.id)
                                                ? null
                                                : String(collection.id)
                                        )
                                    }
                                >
                                    <FontAwesome
                                        name="ellipsis-v"
                                        size={20}
                                        color="#222"
                                    />
                                </TouchableOpacity>
                            </View>

                            {menuVisible === String(collection.id) && (
                                <View
                                    className="absolute right-4 top-12 bg-white rounded-lg shadow-lg w-40"
                                    style={{ elevation: 10, zIndex: 1000 }}
                                >
                                    <TouchableOpacity
                                        className="flex-row items-center px-4 py-3 border-b border-gray-200"
                                        onPress={() => handleEdit(collection.id!)}
                                    >
                                        <FontAwesome
                                            name="edit"
                                            size={16}
                                            color="#8B5E3C"
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text
                                            className="text-base text-[#8B5E3C]"
                                            style={{
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                            }}
                                        >
                                            Editar
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-row items-center px-4 py-3"
                                        onPress={() => handleDelete(collection.id!)}
                                    >
                                        <FontAwesome
                                            name="trash"
                                            size={16}
                                            color="#8B5E3C"
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text
                                            className="text-base text-[#8B5E3C]"
                                            style={{
                                                fontFamily:
                                                    "CrimsonText-Regular",
                                            }}
                                        >
                                            Eliminar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Descripción */}
                            <View className="bg-[#2F2F2F] rounded-lg p-3 mb-3">
                                <Text
                                    className="text-white text-sm"
                                    style={{
                                        fontFamily: "CrimsonText-Regular",
                                    }}
                                >
                                    {collection.description || "Sin descripción"}
                                </Text>
                            </View>

                            {/* Año */}
                            {collection.year && (
                                <View className="bg-[#6B705C] rounded-lg p-3 mb-2 flex-row items-center">
                                    <FontAwesome
                                        name="calendar"
                                        size={18}
                                        color="#FFF"
                                        style={{ marginRight: 10 }}
                                    />
                                    <View className="flex-1">
                                        <Text
                                            className="text-white text-xs opacity-80"
                                            style={{
                                                fontFamily: "CrimsonText-Regular",
                                            }}
                                        >
                                            Año
                                        </Text>
                                        <Text
                                            className="text-white text-base"
                                            style={{
                                                fontFamily: "CrimsonText-Regular",
                                            }}
                                        >
                                            {collection.year}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </Pressable>
            </ScrollView>
        </View>
    );
}
