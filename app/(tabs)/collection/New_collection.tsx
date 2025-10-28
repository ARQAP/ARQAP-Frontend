import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function NewCollection() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCrear = () => {
        if (!nombre.trim() || !descripcion.trim()) {
            Alert.alert("Error", "Por favor complete todos los campos.");
            return;
        }

        setIsCreating(true);

        setTimeout(() => {
            Alert.alert(
                "Éxito",
                "Colección arqueológica registrada correctamente."
            );
            setIsCreating(false);
            router.back();
        }, 1000);

    };

    return (
        <View className="flex-1 bg-[#F7F0E6]">
            <Navbar
                title="Nueva Colección Arqueológica (Vacía)"
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
                        title={isCreating ? "Creando..." : "CREAR COLECCIÓN ARQUEOLÓGICA"}
                        onPress={handleCrear}
                        className="w-full mb-4 rounded-lg py-4 items-center bg-[#6B705C]"
                        textClassName="text-[16px] font-bold text-white"
                        textStyle={{ fontFamily: "MateSC-Regular" }}
                    />

                    <View className="h-8" />
                </View>
            </ScrollView>
        </View>
    );
}
