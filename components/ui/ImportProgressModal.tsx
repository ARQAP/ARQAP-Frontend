import React from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

interface ImportProgressModalProps {
  visible: boolean;
  progress?: number; // 0-100
  currentRow?: number;
  totalRows?: number;
  message?: string;
}

export default function ImportProgressModal({
  visible,
  progress = 0,
  currentRow,
  totalRows,
  message,
}: ImportProgressModalProps) {
  const percentage = Math.round(progress);
  const displayMessage =
    message ||
    (currentRow !== undefined && totalRows !== undefined
      ? `Procesando fila ${currentRow} de ${totalRows}`
      : "Procesando archivo...");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.green} />
          <Text style={styles.title}>Importando archivo Excel</Text>
          <Text style={styles.message}>{displayMessage}</Text>

          {/* Barra de progreso */}
          {(progress > 0 || (currentRow !== undefined && totalRows !== undefined)) && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{percentage}%</Text>
            </View>
          )}

          {currentRow !== undefined && totalRows !== undefined && (
            <Text style={styles.rowInfo}>
              {currentRow} / {totalRows} filas
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.cream,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    minWidth: 300,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "MateSC-Regular",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontFamily: "CrimsonText-Regular",
    color: Colors.black,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#E5D4C1",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.green,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "CrimsonText-Regular",
    color: Colors.black,
    opacity: 0.6,
    textAlign: "center",
  },
  rowInfo: {
    fontSize: 14,
    fontFamily: "CrimsonText-Regular",
    color: Colors.black,
    opacity: 0.5,
    marginTop: 8,
  },
});
