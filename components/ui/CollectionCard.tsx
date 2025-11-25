import Colors from "@/constants/Colors";
import { Collection } from "@/repositories/collectionRepository";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import InfoRow from "./InfoRow";

interface CollectionCardProps {
    collection: Collection;
    onEdit: (collection: Collection) => void;
    onDelete: (id: number) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
    collection,
    onEdit,
    onDelete,
}) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
    const isWeb = Platform.OS === "web";

    // Validar que collection tenga los valores correctos
    if (!collection || typeof collection !== "object") {
        return null;
    }

    const handleEdit = () => {
        setMenuVisible(false);
        onEdit(collection);
    };

    const handleDelete = () => {
        setMenuVisible(false);
        const collectionName = collection.name || "esta colección";
        
        if (Platform.OS === "web") {
            if (window.confirm(`¿Estás seguro que deseas eliminar la colección "${collectionName}"?`)) {
                collection.id && onDelete(collection.id);
            }
        } else {
            Alert.alert(
                "Confirmar eliminación",
                `¿Estás seguro que deseas eliminar la colección "${collectionName}"?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: () => collection.id && onDelete(collection.id),
                    },
                ]
            );
        }
    };

    // Asegurar que todos los valores sean strings válidos
    const safeName = String(collection.name || "Sin nombre");
    const safeDescription = collection.description
        ? String(collection.description)
        : null;
    const safeYear = collection.year ? String(collection.year) : null;

    const CardContent = (
        <View
            style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                borderWidth: 1,
                borderColor: "#E8DFD0",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: isWeb ? 26 : 20,
                            fontWeight: "700",
                            marginBottom: 16,
                            fontFamily: "CrimsonText-Regular",
                            color: "#2c2c2c",
                            letterSpacing: 0.3,
                            lineHeight: isWeb ? 32 : 26,
                        }}
                    >
                        {safeName}
                    </Text>


                    <View style={{ gap: 10 }}>
                        {safeDescription && (
                            <InfoRow
                                icon="document-text-outline"
                                label="DESCRIPCIÓN"
                                value={safeDescription}
                            />
                        )}
                        {safeYear && (
                            <InfoRow
                                icon="calendar-outline"
                                label="AÑO"
                                value={safeYear}
                            />
                        )}
                    </View>
                </View>

                <View
                    style={{
                        marginLeft: 12,
                        alignItems: "center",
                        position: "relative",
                    }}
                >
                    <TouchableOpacity
                        onPress={(e: any) => {
                            e.stopPropagation?.();
                            if (isWeb && e.currentTarget) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setButtonPosition({
                                    top: rect.bottom + 4,
                                    right: window.innerWidth - rect.right,
                                });
                            }
                            setMenuVisible(!menuVisible);
                        }}
                        style={{
                            padding: 6,
                            borderRadius: 20,
                            backgroundColor: "#F8F9FA",
                            borderWidth: 1,
                            borderColor: "#E8E8E8",
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="ellipsis-vertical"
                            size={18}
                            color={Colors.black}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (isWeb) {
        return (
            <>
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={{ flex: 1, minWidth: 0 }}
                    // @ts-ignore - Web-only hover effects
                    onMouseEnter={(e: any) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        const card = e.currentTarget.querySelector("div");
                        if (card) {
                            card.style.shadowOpacity = "0.16";
                            card.style.borderColor = "#6B705C";
                        }
                    }}
                    // @ts-ignore
                    onMouseLeave={(e: any) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        const card = e.currentTarget.querySelector("div");
                        if (card) {
                            card.style.shadowOpacity = "0.08";
                            card.style.borderColor = "#E8DFD0";
                        }
                    }}
                >
                    {CardContent}
                </TouchableOpacity>

                {menuVisible && (
                    <Modal
                        visible={menuVisible}
                        transparent
                        animationType="none"
                        onRequestClose={() => setMenuVisible(false)}
                    >
                        <Pressable
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                            }}
                            onPress={() => setMenuVisible(false)}
                        >
                            <View
                                style={{
                                    position: "absolute",
                                    top: buttonPosition.top,
                                    right: buttonPosition.right,
                                    backgroundColor: "white",
                                    borderRadius: 8,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 4,
                                    elevation: 10,
                                    minWidth: 140,
                                    borderWidth: 1,
                                    borderColor: "#E8E8E8",
                                }}
                                onStartShouldSetResponder={() => true}
                            >
                                <TouchableOpacity
                                    onPress={handleEdit}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#e0e0e0",
                                    }}
                                >
                                    <Ionicons
                                        name="create-outline"
                                        size={16}
                                        color={Colors.brown}
                                        style={{ marginRight: 10 }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: Colors.brown,
                                        }}
                                    >
                                        Editar
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: 12,
                                    }}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={16}
                                        color={Colors.brown}
                                        style={{ marginRight: 10 }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: Colors.brown,
                                        }}
                                    >
                                        Eliminar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Modal>
                )}
            </>
        );
    }

    return (
        <View>
            <TouchableOpacity activeOpacity={0.9}>
                {CardContent}
            </TouchableOpacity>

            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onPress={() => setMenuVisible(false)}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View
                            style={{
                                backgroundColor: "white",
                                borderRadius: 16,
                                minWidth: 200,
                                borderWidth: 1,
                                borderColor: "#E8E8E8",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.25,
                                shadowRadius: 12,
                                elevation: 10,
                                overflow: "hidden",
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleEdit}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: Colors.lightbrown,
                                }}
                            >
                                <Ionicons
                                    name="pencil"
                                    size={20}
                                    color={Colors.green}
                                />
                                <Text
                                    style={{
                                        marginLeft: 12,
                                        fontSize: 16,
                                        color: Colors.black,
                                    }}
                                >
                                    Editar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDelete}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 16,
                                    backgroundColor: "#FFF5F5",
                                    borderBottomLeftRadius: 16,
                                    borderBottomRightRadius: 16,
                                }}
                            >
                                <Ionicons
                                    name="trash"
                                    size={20}
                                    color={Colors.brown}
                                />
                                <Text
                                    style={{
                                        marginLeft: 12,
                                        fontSize: 16,
                                        color: Colors.brown,
                                    }}
                                >
                                    Eliminar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

export default CollectionCard;
