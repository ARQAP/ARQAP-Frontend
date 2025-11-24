import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import Colors from "../../../constants/Colors";
import Navbar from "../Navbar";

type ActionCardProps = {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
};

const ActionCard = ({
    title,
    description,
    icon,
    color,
    onPress,
}: ActionCardProps) => {
    const { width } = useWindowDimensions();
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const isDesktop = width >= 1024;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            className="bg-[#fbf9f5] rounded-2xl border"
            style={[
                styles.cardShadow,
                {
                    borderColor:
                        isHovered && isDesktop ? color : "rgba(0,0,0,0.06)",
                    borderWidth: isHovered && isDesktop ? 2 : 1,
                    paddingHorizontal: isDesktop ? 32 : 16,
                    paddingVertical: isDesktop ? 24 : 20,
                    minHeight: isDesktop ? 150 : 120,
                    justifyContent: "center",
                    shadowRadius: isHovered && isDesktop ? 12 : 10,
                    shadowOpacity: isHovered && isDesktop ? 0.15 : 0.08,
                },
                {
                    transform: [
                        {
                            scale: isPressed
                                ? 0.98
                                : isHovered && isDesktop
                                  ? 1.02
                                  : 1,
                        },
                    ],
                },
                isHovered && isDesktop && { translateY: -2 },
                Platform.select({
                    web: isDesktop ? { cursor: "pointer" } : {},
                }),
            ]}
        >
            <View
                className="flex-row"
                style={{
                    alignItems: "center",
                }}
            >
                <View
                    className="rounded-xl items-center justify-center mr-5 shrink-0"
                    style={[
                        styles.iconShadow,
                        {
                            backgroundColor: color,
                            width: isDesktop ? 72 : 52,
                            height: isDesktop ? 72 : 52,
                            borderRadius: 18,
                            transform: [
                                { scale: isHovered && isDesktop ? 1.05 : 1 },
                            ],
                        },
                    ]}
                >
                    <Ionicons
                        name={icon}
                        size={isDesktop ? 34 : 24}
                        color="#fff"
                    />
                </View>
                <View className="flex-1">
                    <Text
                        className="mb-1.5"
                        style={[
                            styles.titleText,
                            {
                                color:
                                    isHovered && isDesktop
                                        ? color
                                        : Colors.black,
                                fontSize: isDesktop ? 27 : 21,
                                lineHeight: isDesktop ? 32 : 24,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            styles.descriptionText,
                            {
                                color: Colors.black,
                                opacity: 0.7,
                                fontSize: isDesktop ? 22 : 16,
                                lineHeight: isDesktop ? 28 : 20,
                            },
                        ]}
                        numberOfLines={2}
                    >
                        {description}
                    </Text>
                </View>
            </View>

            {isHovered && isDesktop && (
                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            borderRadius: 16,
                            backgroundColor: `${color}08`,
                        },
                    ]}
                />
            )}
        </Pressable>
    );
};

