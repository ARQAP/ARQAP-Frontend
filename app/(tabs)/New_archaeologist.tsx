import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "./Navbar";

export default function New_archaeologist() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const handleCrear = () => {
    // Aquí iría la lógica para crear el arqueólogo
    // Por ahora solo navega hacia atrás
    router.back();
  };

  const handleCancelar = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <Navbar title="Nuevo Arqueólogo" />
      </View>
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text style={styles.subtitle}>
          Ingresa los datos del nuevo arqueologo
        </Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOMBRE</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#A68B5B"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>APELLIDO</Text>
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            value={apellido}
            onChangeText={setApellido}
            placeholderTextColor="#A68B5B"
          />
        </View>
        <TouchableOpacity style={styles.crearBtn} onPress={handleCrear}>
          <Text style={styles.crearBtnText}>CREAR ARQUEÓLOGO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelarBtn} onPress={handleCancelar}>
          <Text style={styles.cancelarBtnText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F0E6",
    paddingHorizontal: 24,
    paddingTop: 0,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 8,
    color: "#222",
    fontFamily: "CrimsonText-Regular",
  },
  inputGroup: {
    marginHorizontal: 8,
    marginBottom: 10,
    width: "98%",
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#3d2c13",
    fontFamily: "MateSC-Regular",
  },
  input: {
    borderWidth: 2,
    borderColor: "#A67C52",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F7F5F2",
    fontSize: 16,
    fontFamily: "CrimsonText-Regular",
    marginBottom: 8,
    width: "100%",
  },
  crearBtn: {
    backgroundColor: "#6B705C",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    width: "98%",
    alignSelf: "center",
  },
  crearBtnText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "MateSC-Regular",
    fontWeight: "bold",
  },
  cancelarBtn: {
    backgroundColor: "#E2D1B2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "98%",
    alignSelf: "center",
  },
  cancelarBtnText: {
    color: "#222",
    fontSize: 18,
    fontFamily: "MateSC-Regular",
    fontWeight: "bold",
  },
});
