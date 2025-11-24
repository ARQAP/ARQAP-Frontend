import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CollectionCard, GenericList } from "../../../components/ui";
import Button from "../../../components/ui/Button";
import SimplePickerModal, {
    type SimplePickerItem,
} from "../../../components/ui/SimpleModal";
import {
    useCollections,
    useDeleteCollection,
} from "../../../hooks/useCollections";
import { Collection } from "../../../repositories/collectionRepository";
import Navbar from "../Navbar";

export default function ViewCollection() {
    const [fontsLoaded] = useFonts({
        "MateSC-Regular": require("../../../assets/fonts/MateSC-Regular.ttf"),
        "CrimsonText-Regular": require("../../../assets/fonts/CrimsonText-Regular.ttf"),
    });

    const router = useRouter();
    const [selectedCollectionId, setSelectedCollectionId] = useState<
        number | string | null
    >(null);
    const [searchText, setSearchText] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    // Hooks de react-query
    const {
        data: collections = [],
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useCollections();
    const deleteMutation = useDeleteCollection();

    // Preparar items para el SimplePickerModal
    const collectionItems = useMemo<SimplePickerItem<Collection>[]>(() => {
        return collections.map((collection) => ({
            value: collection.id || `${collection.name}`,
            label: collection.name,
            raw: collection,
        }));
    }, [collections]);

    // Filtrado basado en selección o búsqueda por texto
    const filteredCollections = useMemo(() => {
        if (selectedCollectionId) {
            return collections.filter(
                (collection) =>
                    collection.id === selectedCollectionId ||
                    `${collection.name}` === selectedCollectionId
            );
        }
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            return collections.filter((collection) =>
                collection.name.toLowerCase().includes(searchLower)
            );
        }
        return collections;
    }, [collections, selectedCollectionId, searchText]);

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
            const errorMessage =
                (error as Error).message || "Error al eliminar la colección.";
            Alert.alert("Error", errorMessage);
        }
    };

    const clearSearch = () => {
        setSelectedCollectionId(null);
        setSearchText("");
    };

    const searchDisplayText = useMemo(() => {
        if (selectedCollectionId) {
            return collectionItems.find((i) => i.value === selectedCollectionId)
                ?.label;
        }
        if (searchText) {
            return `Buscando: "${searchText}"`;
        }
        return null;
    }, [selectedCollectionId, searchText, collectionItems]);

    const renderCollectionCard = (collection: Collection) => (
        <CollectionCard
            collection={collection}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );

    if (!fontsLoaded || isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#F3E9DD",
                }}
            >
                <ActivityIndicator size="large" color="#8B5E3C" />
                <Text
                    style={{
                        marginTop: 10,
                        color: "#8B5E3C",
                        fontFamily: "CrimsonText-Regular",
                    }}
                >
                    Cargando colecciones...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F3E9DD] p-0">
            <Navbar title="Colecciones Arqueológicas" showBackArrow />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Platform.OS === "web" ? 32 : 20,
                    paddingTop: Platform.OS === "web" ? 40 : 20,
                    paddingBottom: Platform.OS === "web" ? 32 : 20,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        maxWidth: 1100,
                        alignSelf: "center",
                    }}
                >
                    {/* Encabezado */}
                    <View
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 16,
                            padding: 28,
                            marginBottom: 32,
                            shadowColor: "#8B5E3C",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 3,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: "MateSC-Regular",
                                fontSize: 28,
                                color: "#8B5E3C",
                                marginBottom: 8,
                                fontWeight: "600",
                            }}
                        >
                            Gestión de Colecciones
                        </Text>
                        <Text
                            style={{
                                fontFamily: "CrimsonText-Regular",
                                fontSize: 16,
                                color: "#A0785D",
                                marginBottom: 24,
                            }}
                        >
                            Administra y consulta el registro de colecciones
                            arqueológicas del sistema
                        </Text>

                        <Button
                            title="+ Registrar nueva colección"
                            onPress={() =>
                                router.push(
                                    "/(tabs)/collection/New_collection" as any
                                )
                            }
                            textStyle={{
                                fontFamily: "MateSC-Regular",
                                fontWeight: "bold",
                                fontSize: 15,
                            }}
                        />
                    </View>

                    {/* Búsqueda */}
                    <View
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 16,
                            padding: 24,
                            marginBottom: 24,
                            shadowColor: "#8B5E3C",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 3,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: "MateSC-Regular",
                                fontSize: 18,
                                color: "#8B5E3C",
                                marginBottom: 16,
                                fontWeight: "600",
                            }}
                        >
                            Búsqueda
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowPicker(true)}
                            style={{
                                backgroundColor: "#F7F5F2",
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderWidth: 1,
                                borderColor: "#E5D4C1",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Ionicons
                                name="search"
                                size={18}
                                color="#8B5E3C"
                                style={{ marginRight: 8 }}
                            />
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: searchDisplayText
                                        ? "#8B5E3C"
                                        : "#B8967D",
                                    flex: 1,
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {searchDisplayText || "Buscar colección..."}
                            </Text>
                        </TouchableOpacity>

                        {(selectedCollectionId || searchText) && (
                            <TouchableOpacity
                                onPress={clearSearch}
                                style={{
                                    marginTop: 12,
                                    alignSelf: "flex-start",
                                    backgroundColor: "#E5D4C1",
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 14,
                                        color: "#8B5E3C",
                                        fontWeight: "600",
                                    }}
                                >
                                    ✕ Limpiar búsqueda
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 16,
                                paddingTop: 16,
                                borderTopWidth: 1,
                                borderTopColor: "#E5D4C1",
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: "#8B5E3C",
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    marginRight: 10,
                                }}
                            />
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 17,
                                    color: "#8B5E3C",
                                    fontWeight: "600",
                                }}
                            >
                                {filteredCollections.length}{" "}
                                {filteredCollections.length === 1
                                    ? "Colección encontrada"
                                    : "Colecciones encontradas"}
                            </Text>
                        </View>
                    </View>

                    {/* Lista de colecciones */}
                    <View
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 16,
                            padding: 24,
                            shadowColor: "#8B5E3C",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 3,
                        }}
                    >
                        {filteredCollections.length === 0 ? (
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 15,
                                    color: "#8B5E3C",
                                }}
                            >
                                No hay colecciones registradas.
                            </Text>
                        ) : (
                            <View style={{ flex: 1 }}>
                                <GenericList
                                    data={filteredCollections}
                                    renderItem={renderCollectionCard}
                                    keyExtractor={(item) =>
                                        item.id?.toString() || ""
                                    }
                                    isLoading={false}
                                    isRefreshing={isRefetching}
                                    onRefresh={refetch}
                                    emptyStateMessage="No hay colecciones registradas"
                                    error={
                                        isError
                                            ? (error as Error)?.message
                                            : null
                                    }
                                    customStyles={{
                                        container: {
                                            backgroundColor: "transparent",
                                            paddingTop: 0,
                                        },
                                    }}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <SimplePickerModal
                visible={showPicker}
                title="Seleccionar Colección"
                items={collectionItems}
                selectedValue={selectedCollectionId}
                onSelect={(value) => {
                    setSelectedCollectionId(value);
                    setSearchText("");
                    setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
                onSearchTextChange={(text) => {
                    setSearchText(text);
                    setSelectedCollectionId(null);
                }}
            />
        </View>
    );
}
