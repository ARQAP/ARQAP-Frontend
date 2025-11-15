import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Navbar from "@/app/(tabs)/Navbar";
import SimplePickerModal, {
  SimplePickerItem,
} from "@/components/ui/SimpleModal";
import { useArtefacts } from "@/hooks/useArtefact";
import { useRequesters } from "@/hooks/useRequester";
import { useCreateLoan } from "@/hooks/useLoan";
import { useQueryClient } from "@tanstack/react-query";
import type { Loan } from "@/repositories/loanRepository";
import Colors from "@/constants/Colors";

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
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const [loanDate] = useState(`${year}-${month}-${day}`); // Fecha local en formato YYYY-MM-DD
  const [loanTime] = useState(`${hours}:${minutes}`); // Hora local en formato HH:MM

  // Estados para modales
  const [artefactModalVisible, setArtefactModalVisible] = useState(false);
  const [requesterModalVisible, setRequesterModalVisible] = useState(false);

  // Estados para errores
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Datos convertidos para SimpleModal
  const artefactItems: SimplePickerItem[] = useMemo(() => {
    return artefacts.map((artefact) => ({
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

    // Crear datetime con zona horaria local
    const now = new Date();
    const timezoneOffset = -now.getTimezoneOffset(); // Offset en minutos
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const offsetMinutes = Math.abs(timezoneOffset) % 60;
    const offsetSign = timezoneOffset >= 0 ? '+' : '-';
    const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
    
    const loanDateTime = `${loanDate}T${loanTime}:00${timezoneString}`;

    const loanData = {
      loanDate: loanDateTime,  // Datetime completo con zona horaria
      loanTime: loanDateTime,  // Datetime completo con zona horaria
      artefactId: selectedArtefactId!,
      requesterId: selectedRequesterId!,
    };

    console.log("Datos a enviar:", loanData);
    console.log("selectedArtefactId:", selectedArtefactId);
    console.log("selectedRequesterId:", selectedRequesterId);
    console.log("loanDate original:", loanDate);
    console.log("loanTime original:", loanTime);

    try {
      await createLoanMutation.mutateAsync(loanData);

      router.push("/(tabs)/loan/View_loan");
    } catch (error) {
      console.error("Error completo:", error);
      const errorMessage =
        (error as Error).message || "Error al crear el préstamo";
    }
  };

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
        <ActivityIndicator size="large" color={Colors.brown} />
        <Text style={{ marginTop: 10, color: Colors.brown }}>
          Cargando datos...
        </Text>
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Nuevo Préstamo" showBackArrow redirectTo="/(tabs)/loan" />

      <View style={{ padding: 20 }}>
        {/* Selección de Pieza Arqueológica */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.brown,
              marginBottom: 10,
            }}
          >
            Seleccionar Pieza Arqueológica
          </Text>

          <TouchableOpacity
            onPress={() => setArtefactModalVisible(true)}
            style={{
              backgroundColor: "#F7F5F2",
              borderRadius: 8,
              padding: 15,
              borderWidth: errors.artefact ? 2 : 1,
              borderColor: errors.artefact ? "#DC2626" : "#e0e0e0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: selectedArtefactName ? Colors.brown : "#999",
                flex: 1,
              }}
            >
              {selectedArtefactName || "Seleccionar pieza arqueológica..."}
            </Text>
            <FontAwesome name="chevron-down" size={14} color="#999" />
          </TouchableOpacity>

          {errors.artefact && (
            <Text style={{ color: "#DC2626", marginTop: 5 }}>
              {errors.artefact}
            </Text>
          )}
        </View>

        {/* Selección de Solicitante */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.brown,
              marginBottom: 10,
            }}
          >
            Seleccionar Solicitante
          </Text>

          <TouchableOpacity
            onPress={() => setRequesterModalVisible(true)}
            style={{
              backgroundColor: "#F7F5F2",
              borderRadius: 8,
              padding: 15,
              borderWidth: errors.requester ? 2 : 1,
              borderColor: errors.requester ? "#DC2626" : "#e0e0e0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: selectedRequesterName ? Colors.brown : "#999",
                flex: 1,
              }}
            >
              {selectedRequesterName || "Seleccionar solicitante..."}
            </Text>
            <FontAwesome name="chevron-down" size={14} color="#999" />
          </TouchableOpacity>

          {errors.requester && (
            <Text style={{ color: "#DC2626", marginTop: 5 }}>
              {errors.requester}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/loan/New_requester")}
            style={{
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
            accessibilityRole="button"
            accessibilityLabel="Crear nuevo Solicitante"
          >
            <Text
              style={{
                color: "#A68B5B",
                marginRight: 6,
                fontFamily: "MateSC-Regular",
              }}
            >
              Crear nuevo Solicitante
            </Text>
            <Feather name="arrow-up-right" size={16} color="#A68B5B" />
          </TouchableOpacity>
        </View>

        {/* Fechas y Horarios */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.brown,
              marginBottom: 15,
            }}
          >
            Fecha y Hora del Préstamo
          </Text>

          {/* Mostrar fecha y hora actual (solo lectura) */}
          <View
            style={{
              backgroundColor: "#F7F5F2",
              borderRadius: 12,
              padding: 15,
              borderWidth: 1,
              borderColor: "#e0e0e0",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <FontAwesome name="calendar" size={16} color={Colors.brown} />
              <Text style={{ 
                marginLeft: 10, 
                fontSize: 16,
                fontWeight: "600",
                color: Colors.brown 
              }}>
                Fecha: {new Date(loanDate).toLocaleDateString('es-ES')}
              </Text>
            </View>
            
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome name="clock-o" size={16} color={Colors.brown} />
              <Text style={{ 
                marginLeft: 10, 
                fontSize: 16,
                fontWeight: "600",
                color: Colors.brown 
              }}>
                Hora: {loanTime}
              </Text>
            </View>
            
            <Text style={{ 
              marginTop: 8,
              fontSize: 12,
              color: "#666",
              fontStyle: "italic"
            }}>
              * La fecha y hora se establecen automáticamente al momento actual
            </Text>
          </View>
        </View>

        {/* Botón de envío */}
        <Button
          title={createLoanMutation.isPending ? "Creando..." : "Crear Préstamo"}
          onPress={createLoanMutation.isPending ? () => {} : handleSubmit}
          style={{
            marginTop: 20,
            backgroundColor: createLoanMutation.isPending
              ? "#ccc"
              : Colors.brown,
          }}
        />
      </View>

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
    </ScrollView>
  );
}
