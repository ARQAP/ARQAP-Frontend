import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CubeBadge from "../../components/ui/CubeBadge";
import Colors from "../../constants/Colors";

interface CardProps {
    title: string;
    subtitle: string;
    icon?: keyof typeof FontAwesome.glyphMap;
    cubeCount?: number;
}

export default function Card({ title, subtitle, icon, cubeCount }: CardProps) {
    const router = useRouter();
    const handlePress = () => {
        if (title === "Arqueólogos") {
            router.push({
                pathname: "/(tabs)/archaeologist/View_archaeologist",
            });
        } else if (title === "Sitios Arqueológicos") {
            router.push({ pathname: "/(tabs)/location/Location" });
        } else if (title === "Préstamos") {
            router.push({ pathname: "/(tabs)/loan/View_loan" });
        } else if (title === "Colecciones Arqueológicas") {
            router.push({ pathname: "/(tabs)/collection/View_collection" });
        } else if (/pieza/i.test(title)) {
            router.push({ pathname: "/(tabs)/archaeological-Pieces" });
        } else if (/colección/i.test(title)) {
            router.push({ pathname: "/(tabs)/collection/View_collection" });
        }
    };
    return (
        <TouchableOpacity
            className="w-[90%] self-center rounded-xl p-4 my-2 flex-row items-center justify-between"
            style={[styles.card, { backgroundColor: Colors.green }]}
            activeOpacity={0.8}
            onPress={handlePress}
        >
            <View className="flex-1">
                <Text
                    className="font-bold text-xl mb-1 text-white"
                    style={{ fontFamily: "MateSC-Regular" }}
                >
                    {title}
                </Text>
                <Text
                    className="text-base text-white opacity-80"
                    style={{ fontFamily: "CrimsonText-Regular" }}
                >
                    {subtitle}
                </Text>
            </View>
            <View style={styles.iconContainer}>
                {cubeCount !== undefined ? (
                    <CubeBadge count={cubeCount} icon={icon} />
                ) : icon ? (
                    <View style={styles.iconCircle}>
                        <FontAwesome name={icon} size={22} color="#fff" />
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.16)",
    },
    iconContainer: {
        width: 60,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 16,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
});
