import Navbar from "@/app/(tabs)/Navbar";
import Button from "@/components/ui/Button";
import SimplePickerModal, {
    SimplePickerItem,
} from "@/components/ui/SimpleModal";
import MultiArtefactSelector from "@/components/ui/MultiArtefactSelector";
import Colors from "@/constants/Colors";
import { useArtefacts } from "@/hooks/useArtefact";
import { useCreateInternalMovement } from "@/hooks/useInternalMovement";
import { usePhysicalLocations } from "@/hooks/usePhysicalLocation";
import { useRequesters } from "@/hooks/useRequester";
import { getShelfLabel } from "@/utils/shelfLabels";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewMovement() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hooks para datos
  const { data: artefacts = [], isLoading: loadingArtefacts } = useArtefacts();
  const { data: physicalLocations = [], isLoading: loadingLocations } = usePhysicalLocations();
  const { data: requesters = [], isLoading: loadingRequesters } = useRequesters();
  const createMovementMutation = useCreateInternalMovement();

  // Refrescar datos cuando se regrese de otra pantalla
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["artefacts"] });
      queryClient.invalidateQueries({ queryKey: ["physical-locations"] });
    }, [queryClient])
  );

  // Estados para el formulario
  const [selectedArtefactIds, setSelectedArtefactIds] = useState<number[]>([]);
  const [selectedToLocationId, setSelectedToLocationId] = useState<number | null>(null);
  const [selectedRequesterId, setSelectedRequesterId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [observations, setObservations] = useState("");

  // Establecer fecha y hora actual automáticamente
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const [movementDate] = useState(`${year}-${month}-${day}`);
  const [movementTime] = useState(`${hours}:${minutes}`);

  // Función para formatear la fecha correctamente para mostrar
  const formatDisplayDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("es-ES");
  };

  // Estados para modales
  const [artefactSelectorVisible, setArtefactSelectorVisible] = useState(false);
  const [toLocationModalVisible, setToLocationModalVisible] = useState(false);
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

  const physicalLocationItems: SimplePickerItem[] = useMemo(() => {
    return physicalLocations.map((location) => {
      const shelfLabel = location.shelf ? getShelfLabel(location.shelf.code) : "Estantería";
      return {
        value: location.id!,
        label: `${shelfLabel} - Nivel ${location.level}, Columna ${location.column}`,
        raw: location,
      };
    });
  }, [physicalLocations]);

  // Datos convertidos para SimpleModal
  const requesterItems: SimplePickerItem[] = useMemo(() => {
    return requesters.map((requester) => ({
      value: requester.id!,
      label: `${requester.firstname || ""} ${requester.lastname || ""}`.trim() || requester.type,
      raw: requester,
    }));
  }, [requesters]);

  // Obtener nombres para mostrar
  const selectedArtefactsNames = useMemo(() => {
    return selectedArtefactIds
      .map((id) => artefacts.find((a) => a.id === id)?.name)
      .filter((name): name is string => !!name)
      .join(", ");
  }, [selectedArtefactIds, artefacts]);

  const selectedRequesterName = requesters.find((r) => r.id === selectedRequesterId)
    ? `${requesters.find((r) => r.id === selectedRequesterId)?.firstname || ""} ${requesters.find((r) => r.id === selectedRequesterId)?.lastname || ""}`.trim() || requesters.find((r) => r.id === selectedRequesterId)?.type
    : "";

  const selectedToLocationName = useMemo(() => {
    if (!selectedToLocationId) return "";
    const location = physicalLocations.find((l) => l.id === selectedToLocationId);
    if (!location) return "";
    const shelfLabel = location.shelf ? getShelfLabel(location.shelf.code) : "Estantería";
    return `${shelfLabel} - Nivel ${location.level}, Columna ${location.column}`;
  }, [selectedToLocationId, physicalLocations]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (selectedArtefactIds.length === 0) {
      newErrors.artefact = "Debe seleccionar al menos una pieza arqueológica";
    }

    if (!selectedToLocationId) {
      newErrors.toLocation = "Debe seleccionar una ubicación destino";
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

    const movementDateTime = `${movementDate}T${movementTime}:00${timezoneString}`;

    // Crear movimientos para cada pieza seleccionada
    const movementsData = selectedArtefactIds.map((artefactId) => ({
      movementDate: movementDateTime,
      movementTime: movementDateTime,
      artefactId: artefactId,
      fromPhysicalLocationId: null, // Se tomará automáticamente de la ubicación actual de la pieza
      toPhysicalLocationId: selectedToLocationId!,
      reason: reason.trim() || null,
      observations: observations.trim() || null,
      requesterId: selectedRequesterId || null,
    }));

    try {
      // Crear todos los movimientos
      await Promise.all(
        movementsData.map((movementData) =>
          createMovementMutation.mutateAsync(movementData)
        )
      );
      Alert.alert(
        "Éxito",
        `Se han registrado ${selectedArtefactIds.length} movimiento(s) correctamente.`
      );
      router.push("/(tabs)/internal-movements/View_movements");
    } catch (error) {
      console.error("Error completo:", error);
      Alert.alert(
        "Error",
        "Hubo un error al registrar los movimientos. Por favor, intente nuevamente."
      );
    }
  };

  const isButtonDisabled = createMovementMutation.isPending || selectedArtefactIds.length === 0 || !selectedToLocationId;

  if (loadingArtefacts || loadingLocations || loadingRequesters) {
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
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Navbar
        title="Nuevo Movimiento Interno"
        showBackArrow
        redirectTo="/(tabs)/internal-movements/View_movements"
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
                Nuevo Movimiento Interno
              </Text>
              <Text
                style={{
                  fontFamily: "CrimsonText-Regular",
                  fontSize: 16,
                  color: "#A0785D",
                }}
              >
                Registre un movimiento de pieza dentro del depósito
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
              {/* Selección de Piezas Arqueológicas */}
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
                  Piezas Arqueológicas * (puede seleccionar múltiples)
                </Text>

                <TouchableOpacity
                  onPress={() => setArtefactSelectorVisible(true)}
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
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "CrimsonText-Regular",
                        fontSize: 16,
                        color: selectedArtefactsNames ? "#4A3725" : "#B8967D",
                      }}
                      numberOfLines={2}
                    >
                      {selectedArtefactsNames || "Seleccionar pieza(s) arqueológica(s)"}
                    </Text>
                    {selectedArtefactIds.length > 0 && (
                      <Text
                        style={{
                          fontFamily: "CrimsonText-Regular",
                          fontSize: 12,
                          color: Colors.brown,
                          marginTop: 4,
                        }}
                      >
                        {selectedArtefactIds.length} pieza(s) seleccionada(s)
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down-outline" size={20} color="#8B5E3C" />
                </TouchableOpacity>

                {errors.artefact && (
                  <Text style={{ color: "#DC2626", marginTop: 5, fontFamily: "CrimsonText-Regular", fontSize: 14 }}>
                    {errors.artefact}
                  </Text>
                )}
              </View>

              {/* Selección de Requester */}
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
                  Solicitante (Opcional)
                </Text>

                <TouchableOpacity
                  onPress={() => setRequesterModalVisible(true)}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
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
                    {selectedRequesterName || "Seleccionar solicitante (opcional)"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#8B5E3C" />
                </TouchableOpacity>
              </View>

              {/* Selección de Ubicación Destino */}
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
                  Ubicación Destino *
                </Text>

                <TouchableOpacity
                  onPress={() => setToLocationModalVisible(true)}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: errors.toLocation ? "#DC2626" : "#E5D4C1",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "CrimsonText-Regular",
                      fontSize: 16,
                      color: selectedToLocationName ? "#4A3725" : "#B8967D",
                      flex: 1,
                    }}
                  >
                    {selectedToLocationName || "Seleccionar ubicación destino"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#8B5E3C" />
                </TouchableOpacity>

                {errors.toLocation && (
                  <Text style={{ color: "#DC2626", marginTop: 5, fontFamily: "CrimsonText-Regular", fontSize: 14 }}>
                    {errors.toLocation}
                  </Text>
                )}
              </View>

              {/* Motivo */}
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
                  Motivo (Opcional)
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Ingrese el motivo del movimiento"
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* Observaciones */}
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
                  Observaciones (Opcional)
                </Text>
                <TextInput
                  value={observations}
                  onChangeText={setObservations}
                  placeholder="Ingrese observaciones adicionales"
                  placeholderTextColor="#B8967D"
                  selectionColor="#8B5E3C"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: "#E5D4C1",
                    fontFamily: "CrimsonText-Regular",
                    fontSize: 16,
                    color: "#4A3725",
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* Fecha y Hora del Movimiento */}
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
                  Fecha y Hora del Movimiento
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
                      Fecha: {formatDisplayDate(movementDate)}
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
                      Hora: {movementTime}
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
                title={createMovementMutation.isPending ? "Registrando Movimiento..." : "Registrar Movimiento"}
                onPress={createMovementMutation.isPending ? () => {} : handleSubmit}
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

      {/* Modal de selección múltiple de artefactos */}
      <MultiArtefactSelector
        visible={artefactSelectorVisible}
        artefacts={artefacts}
        selectedArtefactIds={selectedArtefactIds}
        onSelect={setSelectedArtefactIds}
        onClose={() => setArtefactSelectorVisible(false)}
      />

      {/* Modal de selección de solicitante */}
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

      {/* Modal de selección de ubicación destino */}
      <SimplePickerModal
        visible={toLocationModalVisible}
        title="Seleccionar Ubicación Destino"
        items={physicalLocationItems}
        selectedValue={selectedToLocationId}
        onSelect={(value) => {
          setSelectedToLocationId(value as number);
          setToLocationModalVisible(false);
        }}
        onClose={() => setToLocationModalVisible(false)}
      />
    </View>
  );
}

