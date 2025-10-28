import { useCreateRequester } from "@/hooks/useRequester";
import { FontAwesome } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function New_requester() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 700;

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [showTypes, setShowTypes] = useState(false);
  const [type, setType] = useState<string | null>(null);

  const types = [
    { label: "Investigador", value: "Investigator" },
    { label: "Departamento", value: "Department" },
    { label: "Exhibición", value: "Exhibition" },
  ];

  const createMutation = useCreateRequester();
  const qc = useQueryClient();

  const handleCrear = async () => {
    if (!nombre.trim() || !apellido.trim() || !type) {
      return Alert.alert("Error", "Debe completar nombre, apellido y tipo.");
    }

    try {
      const payload = {
        firstname: nombre.trim(),
        lastname: apellido.trim(),
        type: type,
      } as any;

      const createdFromServer = await createMutation.mutateAsync(payload);

      const created =
        createdFromServer && typeof createdFromServer === "object"
          ? createdFromServer
          : {
              id: `temp-${Date.now()}`,
              firstname: payload.firstname,
              lastname: payload.lastname,
            };

      try {
        qc.setQueryData(["requesters"], (old: any) => {
          if (!old) return [created];
          const exists = (old || []).some(
            (o: any) => String(o.id) === String(created.id)
          );
          return exists ? old : [created, ...old];
        });
      } catch (e) {
      }

      const qsParts: string[] = [];
      if (created.id)
        qsParts.push(
          `createdRequesterId=${encodeURIComponent(String(created.id))}`
        );
      if (created.firstname)
        qsParts.push(
          `createdFirstname=${encodeURIComponent(created.firstname)}`
        );
      if (created.lastname)
        qsParts.push(`createdLastname=${encodeURIComponent(created.lastname)}`);

      const qs = qsParts.length ? `?${qsParts.join("&")}` : "";
      router.push(`/(tabs)/loan/New_loan${qs}` as unknown as any);
    } catch (e: any) {
      console.error("Create requester error:", e);
      const status = e?.response?.status;
      const data = e?.response?.data;
      const serverMsg = data || e?.message || JSON.stringify(e);
      Alert.alert(
        "Error al crear",
        `Estado: ${status ?? "n/a"}\nRespuesta: ${
          typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
        }`
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F3E9DD]"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      <Navbar title="Nuevo Solicitante" showBackArrow />
      <View
        className="w-[90%] max-w-[700px] items-center self-center"
        style={{ padding: 12 }}
      >
        <Text
          className="text-center text-[18px] mb-4 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Complete los datos del nuevo solicitante
        </Text>

        <View style={{ width: "100%", marginBottom: 12 }}>
          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Nombre
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#A68B5B"
            style={{ fontFamily: "MateSC-Regular" }}
          />

          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Apellido
          </Text>
          <TextInput
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] text-[16px] mb-2 w-full"
            placeholder="Apellido"
            value={apellido}
            onChangeText={setApellido}
            placeholderTextColor="#A68B5B"
            style={{ fontFamily: "MateSC-Regular" }}
          />

          <Text
            className="text-[16px] font-bold mb-2 text-[#3d2c13]"
            style={{ fontFamily: "MateSC-Regular" }}
          >
            Tipo de Solicitante
          </Text>

          <TouchableOpacity
            onPress={() => setShowTypes(!showTypes)}
            className="border-2 border-[#A67C52] rounded-lg p-2 bg-[#F7F5F2] mb-2 w-full"
            style={{ justifyContent: "center" }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: "MateSC-Regular" }}>
                {types.find((t) => t.value === type)?.label ??
                  "Seleccione un tipo"}
              </Text>
              <FontAwesome
                name={showTypes ? "chevron-up" : "chevron-down"}
                size={18}
                color="#8B5E3C"
              />
            </View>
          </TouchableOpacity>

          {showTypes && (
            <View className="bg-[#F7F5F2] rounded-lg border-2 border-[#A67C52] mb-2 w-full p-1">
              {types.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => {
                    setType(t.value);
                    setShowTypes(false);
                  }}
                  style={{ padding: 10 }}
                >
                  <Text style={{ fontFamily: "MateSC-Regular" }}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="w-full">
          <Button
            title={
              createMutation.status === "pending"
                ? "CREANDO..."
                : "CREAR SOLICITANTE"
            }
            className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
            textClassName="text-white text-[16px]"
            onPress={
              createMutation.status === "pending" ? undefined : handleCrear
            }
          />
          <Button
            title="CANCELAR"
            className="bg-[#E2D3B3] rounded-lg py-3 items-center w-full"
            textClassName="text-[#222] text-[16px]"
            onPress={() => router.back()}
          />
        </View>
      </View>
    </ScrollView>
  );
}
