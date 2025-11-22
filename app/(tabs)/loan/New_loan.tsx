import Navbar from "@/app/(tabs)/Navbar";
import Button from "@/components/ui/Button";
import SimplePickerModal, {
    SimplePickerItem,
} from "@/components/ui/SimpleModal";
import Colors from "@/constants/Colors";
import { useArtefacts } from "@/hooks/useArtefact";
import { useCreateLoan } from "@/hooks/useLoan";
import { useRequesters } from "@/hooks/useRequester";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewLoan() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hooks para datos
  const { data: artefacts = [], isLoading: loadingArtefacts } = useArtefacts();
  const { data: requesters = [], isLoading: loadingRequesters } =
    useRequesters();
  const createLoanMutation = useCreateLoan();

  // Refrescar datos cuando se regrese de otra pantalla
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["requesters"] });
    }, [queryClient])
  );

  // Estados para el formulario
  const [selectedArtefactId, setSelectedArtefactId] = useState<number | null>(
    null
  );
  const [selectedRequesterId, setSelectedRequesterId] = useState<number | null>(
    null
  );

  // Establecer fecha y hora actual automáticamente (hora local)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const [loanDate] = useState(`${year}-${month}-${day}`);
  const [loanTime] = useState(`${hours}:${minutes}`);

  // Estados para modales
  const [artefactModalVisible, setArtefactModalVisible] = useState(false);
  const [requesterModalVisible, setRequesterModalVisible] = useState(false);

  // Estados para errores
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Datos convertidos para SimpleModal
  const artefactItems: SimplePickerItem[] = useMemo(() => {
    return artefacts
      .filter((artefact) => artefact.available)
      .map((artefact) => ({
        value: artefact.id!,
        label: `${artefact.name} - ${artefact.material}`,
        raw: artefact,
      }));
  }, [artefacts]);

  const requesterItems: SimplePickerItem[] = useMemo(() => {
    return requesters.map((requester) => ({
      value: requester.id!,
      label: `${requester.firstname} ${requester.lastname} (${requester.type})`,
      raw: requester,
    }));
  }, [requesters]);

  // Obtener nombres para mostrar
  const selectedArtefactName =
    artefacts.find((a) => a.id === selectedArtefactId)?.name || "";
  const selectedRequesterName = requesters.find(
    (r) => r.id === selectedRequesterId
  )
    ? `${requesters.find((r) => r.id === selectedRequesterId)?.firstname} ${requesters.find((r) => r.id === selectedRequesterId)?.lastname}`
    : "";

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedArtefactId) {
      newErrors.artefact = "Debe seleccionar una pieza arqueológica";
    } else {
      const selected = artefacts.find((a) => a.id === selectedArtefactId);
      if (!selected?.available) {
        newErrors.artefact =
          "La pieza seleccionada no está disponible para préstamo";
      }
    }

    if (!selectedRequesterId) {
      newErrors.requester = "Debe seleccionar un solicitante";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const offsetMinutes = Math.abs(timezoneOffset) % 60;
    const offsetSign = timezoneOffset >= 0 ? "+" : "-";
    const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

    const loanDateTime = `${loanDate}T${loanTime}:00${timezoneString}`;

    const loanData = {
      loanDate: loanDateTime,
      loanTime: loanDateTime,
      artefactId: selectedArtefactId!,
      requesterId: selectedRequesterId!,
    };

    console.log("Datos a enviar:", loanData);

    try {
      await createLoanMutation.mutateAsync(loanData);
      router.push("/(tabs)/loan/View_loan");
    } catch (error) {
      console.error("Error completo:", error);
    }
  };

  const isButtonDisabled = createLoanMutation.isPending || !selectedArtefactId || !selectedRequesterId;

  if (loadingArtefacts || loadingRequesters) {
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
        <Text style={{ marginTop: 10, color: "#8B5E3C", fontFamily: "CrimsonText-Regular" }}>
          Cargando datos...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar
        title="Nuevo Préstamo"
        showBackArrow
        redirectTo="/(tabs)/loan/View_loan"
      />
      
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
                Nuevo Préstamo
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Registre un nuevo préstamo de pieza arqueológica
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
              {/* Selección de Pieza Arqueológica */}
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
                  Pieza Arqueológica *
                </Text>

                <TouchableOpacity
                  onPress={() => setArtefactModalVisible(true)}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: errors.artefact ? "#DC2626" : "#E5D4C1",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "CrimsonText-Regular",
                      fontSize: 16,
                      color: selectedArtefactName ? "#4A3725" : "#B8967D",
                      flex: 1,
                    }}
                  >
                    {selectedArtefactName || "Seleccionar pieza arqueológica"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#8B5E3C" />
                </TouchableOpacity>

                {errors.artefact && (
                  <Text style={{ color: "#DC2626", marginTop: 5, fontFamily: "CrimsonText-Regular", fontSize: 14 }}>
                    {errors.artefact}
                  </Text>
                )}
              </View>

              {/* Selección de Solicitante */}
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
                  Solicitante *
                </Text>

                <TouchableOpacity
                  onPress={() => setRequesterModalVisible(true)}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: errors.requester ? "#DC2626" : "#E5D4C1",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "CrimsonText-Regular",
                      fontSize: 16,
                      color: selectedRequesterName ? "#4A3725" : "#B8967D",
                      flex: 1,
                    }}
                  >
                    {selectedRequesterName || "Seleccionar solicitante"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#8B5E3C" />
                </TouchableOpacity>

                {errors.requester && (
                  <Text style={{ color: "#DC2626", marginTop: 5, fontFamily: "CrimsonText-Regular", fontSize: 14 }}>
                    {errors.requester}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/loan/New_requester")}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "CrimsonText-Regular",
                      fontSize: 14,
                      color: "#8B5E3C",
                      marginRight: 4,
                    }}
                  >
                    Crear nuevo Solicitante
                  </Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#8B5E3C" />
                </TouchableOpacity>
              </View>

              {/* Fecha y Hora del Préstamo */}
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
                  Fecha y Hora del Préstamo
                </Text>

                <View
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#8B5E3C" />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontFamily: "CrimsonText-Regular",
                        color: "#4A3725",
                      }}
                    >
                      Fecha: {new Date(loanDate).toLocaleDateString("es-ES")}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <Ionicons name="time-outline" size={18} color="#8B5E3C" />
                    <Text
                      style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontFamily: "CrimsonText-Regular",
                        color: "#4A3725",
                      }}
                    >
                      Hora: {loanTime}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#A0785D",
                      fontStyle: "italic",
                      fontFamily: "CrimsonText-Regular",
                    }}
                  >
                    * La fecha y hora se establecen automáticamente
                  </Text>
                </View>
              </View>
            </View>

            {/* Botones de Acción */}
            <View style={{ gap: 16 }}>
              <Button
                title={createLoanMutation.isPending ? "Creando Préstamo..." : "Crear Préstamo"}
                onPress={createLoanMutation.isPending ? () => {} : handleSubmit}
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

      {/* Modal de selección de artefactos */}
      <SimplePickerModal
        visible={artefactModalVisible}
        title="Seleccionar Pieza Arqueológica"
        items={artefactItems}
        selectedValue={selectedArtefactId}
        onSelect={(value) => {
          setSelectedArtefactId(value as number);
          setArtefactModalVisible(false);
        }}
        onClose={() => setArtefactModalVisible(false)}
      />

      {/* Modal de selección de solicitantes */}
      <SimplePickerModal
        visible={requesterModalVisible}
        title="Seleccionar Solicitante"
        items={requesterItems}
        selectedValue={selectedRequesterId}
        onSelect={(value) => {
          setSelectedRequesterId(value as number);
          setRequesterModalVisible(false);
        }}
        onClose={() => setRequesterModalVisible(false)}
      />
    </View>
  );
}