import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { CollectionCard, GenericList } from "../../../components/ui";
import { useCollections, useDeleteCollection } from "../../../hooks/useCollections";
import { Collection } from "../../../repositories/collectionRepository";
import Navbar from "../Navbar";

export default function ViewCollection() {
    const [fontsLoaded] = useFonts({
        "MateSC-Regular": require("../../../assets/fonts/MateSC-Regular.ttf"),
        "CrimsonText-Regular": require("../../../assets/fonts/CrimsonText-Regular.ttf"),
    });

    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    
    // Hooks de react-query
    const { data: collections = [], isLoading, isError, error, refetch, isRefetching } = useCollections();
    const deleteMutation = useDeleteCollection();

    const filteredCollections = collections.filter((collection) =>
        collection.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleEdit = (collection: Collection) => {
        router.push({
            pathname: "/(tabs)/collection/Edit_collection",
            params: { id: String(collection.id) },
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            Alert.alert("Éxito", "Colección eliminada correctamente.");
        } catch (error) {
            const errorMessage = (error as Error).message || "Error al eliminar la colección.";
            Alert.alert("Error", errorMessage);
        }
    };

    const renderCollectionCard = (collection: Collection) => (
        <CollectionCard
            collection={collection}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );

    if (!fontsLoaded) {
        return (
            <View className="flex-1 justify-center items-center bg-[#F3E9DD]">
                <ActivityIndicator size="large" color="#8B5E3C" />
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

            {/* Contenedor responsive - diferentes layouts para web y móvil */}
            {Platform.OS === 'web' ? (
                // Layout para web
                <View style={{ 
                    flex: 1,
                    paddingHorizontal: 20,
                }}>
                    <View style={{ 
                        width: '100%', 
                        maxWidth: 900,
                        alignSelf: 'center',
                    }}>
                        {/* Header con botón de crear y búsqueda */}
                        <View className="mt-6">
                            <TouchableOpacity
                                className="bg-[#6B705C] rounded-xl py-4 items-center mb-6"
                                activeOpacity={0.8}
                                onPress={() =>
                                    router.push("/(tabs)/collection/New_collection" as any)
                                }
                            >
                                <Text
                                    className="text-white text-lg"
                                    style={{ fontFamily: "MateSC-Regular" }}
                                >
                                    Registrar Colección Arqueológica
                                </Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center border-2 border-[#6B705C] rounded-lg px-3 py-2 bg-white mb-4">
                                <Ionicons
                                    name="search-outline"
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

                            <Text
                                className="text-[#8B5E3C] text-base mb-2"
                                style={{ fontFamily: "MateSC-Regular" }}
                            >
                                {filteredCollections.length} Colecciones Arqueológicas encontradas
                            </Text>
                        </View>

                        {/* Lista de colecciones usando el componente estandarizado */}
                        <View className="flex-1">
                            <GenericList
                                data={filteredCollections}
                                renderItem={renderCollectionCard}
                                keyExtractor={(item) => item.id?.toString() || ''}
                                isLoading={isLoading}
                                isRefreshing={isRefetching}
                                onRefresh={refetch}
                                emptyStateMessage="No hay colecciones registradas"
                                error={isError ? (error as Error)?.message : null}
                                customStyles={{
                                    container: { backgroundColor: 'transparent', paddingTop: 0 }
                                }}
                            />
                        </View>
                    </View>
                </View>
            ) : (
                // Layout para móvil - estructura simple
                <View style={{ flex: 1, padding: 20 }}>
                    {/* Header con botón de crear y búsqueda */}
                    <View style={{ marginTop: 20 }}>
                        <TouchableOpacity
                            className="bg-[#6B705C] rounded-xl py-4 items-center mb-6"
                            activeOpacity={0.8}
                            onPress={() =>
                                router.push("/(tabs)/collection/New_collection" as any)
                            }
                        >
                            <Text
                                className="text-white text-lg"
                                style={{ fontFamily: "MateSC-Regular" }}
                            >
                                Registrar Colección Arqueológica
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center border-2 border-[#6B705C] rounded-lg px-3 py-2 bg-white mb-4">
                            <Ionicons
                                name="search-outline"
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

                        <Text
                            className="text-[#8B5E3C] text-base mb-2"
                            style={{ fontFamily: "MateSC-Regular" }}
                        >
                            {filteredCollections.length} Colecciones Arqueológicas encontradas
                        </Text>
                    </View>

                    {/* Lista de colecciones usando el componente estandarizado */}
                    <View style={{ flex: 1 }}>
                        <GenericList
                            data={filteredCollections}
                            renderItem={renderCollectionCard}
                            keyExtractor={(item) => item.id?.toString() || ''}
                            isLoading={isLoading}
                            isRefreshing={isRefetching}
                            onRefresh={refetch}
                            emptyStateMessage="No hay colecciones registradas"
                            error={isError ? (error as Error)?.message : null}
                            customStyles={{
                                container: { backgroundColor: 'transparent', paddingTop: 0 }
                            }}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}
