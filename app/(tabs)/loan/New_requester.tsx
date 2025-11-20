import Navbar from "@/app/(tabs)/Navbar";
import Button from "@/components/ui/Button";
import SimplePickerModal, {
    SimplePickerItem,
} from "@/components/ui/SimpleModal";
import Colors from "@/constants/Colors";
import { useCreateRequester } from "@/hooks/useRequester";
import type {
    Requester,
    RequesterType,
} from "@/repositories/requesterRepository";
import { Ionicons } from "@expo/vector-icons";
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

      router.push("/(tabs)/loan/New_loan");
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

  return (
    <View className="flex-1 bg-[#F7F0E6] items-center px-0">
      <View className="w-full">
        <Navbar
          title="Nuevo Solicitante"
          showBackArrow
          backToHome={false}
          redirectTo="/(tabs)/loan/New_loan"
        />
      </View>

      <View className="w-full max-w-[500px] items-center self-center px-4">
        <Text
          className="text-center text-lg mt-3 mb-2 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Ingrese los datos del nuevo solicitante
        </Text>

        {/* Tipo de solicitante */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Tipo de Solicitante *
          </Text>
          <TouchableOpacity
            onPress={() => setTypeModalVisible(true)}
            className="border-2 border-[#A67C52] rounded-lg p-3 bg-[#F7F5F2] text-base mb-2 w-full flex-row justify-between items-center"
          >
            <Text style={{ color: type ? "#3d2c13" : "#A68B5B" }}>
              {type || "Seleccionar tipo"}
            </Text>
            <Ionicons name="chevron-down-outline" size={12} color="#A68B5B" />
          </TouchableOpacity>
          {errors.type && (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
              {errors.type}
            </Text>
          )}
        </View>

        {/* Campos de representante/persona (siempre requeridos) */}
        {/* Nombre */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            {type === "Investigador" ? "Nombre" : "Nombre del representante"} *
          </Text>
          <TextInput
            value={firstname}
            onChangeText={setFirstname}
            placeholder={
              type === "Investigador"
                ? "Ingrese el nombre"
                : "Ingrese el nombre del representante"
            }
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full placeholder:text-[#A68B5B]"
          />
          {errors.firstname && (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
              {errors.firstname}
            </Text>
          )}
        </View>

        {/* Apellido */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
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
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full placeholder:text-[#A68B5B]"
          />
          {errors.lastname && (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
              {errors.lastname}
            </Text>
          )}
        </View>

        {/* DNI */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            {type === "Investigador" ? "DNI" : "DNI del representante"} *
          </Text>
          <TextInput
            value={dni}
            onChangeText={setDni}
            placeholder="Ingrese el DNI (sin puntos)"
            keyboardType="numeric"
            maxLength={8}
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full placeholder:text-[#A68B5B]"
          />
          {errors.dni && (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
              {errors.dni}
            </Text>
          )}
        </View>

        {/* Email (opcional) */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            {type === "Investigador"
              ? "Email (opcional)"
              : "Email del representante (opcional)"}
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full placeholder:text-[#A68B5B]"
          />
          {errors.email && (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
              {errors.email}
            </Text>
          )}
        </View>

        {/* Teléfono (opcional) */}
        <View className="mb-2 w-full">
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            {type === "Investigador"
              ? "Teléfono (opcional)"
              : "Teléfono del representante (opcional)"}
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+54 11 1234-5678"
            keyboardType="phone-pad"
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-base mb-2 w-full placeholder:text-[#A68B5B]"
          />
          {errors.phoneNumber && (
            <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
              {errors.phoneNumber}
            </Text>
          )}
        </View>

        {/* Botón de envío */}
        <Button
          title={
            createRequesterMutation.isPending
              ? "Creando..."
              : "Crear Solicitante"
          }
          onPress={createRequesterMutation.isPending ? () => {} : handleSubmit}
          className={`w-full self-center mb-4 bg-[#6B705C] rounded-lg py-3 items-center ${createRequesterMutation.isPending ? "opacity-60" : ""}`}
          textClassName="text-base font-bold text-white"
          textStyle={{ fontFamily: "MateSC-Regular" }}
        />

        {createRequesterMutation.isPending && (
          <ActivityIndicator
            size="large"
            color={Colors.brown}
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      {/* Modal de selección de tipo */}
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
