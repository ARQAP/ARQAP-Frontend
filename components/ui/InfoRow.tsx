import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Colors from "../../constants/Colors";

export default function InfoRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value?: string;
}) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
            }}
        >
            <Ionicons name={icon as any} size={20} color={Colors.black} />
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontWeight: "700",
                        color: Colors.black,
                        fontFamily: "MateSC-Regular",
                    }}
                >
                    {label}
                </Text>
                <Text style={{ fontFamily: "CrimsonText-Regular" }}>
                    {value || ""}
                </Text>
            </View>
        </View>
    );
}
