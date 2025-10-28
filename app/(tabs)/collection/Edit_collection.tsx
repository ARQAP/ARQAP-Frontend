import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import { useUpdateCollection, useCollections } from "../../../hooks/useCollections";

export default function EditCollection() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
    
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [year, setYear] = useState("");
    
    const { data: collections = [], isLoading } = useCollections();
    const updateMutation = useUpdateCollection();

    // Cargar datos de la colección
    useEffect(() => {
        const collection = collections.find(c => c.id === id);
        if (collection) {
            setNombre(collection.name);
            setDescripcion(collection.description || "");
            setYear(collection.year ? String(collection.year) : "");
        }
    }, [collections, id]);

    const handleEditar = () => {
        if (!nombre.trim()) {
            Alert.alert("Error", "El nombre es obligatorio.");
            return;
        }

        const yearNum = year.trim() ? parseInt(year) : undefined;
        if (year.trim() && (isNaN(yearNum!) || yearNum! < 1000 || yearNum! > 9999)) {
            Alert.alert("Error", "El año debe ser un número válido de 4 dígitos.");
            return;
        }

        updateMutation.mutate(
            {
                id,
                payload: {
                    name: nombre.trim(),
                    description: descripcion.trim() || undefined,
                    year: yearNum,
                },
            },
            {
                onSuccess: () => {
                    Alert.alert("Éxito", "Colección actualizada correctamente.");
                    router.back();
                },
                onError: (error) => {
                    const errorMessage = (error as Error).message || "Error al actualizar la colección.";
                    Alert.alert("Error", errorMessage);
                },
            }
        );
    };

    const handleCancelar = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-[#F7F0E6] justify-center items-center">
                <ActivityIndicator size="large" color="#8B5E3C" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F7F0E6]">
            <Navbar
                title="Editar Colección Arqueológica"
                showBackArrow
                backToHome={false}
            />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="w-full px-5 mt-6">
                    <Text
                        className="text-center text-[18px] mb-6 text-[#222]"
                        style={{ fontFamily: "CrimsonText-Regular" }}
                    >
                        Modifique los datos de la colección arqueológica
                    </Text>

                    <View className="mb-4">
                        <Text
                            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
                            style={{ fontFamily: "MateSC-Regular" }}
                        >
                            Nombre *
                        </Text>
                        <TextInput
                            className="border-2 border-[#8B5E3C] rounded-lg p-3 bg-white text-[16px]"
                            style={{
                                fontFamily: "CrimsonText-Regular",
                            }}
                            placeholder="Nombre de la colección"
                            value={nombre}
                            onChangeText={setNombre}
                            placeholderTextColor="#A68B5B"
                            selectionColor="#8B5E3C"
                        />
                    </View>

                    <View className="mb-4">
                        <Text
                            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
                            style={{ fontFamily: "MateSC-Regular" }}
                        >
                            Descripción
                        </Text>
                        <TextInput
                            className="border-2 border-[#8B5E3C] rounded-lg p-3 bg-white text-[16px]"
                            style={{
                                fontFamily: "CrimsonText-Regular",
                                minHeight: 120,
                                textAlignVertical: "top",
                            }}
                            placeholder="Descripción detallada de la colección"
                            value={descripcion}
                            onChangeText={setDescripcion}
                            placeholderTextColor="#A68B5B"
                            selectionColor="#8B5E3C"
                            multiline
                            numberOfLines={5}
                        />
                    </View>

                    <View className="mb-6">
                        <Text
                            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
                            style={{ fontFamily: "MateSC-Regular" }}
                        >
                            Año
                        </Text>
                        <TextInput
                            className="border-2 border-[#8B5E3C] rounded-lg p-3 bg-white text-[16px]"
                            style={{
                                fontFamily: "CrimsonText-Regular",
                            }}
                            placeholder="Ej: 2024"
                            value={year}
                            onChangeText={setYear}
                            placeholderTextColor="#A68B5B"
                            selectionColor="#8B5E3C"
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>

                    <Button
                        title={updateMutation.isPending ? "Guardando..." : "GUARDAR CAMBIOS"}
                        onPress={handleEditar}
                        disabled={updateMutation.isPending}
                        className={`w-full mb-4 rounded-lg py-4 items-center ${updateMutation.isPending ? 'bg-gray-400' : 'bg-[#6B705C]'}`}
                        textClassName="text-[16px] font-bold text-white"
                        textStyle={{ fontFamily: "MateSC-Regular" }}
                    />

                    <Button
                        title="CANCELAR"
                        onPress={handleCancelar}
                        className="w-full mb-4 rounded-lg py-4 items-center bg-[#D9C6A5]"
                        textClassName="text-[16px] font-bold text-white"
                        textStyle={{ fontFamily: "MateSC-Regular" }}
                    />

                    <View className="h-8" />
                </View>
            </ScrollView>
        </View>
    );
}
