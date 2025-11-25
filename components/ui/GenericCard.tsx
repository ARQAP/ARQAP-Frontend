import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export interface CardField {
  label: string;
  value: string | number | undefined | null;
  isTitle?: boolean;
  isSubtitle?: boolean;
}

export interface CardAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

export interface GenericCardProps {
  id?: number;
  fields: CardField[];
  actions: CardAction[];
  cardType?: string; // Para identificar el tipo de tarjeta
  customStyles?: {
    container?: object;
    title?: object;
    subtitle?: object;
    field?: object;
  };
  headerContent?: React.ReactNode; // Contenido adicional para el header (ej: badges)
}

const GenericCard: React.FC<GenericCardProps> = ({
  id,
  fields,
  actions,
  cardType = "",
  customStyles = {},
  headerContent,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const titleField = fields.find((field) => field.isTitle);
  const subtitleField = fields.find((field) => field.isSubtitle);
  const dataFields = fields.filter(
    (field) => !field.isTitle && !field.isSubtitle
  );

  const handleActionPress = (action: CardAction) => {
    setMenuVisible(false);

    if (action.destructive) {
      Alert.alert(
        "Confirmar acción",
        `¿Estás seguro que deseas ${action.label.toLowerCase()}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar",
            style: "destructive",
            onPress: action.onPress,
          },
        ]
      );
    } else {
      action.onPress();
    }
  };

  return (
    <View style={[styles.container, customStyles.container]}>
      {/* Header con título y menú */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {titleField && (
            <Text style={[styles.title, customStyles.title]} numberOfLines={2}>
              {titleField.value}
            </Text>
          )}
          {subtitleField && (
            <Text
              style={[styles.subtitle, customStyles.subtitle]}
              numberOfLines={1}
            >
              {subtitleField.value}
            </Text>
          )}
          {/* Contenido adicional del header (ej: badges) */}
          {headerContent && (
            <View style={styles.headerContent}>
              {headerContent}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.green} />
        </TouchableOpacity>
      </View>

      {/* Campos de datos */}
      {dataFields.length > 0 && (
        <View style={styles.fieldsContainer}>
          {dataFields.map(
            (field, index) =>
              field.value !== undefined &&
              field.value !== null &&
              field.value !== "" && (
                <View key={index} style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{field.label}:</Text>
                  <Text
                    style={[styles.fieldValue, customStyles.field]}
                    numberOfLines={2}
                  >
                    {String(field.value)}
                  </Text>
                </View>
              )
          )}
        </View>
      )}

      {/* Modal del menú */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  action.destructive && styles.destructiveMenuItem,
                  index === actions.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() => handleActionPress(action)}
              >
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={
                    action.color ||
                    (action.destructive ? Colors.brown : Colors.green)
                  }
                />
                <Text
                  style={[
                    styles.menuItemText,
                    action.destructive && styles.destructiveMenuItemText,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerContent: {
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.green,
    fontStyle: "italic",
  },
  menuButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  fieldsContainer: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.green,
    marginRight: 8,
    minWidth: 80,
  },
  fieldValue: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    minWidth: 200,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightbrown,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  destructiveMenuItem: {
    backgroundColor: "#FFF5F5",
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.black,
  },
  destructiveMenuItemText: {
    color: Colors.brown,
  },
});

export default GenericCard;
