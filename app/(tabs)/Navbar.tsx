import React from "react";
import { StyleSheet, Text, View } from "react-native";

function Navbar() {
  return (
    <View style={styles.navbar}>
      <Text style={styles.title}>Inicio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: "100%",
    backgroundColor: "#D9C6A5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "left",
    fontFamily: "MateSC-Regular",
    color: "#000",
  },
});

export default Navbar;
