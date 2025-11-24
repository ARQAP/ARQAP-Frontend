import Navbar from "@/app/(tabs)/Navbar";
import Button from "@/components/ui/Button";
import SimplePickerModal, {
    SimplePickerItem,
} from "@/components/ui/SimpleModal";
import { useCreateRequester } from "@/hooks/useRequester";
import type {
    Requester,
    RequesterType,
} from "@/repositories/requesterRepository";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewRequester() {
    const router = useRouter();
    const createRequesterMutation = useCreateRequester();

    // Estados para el formulario
    const [type, setType] = useState<RequesterType>("Investigador");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [dni, setDni] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Estados para modales
    const [typeModalVisible, setTypeModalVisible] = useState(false);

    // Estados para errores
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Opciones de tipo de solicitante
    const typeOptions: SimplePickerItem[] = [
        { value: "Investigador", label: "Investigador" },
        { value: "Departamento", label: "Departamento" },
        { value: "Exhibición", label: "Exhibición" },
    ];

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!type) {
            newErrors.type = "Debe seleccionar el tipo de solicitante";
        }

        // Validar campos personales/del representante (siempre requeridos)
        if (!firstname?.trim()) {
            newErrors.firstname =
                type === "Investigador"
                    ? "Debe ingresar el nombre"
                    : "Debe ingresar el nombre del representante";
        }
        if (!lastname?.trim()) {
            newErrors.lastname =
                type === "Investigador"
                    ? "Debe ingresar el apellido"
                    : "Debe ingresar el apellido del representante";
        }
        if (!dni?.trim()) {
            newErrors.dni =
                type === "Investigador"
                    ? "Debe ingresar el DNI"
                    : "Debe ingresar el DNI del representante";
        } else if (!/^\d{7,8}$/.test(dni.trim())) {
            newErrors.dni = "El DNI debe tener 7 u 8 dígitos";
        }

        // Email opcional pero si se ingresa debe ser válido
        if (email?.trim() && !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Ingrese un email válido";
        }

        // Teléfono opcional pero si se ingresa debe ser válido
        if (phoneNumber?.trim() && !/^\+?[\d\s\-\(\)]{7,}$/.test(phoneNumber)) {
            newErrors.phoneNumber = "Ingrese un número de teléfono válido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const requesterData: Requester = {
            type,
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            dni: dni.trim(),
            email: email.trim() || null,
            phoneNumber: phoneNumber.trim() || null,
        };

        try {
            await createRequesterMutation.mutateAsync(requesterData);
            router.replace("/(tabs)/loan/New_loan");
        } catch (error) {
            const errorMessage =
                (error as Error).message || "Error al crear el solicitante";

            if (Platform.OS === "web") {
                window.alert(`Error: ${errorMessage}`);
            } else {
                Alert.alert("Error", errorMessage);
            }
        }
    };

    const isButtonDisabled = createRequesterMutation.isPending;

    return (
        <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
            <Navbar title="Nuevo Solicitante" showBackArrow />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
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
                            maxWidth: 800,
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
                                Nuevo Solicitante
                            </Text>
                            <Text
                                style={{
                                    fontFamily: "CrimsonText-Regular",
                                    fontSize: 16,
                                    color: "#A0785D",
                                }}
                            >
                                Ingrese los datos del nuevo solicitante
                            </Text>
                        </View>

                        {/* Formulario */}
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
                            {/* Tipo de solicitante */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    Tipo de Solicitante *
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setTypeModalVisible(true)}
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: errors.type
                                            ? "#DC2626"
                                            : "#E5D4C1",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 16,
                                            color: type ? "#4A3725" : "#B8967D",
                                            flex: 1,
                                        }}
                                    >
                                        {type || "Seleccionar tipo"}
                                    </Text>
                                    <Ionicons
                                        name="chevron-down-outline"
                                        size={20}
                                        color="#8B5E3C"
                                    />
                                </TouchableOpacity>

                                {errors.type && (
                                    <Text
                                        style={{
                                            color: "#DC2626",
                                            marginTop: 5,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        {errors.type}
                                    </Text>
                                )}
                            </View>

                            {/* Nombre */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    {type === "Investigador"
                                        ? "Nombre"
                                        : "Nombre del representante"}{" "}
                                    *
                                </Text>

                                <TextInput
                                    value={firstname}
                                    onChangeText={setFirstname}
                                    placeholder={
                                        type === "Investigador"
                                            ? "Ingrese el nombre"
                                            : "Ingrese el nombre del representante"
                                    }
                                    placeholderTextColor="#B8967D"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: errors.firstname
                                            ? "#DC2626"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />

                                {errors.firstname && (
                                    <Text
                                        style={{
                                            color: "#DC2626",
                                            marginTop: 5,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        {errors.firstname}
                                    </Text>
                                )}
                            </View>

                            {/* Apellido */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    {type === "Investigador"
                                        ? "Apellido"
                                        : "Apellido del representante"}{" "}
                                    *
                                </Text>

                                <TextInput
                                    value={lastname}
                                    onChangeText={setLastname}
                                    placeholder={
                                        type === "Investigador"
                                            ? "Ingrese el apellido"
                                            : "Ingrese el apellido del representante"
                                    }
                                    placeholderTextColor="#B8967D"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: errors.lastname
                                            ? "#DC2626"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />

                                {errors.lastname && (
                                    <Text
                                        style={{
                                            color: "#DC2626",
                                            marginTop: 5,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        {errors.lastname}
                                    </Text>
                                )}
                            </View>

                            {/* DNI */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    {type === "Investigador"
                                        ? "DNI"
                                        : "DNI del representante"}{" "}
                                    *
                                </Text>

                                <TextInput
                                    value={dni}
                                    onChangeText={setDni}
                                    placeholder="Ingrese el DNI (sin puntos)"
                                    placeholderTextColor="#B8967D"
                                    keyboardType="numeric"
                                    maxLength={8}
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: errors.dni
                                            ? "#DC2626"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />

                                {errors.dni && (
                                    <Text
                                        style={{
                                            color: "#DC2626",
                                            marginTop: 5,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        {errors.dni}
                                    </Text>
                                )}
                            </View>

                            {/* Email (opcional) */}
                            <View style={{ marginBottom: 24 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    {type === "Investigador"
                                        ? "Email (opcional)"
                                        : "Email del representante (opcional)"}
                                </Text>

                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ejemplo@email.com"
                                    placeholderTextColor="#B8967D"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: errors.email
                                            ? "#DC2626"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />

                                {errors.email && (
                                    <Text
                                        style={{
                                            color: "#DC2626",
                                            marginTop: 5,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        {errors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Teléfono (opcional) */}
                            <View style={{ marginBottom: 8 }}>
                                <Text
                                    style={{
                                        fontFamily: "MateSC-Regular",
                                        fontSize: 15,
                                        color: "#8B5E3C",
                                        marginBottom: 8,
                                        fontWeight: "600",
                                    }}
                                >
                                    {type === "Investigador"
                                        ? "Teléfono (opcional)"
                                        : "Teléfono del representante (opcional)"}
                                </Text>

                                <TextInput
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="+54 11 1234-5678"
                                    placeholderTextColor="#B8967D"
                                    keyboardType="phone-pad"
                                    style={{
                                        backgroundColor: "#F7F5F2",
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderWidth: 1,
                                        borderColor: errors.phoneNumber
                                            ? "#DC2626"
                                            : "#E5D4C1",
                                        fontFamily: "CrimsonText-Regular",
                                        fontSize: 16,
                                        color: "#4A3725",
                                    }}
                                />

                                {errors.phoneNumber && (
                                    <Text
                                        style={{
                                            color: "#DC2626",
                                            marginTop: 5,
                                            fontFamily: "CrimsonText-Regular",
                                            fontSize: 14,
                                        }}
                                    >
                                        {errors.phoneNumber}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Botones de Acción */}
                        <View style={{ gap: 16 }}>
                            <Button
                                title={
                                    createRequesterMutation.isPending
                                        ? "Creando..."
                                        : "Crear Solicitante"
                                }
                                onPress={
                                    createRequesterMutation.isPending
                                        ? () => {}
                                        : handleSubmit
                                }
                                style={{
                                    opacity: isButtonDisabled ? 0.6 : 1,
                                }}
                                textStyle={{
                                    fontFamily: "MateSC-Regular",
                                    fontWeight: "bold",
                                    fontSize: 15,
                                }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <SimplePickerModal
                visible={typeModalVisible}
                title="Seleccionar Tipo"
                items={typeOptions}
                selectedValue={type}
                onSelect={(value) => {
                    setType(value as RequesterType);
                    setTypeModalVisible(false);
                }}
                onClose={() => setTypeModalVisible(false)}
            />
        </View>
    );
}
