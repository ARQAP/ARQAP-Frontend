import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  title: string;
  onPress?: () => void;
}

export default function ActionButton({ title, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          position: "absolute",
          top: 16,
          left: 0,
        }}
      >
        <View style={styles.circle}>
          <Text style={styles.plus}>+</Text>
        </View>
      </View>
      <View
        style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}
      >
        <Text style={styles.label}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#deceb1",
    borderRadius: 16,
    padding: 16,
    width: "20%",
    minWidth: 140,
    maxWidth: 240,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  circle: {
    backgroundColor: "#8b5c2a",
    borderRadius: 40,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  plus: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 44,
    includeFontPadding: false,
    marginTop: -6,
  },
  label: {
    fontFamily: "MateSC-Regular",
    fontSize: 16,
    color: "#3d2c13",
    textAlign: "center",
    marginTop: 4,
  },
});
