import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Modal,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [loanDate, setLoanDate] = useState("");
  const [loanTime, setLoanTime] = useState("");

  // Estados para modales
  const [artefactModalVisible, setArtefactModalVisible] = useState(false);
  const [requesterModalVisible, setRequesterModalVisible] = useState(false);

  // Estados para errores
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Componente para selector de fecha híbrido (web/móvil)
  const DateSelector = ({
    value,
    placeholder,
    onDateChange,
    hasError,
  }: {
    value: string;
    placeholder: string;
    onDateChange: (date: string) => void;
    hasError?: boolean;
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    if (Platform.OS === "web") {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              setTempValue(value);
              setShowPicker(true);
            }}
            style={{
              backgroundColor: "#F7F5F2",
              borderRadius: 8,
              padding: 12,
              borderWidth: hasError ? 2 : 1,
              borderColor: hasError ? "#DC2626" : "#e0e0e0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: value ? Colors.brown : "#999" }}>
              {value || placeholder}
            </Text>
            <FontAwesome name="calendar" size={16} color="#999" />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPicker(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
              onPress={() => setShowPicker(false)}
              activeOpacity={1}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 20,
                  minWidth: 300,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={(e) => e.stopPropagation()}
                activeOpacity={1}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 15,
                    textAlign: "center",
                    color: Colors.brown,
                  }}
                >
                  Seleccionar Fecha
                </Text>

                <input
                  type="date"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#e0e0e0",
                    color: Colors.brown,
                    fontSize: 16,
                    width: "100%",
                    outline: "none",
                    marginBottom: 15,
                  }}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={{
                      flex: 1,
                      backgroundColor: "#DC2626",
                      padding: 12,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      onDateChange(tempValue);
                      setShowPicker(false);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: Colors.brown,
                      padding: 12,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      );
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            backgroundColor: "#F7F5F2",
            borderRadius: 8,
            padding: 12,
            borderWidth: hasError ? 2 : 1,
            borderColor: hasError ? "#DC2626" : "#e0e0e0",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: value ? Colors.brown : "#999" }}>
            {value || placeholder}
          </Text>
          <FontAwesome name="calendar" size={16} color="#999" />
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                onDateChange(selectedDate.toISOString().split("T")[0]);
              }
            }}
          />
        )}
      </View>
    );
  };

  // Componente para selector de hora híbrido (web/móvil)
  type TimeSelectorProps = {
    value: string;
    placeholder: string;
    onTimeChange: (time: string) => void;
    hasError?: boolean;
  };

  const styles = StyleSheet.create({
    trigger: {
      backgroundColor: "#F7F5F2",
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalCard: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 20,
      minWidth: 320,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
      color: Colors.brown,
    },
    actionsRow: {
      flexDirection: "row",
      // en vez de `gap`, que no siempre anda en RN
      justifyContent: "space-between",
    },
    actionButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
  });

  const TimeSelector: React.FC<TimeSelectorProps> = ({
    value,
    placeholder,
    onTimeChange,
    hasError,
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleOpen = () => {
      setTempValue(value);
      setShowPicker(true);
    };

    const handleCancel = () => {
      setShowPicker(false);
    };

    const handleConfirm = () => {
      if (!tempValue) return;
      onTimeChange(tempValue);
      setShowPicker(false);
    };

    if (Platform.OS === "web") {
      return (
        <View>
          <TouchableOpacity
            onPress={handleOpen}
            style={[
              styles.trigger,
              {
                borderColor: hasError ? "#DC2626" : "#e0e0e0",
                borderWidth: hasError ? 2 : 1,
              },
            ]}
          >
            <Text style={{ color: value ? Colors.brown : "#999" }}>
              {value || placeholder}
            </Text>
            <FontAwesome name="clock-o" size={16} color="#999" />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={handleCancel}
              activeOpacity={1}
            >
              <TouchableOpacity
                style={styles.modalCard}
                onPress={(e: any) => e.stopPropagation?.()}
                activeOpacity={1}
              >
                <Text style={styles.modalTitle}>Seleccionar Hora</Text>

                <input
                  type="time"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  style={{
                    backgroundColor: "#F7F5F2",
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#e0e0e0",
                    color: Colors.brown,
                    fontSize: 16,
                    width: "100%",
                    outline: "none",
                    marginBottom: 15,
                  }}
                />

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={[
                      styles.actionButton,
                      { backgroundColor: "#DC2626", marginRight: 8 },
                    ]}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={!tempValue}
                    onPress={handleConfirm}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: tempValue ? Colors.brown : "#c4c4c4",
                      },
                    ]}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Confirmar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      );
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={{
            backgroundColor: "#F7F5F2",
            borderRadius: 8,
            padding: 12,
            borderWidth: hasError ? 2 : 1,
            borderColor: hasError ? "#DC2626" : "#e0e0e0",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: value ? Colors.brown : "#999" }}>
            {value || placeholder}
          </Text>
          <FontAwesome name="clock-o" size={16} color="#999" />
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={value ? new Date(`2000-01-01T${value}`) : new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedTime) => {
              setShowPicker(false);
              if (selectedTime) {
                const hours = selectedTime
                  .getHours()
                  .toString()
                  .padStart(2, "0");
                const minutes = selectedTime
                  .getMinutes()
                  .toString()
                  .padStart(2, "0");
                onTimeChange(`${hours}:${minutes}`);
              }
            }}
          />
        )}
      </View>
    );
  };

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
    if (!loanDate) {
      newErrors.loanDate = "Debe ingresar la fecha de préstamo";
    }
    if (!loanTime) {
      newErrors.loanTime = "Debe ingresar la hora de préstamo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Combinar fecha y hora en formato ISO para loanDate
    const loanDateTime = `${loanDate}T${loanTime}:00.000Z`;

    const loanData = {
      loanDate: loanDateTime,
      loanTime: loanDateTime,
      artefactId: selectedArtefactId!,
      requesterId: selectedRequesterId!,
    };

    console.log("Datos a enviar:", loanData);
    console.log("selectedArtefactId:", selectedArtefactId);
    console.log("selectedRequesterId:", selectedRequesterId);
    console.log("loanDate original:", loanDate);
    console.log("loanTime original:", loanTime);
    console.log("loanDateTime combinado:", loanDateTime);

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
            Fechas y Horarios
          </Text>

          {/* Fecha y hora de préstamo */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 15,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 5, fontWeight: "600" }}>
                Fecha de Préstamo
              </Text>
              <DateSelector
                value={loanDate}
                placeholder="Seleccionar fecha"
                onDateChange={setLoanDate}
                hasError={!!errors.loanDate}
              />
              {errors.loanDate && (
                <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
                  {errors.loanDate}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 5, fontWeight: "600" }}>
                Hora de Préstamo
              </Text>
              <TimeSelector
                value={loanTime}
                placeholder="Seleccionar hora"
                onTimeChange={setLoanTime}
                hasError={!!errors.loanTime}
              />
              {errors.loanTime && (
                <Text style={{ color: "#DC2626", fontSize: 12, marginTop: 2 }}>
                  {errors.loanTime}
                </Text>
              )}
            </View>
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