export default function ArchaeologicalPiecesIndex() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
            <Navbar
                title="Piezas Arqueológicas"
                showBackArrow
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: isDesktop ? 48 : 32,
                    flexGrow: 1, // clave para poder centrar en Y en mobile
                }}
            >
                {/* Contenedor central más ancho y más arriba en escritorio */}
                <View
                    className="w-full mx-auto flex-1"
                    style={{
                        maxWidth: isDesktop ? 1360 : 720,
                        paddingHorizontal: isDesktop ? 35 : 16,
                        paddingTop: isDesktop ? 35 : 0,
                        paddingBottom: isDesktop ? 0 : 24,
                        justifyContent: isDesktop ? "flex-start" : "center", // móvil centrado en eje Y
                    }}
                >
                    {/* Header */}
                    <View
                        style={{ marginBottom: isDesktop ? 36 : 24 }}
                        className="items-center"
                    >
                        <Text
                            style={[
                                styles.headerTitle,
                                {
                                    color: Colors.black,
                                    fontSize: isDesktop ? 60 : 28,
                                    lineHeight: isDesktop ? 75 : 34,
                                },
                            ]}
                        >
                            Gestión del Inventario
                        </Text>
                        <Text
                            style={[
                                styles.headerSubtitle,
                                {
                                    marginTop: 8,
                                    color: Colors.black,
                                    opacity: 0.65,
                                    fontSize: isDesktop ? 30 : 16,
                                    textAlign: "center",
                                },
                            ]}
                        >
                            Administre las piezas arqueológicas del museo
                        </Text>
                    </View>

                    {/* Pequeño subtítulo de sección en desktop, ayuda a jerarquizar */}
                    {isDesktop && (
                        <Text
                            style={[
                                styles.sectionLabel,
                                {
                                    marginBottom: 16,
                                    color: Colors.black,
                                    opacity: 0.6,
                                },
                            ]}
                        >
                            Acciones principales
                        </Text>
                    )}

                    {/* Grid de acciones */}
                    <View style={{ rowGap: isDesktop ? 20 : 14 }}>
                        {/* Primera fila */}
                        <View
                            style={{
                                flexDirection: isDesktop ? "row" : "column",
                                columnGap: isDesktop ? 20 : 0,
                                rowGap: isDesktop ? 0 : 14,
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <ActionCard
                                    title="Ver todas las piezas"
                                    description="Consulte el catálogo completo del inventario"
                                    icon="clipboard-outline"
                                    color={Colors.lightgreen}
                                    onPress={() =>
                                        router.push(
                                            "/(tabs)/archaeological-Pieces/View_pieces"
                                        )
                                    }
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ActionCard
                                    title="Registrar nueva pieza"
                                    description="Añada un nuevo artefacto al inventario"
                                    icon="add-circle-outline"
                                    color={Colors.green}
                                    onPress={() =>
                                        router.push(
                                            "/(tabs)/archaeological-Pieces/New_piece"
                                        )
                                    }
                                />
                            </View>
                        </View>

                        {/* Segunda fila - destacado */}
                        <View style={{ marginVertical: isDesktop ? 0 : 0 }}>
                            <ActionCard
                                title="Mapa del Depósito"
                                description="Visualice la distribución de piezas en las estanterías del depósito"
                                icon="map-outline"
                                color={Colors.darkgreen}
                                onPress={() =>
                                    router.push(
                                        "/(tabs)/archaeological-Pieces/deposit-map"
                                    )
                                }
                            />
                        </View>

                        {/* Subtítulo para las herramientas */}
                        {isDesktop && (
                            <Text
                                style={[
                                    styles.sectionLabel,
                                    {
                                        marginTop: 16,
                                        marginBottom: 4,
                                        color: Colors.black,
                                        opacity: 0.6,
                                    },
                                ]}
                            >
                                Herramientas de organización
                            </Text>
                        )}

                        {/* Tercera fila */}
                        <View
                            style={{
                                flexDirection: isDesktop ? "row" : "column",
                                columnGap: isDesktop ? 20 : 0,
                                rowGap: isDesktop ? 0 : 14,
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <ActionCard
                                    title="Clasificador interno"
                                    description="Configure etiquetas de clasificación"
                                    icon="pricetag-outline"
                                    color={Colors.cremit}
                                    onPress={() =>
                                        router.push(
                                            "/(tabs)/archaeological-Pieces/New_internal-classifier"
                                        )
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 5,
    },
    iconShadow: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    headerTitle: {
        fontFamily: "MateSC-Regular",
        letterSpacing: 0.6,
        textAlign: "center",
    },
    headerSubtitle: {
        fontFamily: "CrimsonText-Regular",
    },
    sectionLabel: {
        fontFamily: "CrimsonText-Regular",
        fontSize: 20,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1.4,
    },
    titleText: {
        fontFamily: "MateSC-Regular",
        letterSpacing: 0.3,
    },
    descriptionText: {
        fontFamily: "CrimsonText-Regular",
    },
});
