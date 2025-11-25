import Navbar from "@/app/(tabs)/Navbar";
import Button from "@/components/ui/Button";
import SimplePickerModal, {
    SimplePickerItem,
} from "@/components/ui/SimpleModal";
import MultiArtefactSelector from "@/components/ui/MultiArtefactSelector";
import Colors from "@/constants/Colors";
import { useArtefacts } from "@/hooks/useArtefact";
import { useCreateInternalMovement, useCreateBatchInternalMovements } from "@/hooks/useInternalMovement";
import { usePhysicalLocations, useCreatePhysicalLocation, indexToLevel, indexToColumn } from "@/hooks/usePhysicalLocation";
import { useRequesters } from "@/hooks/useRequester";
import { useShelves } from "@/hooks/useShelf";
import { getShelfLabel } from "@/utils/shelfLabels";
import { Ionicons } from "@expo/vector-icons";
import Svg, { ClipPath, Defs, G, Rect, Text as SvgText } from "react-native-svg";
import { useWindowDimensions } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const { data: shelves = [], isLoading: loadingShelves } = useShelves();
  const createMovementMutation = useCreateInternalMovement();
  const createBatchMovementMutation = useCreateBatchInternalMovements();
  const createPhysicalLocation = useCreatePhysicalLocation();

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

  // Estados para selección de ubicación destino
  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

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
  const [shelfModalVisible, setShelfModalVisible] = useState(false);
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

  // Items para selector de estantes
  const shelfItems: SimplePickerItem[] = useMemo(() => {
    return shelves.map((shelf) => ({
      value: shelf.id,
      label: getShelfLabel(shelf.code),
      raw: shelf,
    }));
  }, [shelves]);

  // Obtener estante seleccionado
  const selectedShelf = useMemo(() => {
    return shelves.find((s) => s.id === selectedShelfId) || null;
  }, [shelves, selectedShelfId]);

  // Verificar si el estante seleccionado es una mesa de trabajo (MT)
  const isMesaTrabajo = useMemo(() => {
    if (!selectedShelf) return false;
    const shelfCode = selectedShelf.code;
    return shelfCode >= 28 && shelfCode <= 30; // MT-1, MT-2, MT-3
  }, [selectedShelf]);

  // Calcular niveles y columnas del estante seleccionado
  const { shelfLevels, shelfColumns } = useMemo(() => {
    if (!selectedShelfId) return { shelfLevels: 0, shelfColumns: 0 };
    
    const shelfLocations = physicalLocations.filter(
      (loc) => loc.shelfId === selectedShelfId
    );

    if (shelfLocations.length === 0) {
      return { shelfLevels: 4, shelfColumns: 4 }; // Default
    }

    let maxLevel = 0;
    let maxColumn = 0;

    shelfLocations.forEach((loc) => {
      const level = Number(loc.level);
      const colRaw = String(loc.column || "").toUpperCase();
      let columnNum = 1;
      if (/^[A-Z]$/.test(colRaw)) {
        columnNum = colRaw.charCodeAt(0) - 64; // A -> 1
      }
      if (level > maxLevel) maxLevel = level;
      if (columnNum > maxColumn) maxColumn = columnNum;
    });

    return {
      shelfLevels: maxLevel || 4,
      shelfColumns: maxColumn || 4,
    };
  }, [selectedShelfId, physicalLocations]);

  // Buscar o crear ubicación física cuando se selecciona estante, nivel y columna
  useEffect(() => {
    const findOrCreateLocation = async () => {
      if (!selectedShelfId) {
        setSelectedToLocationId(null);
        return;
      }

      // Si es mesa de trabajo, auto-completar nivel 1, columna A
      if (isMesaTrabajo) {
        const level = 1;
        const column = "A" as const;
        
        // Buscar ubicación existente
        const existingLocation = physicalLocations.find(
          (loc) =>
            loc.shelfId === selectedShelfId &&
            loc.level === level &&
            loc.column === column
        );

        if (existingLocation?.id) {
          setSelectedToLocationId(existingLocation.id);
          setSelectedLevel(0); // índice 0 para nivel 1
          setSelectedColumn("A");
        } else {
          // Crear nueva ubicación
          try {
            const createdLoc = await createPhysicalLocation.mutateAsync({
              level: level,
              column: column,
              shelfId: selectedShelfId,
            });
            setSelectedToLocationId(createdLoc.id!);
            setSelectedLevel(0);
            setSelectedColumn("A");
          } catch (error) {
            console.error("Error creando ubicación física:", error);
          }
        }
        return;
      }

      // Si no es mesa de trabajo, esperar a que se seleccione nivel y columna
      if (selectedLevel !== null && selectedColumn !== null) {
        const levelNumber = indexToLevel(selectedLevel);
        const columnLetter = selectedColumn as "A" | "B" | "C" | "D";

        // Buscar ubicación existente
        const existingLocation = physicalLocations.find(
          (loc) =>
            loc.shelfId === selectedShelfId &&
            loc.level === levelNumber &&
            loc.column === columnLetter
        );

        if (existingLocation?.id) {
          setSelectedToLocationId(existingLocation.id);
        } else {
          // Crear nueva ubicación
          try {
            const createdLoc = await createPhysicalLocation.mutateAsync({
              level: levelNumber,
              column: columnLetter,
              shelfId: selectedShelfId,
            });
            setSelectedToLocationId(createdLoc.id!);
          } catch (error) {
            console.error("Error creando ubicación física:", error);
          }
        }
      }
    };

    findOrCreateLocation();
  }, [selectedShelfId, selectedLevel, selectedColumn, isMesaTrabajo, physicalLocations, createPhysicalLocation]);

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
    if (!selectedShelf) return "";
    const shelfLabel = getShelfLabel(selectedShelf.code);
    
    if (isMesaTrabajo) {
      return `${shelfLabel} - Nivel 1, Columna A`;
    }
    
    if (selectedLevel !== null && selectedColumn !== null) {
      const levelNumber = indexToLevel(selectedLevel);
      return `${shelfLabel} - Nivel ${levelNumber}, Columna ${selectedColumn}`;
    }
    
    return shelfLabel;
  }, [selectedShelf, selectedLevel, selectedColumn, isMesaTrabajo]);

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
      // Si hay múltiples piezas, usar batch; si es una sola, usar el método individual
      if (selectedArtefactIds.length > 1) {
        await createBatchMovementMutation.mutateAsync(movementsData);
      } else {
        await createMovementMutation.mutateAsync(movementsData[0]);
      }
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

  const isButtonDisabled = 
    (createMovementMutation.isPending || createBatchMovementMutation.isPending || createPhysicalLocation.isPending) || 
    selectedArtefactIds.length === 0 || 
    !selectedToLocationId;

  if (loadingArtefacts || loadingLocations || loadingRequesters || loadingShelves) {
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

                <TouchableOpacity
                  style={{
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                  onPress={() => {
                    router.push({
                      pathname: "/(tabs)/loan/New_requester",
                      params: { fromInternalMovement: "true" },
                    });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Crear nuevo Solicitante"
                >
                  <Text
                    style={{
                      color: "#8B5E3C",
                      marginRight: 6,
                      fontFamily: "MateSC-Regular",
                      fontSize: 14,
                    }}
                  >
                    Crear nuevo Solicitante
                  </Text>
                  <Ionicons name="arrow-forward-outline" size={16} color="#8B5E3C" />
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

                {/* Selector de Estante */}
                <View style={{ marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={() => setShelfModalVisible(true)}
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
                        color: selectedShelf ? "#4A3725" : "#B8967D",
                        flex: 1,
                      }}
                    >
                      {selectedShelf ? getShelfLabel(selectedShelf.code) : "Seleccionar estante"}
                    </Text>
                    <Ionicons name="chevron-down-outline" size={20} color="#8B5E3C" />
                  </TouchableOpacity>
                </View>

                {/* Mostrar SVG interactivo si es estante (no MT) */}
                {selectedShelf && !isMesaTrabajo && shelfLevels > 0 && shelfColumns > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontFamily: "CrimsonText-Regular",
                        fontSize: 14,
                        color: "#8B5E3C",
                        marginBottom: 8,
                      }}
                    >
                      Seleccione nivel y columna:
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "#E5D4C1",
                      }}
                    >
                      <ShelfSvgSelector
                        levels={shelfLevels}
                        columns={shelfColumns}
                        selectedLevel={selectedLevel}
                        selectedColumn={selectedColumn}
                        onSlotClick={(levelIndex: number, column: string) => {
                          setSelectedLevel(levelIndex);
                          setSelectedColumn(column.toUpperCase());
                        }}
                      />
                    </View>
                  </View>
                )}

                {/* Mostrar ubicación seleccionada */}
                {selectedToLocationName && (
                  <View
                    style={{
                      backgroundColor: "#F0F8F0",
                      borderRadius: 8,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: Colors.green,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.green} style={{ marginRight: 8 }} />
                      <Text
                        style={{
                          fontFamily: "CrimsonText-Regular",
                          fontSize: 14,
                          color: Colors.green,
                          fontWeight: "600",
                        }}
                      >
                        {selectedToLocationName}
                      </Text>
                    </View>
                  </View>
                )}

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

      {/* Modal de selección de estante */}
      <SimplePickerModal
        visible={shelfModalVisible}
        title="Seleccionar Estante"
        items={shelfItems}
        selectedValue={selectedShelfId}
        onSelect={(value) => {
          setSelectedShelfId(value as number);
          setShelfModalVisible(false);
          // Resetear nivel y columna al cambiar de estante
          setSelectedLevel(null);
          setSelectedColumn(null);
          setSelectedToLocationId(null);
          // Si es mesa de trabajo, se auto-completará en el useEffect
        }}
        onClose={() => setShelfModalVisible(false)}
      />
    </View>
  );
}

