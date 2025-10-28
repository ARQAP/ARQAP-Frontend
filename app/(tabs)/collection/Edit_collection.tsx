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

export default function EditCollection() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar datos de la colección al montar el componente
    useEffect(() => {
        // TODO: Llamada a la API para obtener los datos
        // Ejemplo con datos mock:
        const loadCollectionData = async () => {
            try {
                // const response = await fetchCollectionById(id);
                // Datos de ejemplo:
                setNombre("Colección Ambrosetti en Tiwanaku, Enero de 2005");
                setDescripcion("Descripcion...");
                setIsLoading(false);
            } catch (error) {
                Alert.alert("Error", "No se pudo cargar la colección");
                setIsLoading(false);
            }
        };

        if (id) {
            loadCollectionData();
        }
    }, [id]);

    const handleEditar = () => {
        if (!nombre.trim() || !descripcion.trim()) {
            Alert.alert("Error", "Por favor complete todos los campos.");
            return;
        }

        setIsEditing(true);

        setTimeout(() => {
            Alert.alert(
                "Éxito",
                "Colección arqueológica actualizada correctamente."
            );
            setIsEditing(false);
            router.back();
        }, 1000);
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
                            Nombre
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

                    <View className="mb-6">
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
                                minHeight: 150,
                                textAlignVertical: "top",
                            }}
                            placeholder="Descripción detallada de la colección"
                            value={descripcion}
                            onChangeText={setDescripcion}
                            placeholderTextColor="#A68B5B"
                            selectionColor="#8B5E3C"
                            multiline
                            numberOfLines={6}
                        />
                    </View>

                    <Button
                        title={isEditing ? "Editando..." : "EDITAR COLECCIÓN"}
                        onPress={handleEditar}
                        className="w-full mb-4 rounded-lg py-4 items-center bg-[#6B705C]"
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
