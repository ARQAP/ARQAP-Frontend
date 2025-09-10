import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CubeBadge from "../../components/ui/CubeBadge";

interface CardProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  cubeCount?: number;
}

export default function Card({ title, subtitle, icon, cubeCount }: CardProps) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.iconContainer}>
        {cubeCount !== undefined ? (
          <CubeBadge count={cubeCount} icon={icon} />
        ) : icon ? (
          <FontAwesome name={icon} size={32} color="#fff" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B705C",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 4,
    color: "#fff",
    fontFamily: "MateSC-Regular",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    fontFamily: "CrimsonText-Regular",
  },
  iconContainer: {
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