// Componente SVG simplificado para selección de nivel y columna
type ShelfSvgSelectorProps = {
  levels: number;
  columns: number;
  selectedLevel: number | null;
  selectedColumn: string | null;
  onSlotClick: (levelIndex: number, column: string) => void;
};

function ShelfSvgSelector({
  levels,
  columns,
  selectedLevel,
  selectedColumn,
  onSlotClick,
}: ShelfSvgSelectorProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth >= 768;

  // Lógica matemática del SVG
  const svgWidth = 360;
  const svgHeight = 230;
  const padding = 20;

  const usableWidth = svgWidth - padding * 2;
  const usableHeight = svgHeight - padding * 2;

  const headerHeight = 24;
  const sideLabelWidth = 26;

  const gridWidth = usableWidth - sideLabelWidth - 8;
  const gridHeight = usableHeight - headerHeight - 8;

  const safeLevels = Math.max(levels, 1);
  const safeColumns = Math.max(columns, 1);

  const levelHeight = gridHeight / safeLevels;
  const slotWidth = gridWidth / safeColumns;

  const gridOriginX = padding + sideLabelWidth + 4;
  const gridOriginY = padding + headerHeight + 4;

  const colLabelFontSize = isLargeScreen ? 11 : 12;
  const rowLabelFontSize = isLargeScreen ? 11 : 12;
  const headerTagFontSize = isLargeScreen ? 9 : 10;

  // Generar slots
  const slots = useMemo(
    () =>
      Array.from({ length: levels }).flatMap((_, levelIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => {
          const uiLevel = levelIndex + 1;
          const uiCol = colIndex + 1;
          const colLetter = String.fromCharCode(64 + uiCol);
          const id = `L${uiLevel}-C${colLetter}`;

          const x = gridOriginX + colIndex * slotWidth;
          const y = gridOriginY + levelIndex * levelHeight;

          return { id, uiLevel, uiCol, colLetter, x, y, levelIndex, colIndex };
        })
      ),
    [levels, columns, slotWidth, levelHeight, gridOriginX, gridOriginY]
  );

  const outerStroke = 1.2;

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <Defs>
        <ClipPath id="gridRoundedClip">
          <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} rx={12} />
        </ClipPath>
      </Defs>

      {/* Fondo general */}
      <Rect
        x={outerStroke / 2}
        y={outerStroke / 2}
        width={svgWidth - outerStroke}
        height={svgHeight - outerStroke}
        fill={Colors.cream}
        rx={24}
        stroke={Colors.cremit}
        strokeWidth={outerStroke}
      />

      {/* Contenedor principal */}
      <Rect
        x={padding - 6}
        y={padding - 4}
        width={usableWidth + 12}
        height={usableHeight + 8}
        fill="#ffffff"
        rx={18}
        stroke={Colors.cremit}
        strokeWidth={1}
      />

      {/* Cabecera de columnas (A, B, C ...) */}
      {Array.from({ length: columns }).map((_, colIndex) => {
        const colNumber = colIndex + 1;
        const colLetter = String.fromCharCode(64 + colNumber);
        const colCenterX = gridOriginX + colIndex * slotWidth + slotWidth / 2;
        return (
          <SvgText
            key={`col-label-${colLetter}`}
            x={colCenterX}
            y={padding + headerHeight - 6}
            textAnchor="middle"
            fontSize={colLabelFontSize}
            fontWeight="600"
            fill={Colors.brown}
          >
            {colLetter}
          </SvgText>
        );
      })}

      <SvgText
        x={padding + sideLabelWidth / 2}
        y={padding + headerHeight - 6}
        textAnchor="middle"
        fontSize={headerTagFontSize}
        fontWeight="600"
        fill={Colors.brown}
      >
        N
      </SvgText>

      {/* Labels de niveles */}
      {Array.from({ length: levels }).map((_, levelIndex) => {
        const levelNumber = levelIndex + 1;
        const rowCenterY = gridOriginY + levelIndex * levelHeight + levelHeight / 2;
        return (
          <SvgText
            key={`row-label-${levelNumber}`}
            x={padding + sideLabelWidth / 2}
            y={rowCenterY + 3}
            textAnchor="middle"
            fontSize={rowLabelFontSize}
            fontWeight="600"
            fill={Colors.brown}
          >
            {levelNumber}
          </SvgText>
        );
      })}

      <G clipPath="url(#gridRoundedClip)">
        <Rect
          x={gridOriginX}
          y={gridOriginY}
          width={gridWidth}
          height={gridHeight}
          fill={Colors.cream}
          opacity={0.65}
        />

        {/* Grilla */}
        {Array.from({ length: levels }).map((_, levelIndex) =>
          Array.from({ length: columns }).map((_, colIndex) => (
            <Rect
              key={`cell-${levelIndex}-${colIndex}`}
              x={gridOriginX + colIndex * slotWidth}
              y={gridOriginY + levelIndex * levelHeight}
              width={slotWidth}
              height={levelHeight}
              fill="transparent"
              stroke={Colors.cremit}
              strokeWidth={0.9}
            />
          ))
        )}

        {/* Slots */}
        {slots.map(({ id, uiLevel, colLetter, x, y, levelIndex, colIndex }) => {
          const isSelected =
            selectedLevel === levelIndex && selectedColumn === colLetter;
          const fill = isSelected ? Colors.darkgreen : "#ffffff";
          const stroke = isSelected ? Colors.green : Colors.cremit;
          const labelColor = isSelected ? "#ffffff" : Colors.brown;

          const gapX = slotWidth * 0.12;
          const gapY = levelHeight * 0.18;
          const slotX = x + gapX;
          const slotY = y + gapY;
          const slotW = slotWidth - gapX * 2;
          const slotH = levelHeight - gapY * 2;

          const slotLabelFontSize = isSelected
            ? isLargeScreen
              ? 13
              : 14
            : isLargeScreen
            ? 11.5
            : 12.5;

          const textX = !isLargeScreen ? slotX + slotW / 2.5 : slotX + slotW / 2;
          const textOffsetY =
            Platform.OS === "ios"
              ? 5
              : !isLargeScreen
              ? 3.5
              : slotLabelFontSize * 0.35;
          const textY = slotY + slotH / 2 + textOffsetY;

          return (
            <G
              key={id}
              onPress={() => onSlotClick(levelIndex, colLetter)}
              style={
                Platform.OS === "web"
                  ? ({ cursor: "pointer" } as any)
                  : undefined
              }
            >
              <Rect
                x={slotX + 1.2}
                y={slotY + 1.6}
                width={slotW}
                height={slotH}
                fill="#000"
                opacity={0.05}
                rx={10}
              />
              <Rect
                x={slotX}
                y={slotY}
                width={slotW}
                height={slotH}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 2 : 1.4}
                rx={10}
              />
              <SvgText
                x={textX}
                y={textY}
                textAnchor="middle"
                fontSize={slotLabelFontSize}
                fontWeight={isSelected ? "700" : "600"}
                fill={labelColor}
              >
                {uiLevel}-{colLetter}
              </SvgText>
            </G>
          );
        })}
      </G>
      <Rect
        x={gridOriginX}
        y={gridOriginY}
        width={gridWidth}
        height={gridHeight}
        rx={12}
        fill="none"
        stroke={Colors.cremit}
        strokeWidth={1.2}
        pointerEvents="none"
      />
    </Svg>
  );
}

