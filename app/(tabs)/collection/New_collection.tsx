import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";
import { useCreateCollection } from "../../../hooks/useCollections";
import { Collection } from "../../../repositories/collectionRepository";

export default function NewCollection() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [year, setYear] = useState("");
    
    const createMutation = useCreateCollection();
    const isButtonDisabled = createMutation.isPending || !nombre.trim();

    const handleCrear = () => {
        if (!nombre.trim()) {
            Alert.alert("Error", "El nombre es obligatorio.");
            return;
        }

        const yearNum = year.trim() ? parseInt(year) : undefined;
        if (year.trim() && (isNaN(yearNum!) || yearNum! < 1000 || yearNum! > 9999)) {
            Alert.alert("Error", "El año debe ser un número válido de 4 dígitos.");
            return;
        }

        const newCollection: Collection = {
            name: nombre.trim(),
            description: descripcion.trim() || undefined,
            year: yearNum,
        };

        createMutation.mutate(newCollection, {
            onSuccess: () => {
                Alert.alert("Éxito", "Colección registrada correctamente.");
                router.back();
            },
            onError: (error) => {
                const errorMessage = (error as Error).message || "Ocurrió un error al crear la colección.";
                Alert.alert("Error", errorMessage);
            },
        });
    };

    return (
        <View className="flex-1 bg-[#F7F0E6]">
            <Navbar
                title="Nueva Colección Arqueológica"
                showBackArrow
                backToHome={false}
            />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="w-full px-5 mt-6">
                    <Text
                        className="text-center text-[18px] mb-6 text-[#222]"
                        style={{ fontFamily: "CrimsonText-Regular" }}
                    >
                        Ingrese los datos de la nueva colección arqueológica.
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
                        title={createMutation.isPending ? "Creando..." : "CREAR COLECCIÓN ARQUEOLÓGICA"}
                        onPress={handleCrear}
                        disabled={isButtonDisabled}
                        className={`w-full mb-4 rounded-lg py-4 items-center ${isButtonDisabled ? 'bg-gray-400' : 'bg-[#6B705C]'}`}
                        textClassName="text-[16px] font-bold text-white"
                        textStyle={{ fontFamily: "MateSC-Regular" }}
                    />

                    <View className="h-8" />
                </View>
            </ScrollView>
        </View>
    );
}
