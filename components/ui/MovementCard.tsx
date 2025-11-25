import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GenericCard, { CardAction, CardField } from "./GenericCard";
import { InternalMovement } from "@/repositories/internalMovementRepository";
import { getShelfLabel } from "@/utils/shelfLabels";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface MovementCardProps {
  movement: InternalMovement;
  onViewDetails: (movement: InternalMovement) => void;
  onFinalize?: (id: number) => void;
  type?: "group" | "single"; // Tipo de movimiento
  groupSize?: number; // Tamaño del grupo (solo para tipo group)
  isGroupHeader?: boolean; // Si es el header del grupo (no renderiza la card completa)
}

const MovementCard: React.FC<MovementCardProps> = ({
  movement,
  onViewDetails,
  onFinalize,
  type = "single",
  groupSize,
  isGroupHeader = false,
}) => {
  // Formatear datetime correctamente
  const formatDateTime = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return "No definida";

    try {
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Formatear ubicación física
  const formatLocation = (location: any) => {
    if (!location) return "No especificada";
    const shelfLabel = location.shelf ? getShelfLabel(location.shelf.code) : "Estantería";
    return `${shelfLabel} - Nivel ${location.level}, Columna ${location.column}`;
  };

  const isActive = !movement.returnTime;
  const statusText = isActive ? "Activo" : "Finalizado";
  const movementType = type || (movement.groupMovementId ? "group" : "single");

  // Renderizar badges de estado y tipo
  const renderBadges = () => (
    <View style={styles.badgesContainer}>
      {/* Badge de Estado */}
      <View
        style={[
          styles.badge,
          isActive ? styles.badgeActive : styles.badgeFinished,
        ]}
      >
        <Ionicons
          name={isActive ? "checkmark-circle" : "checkmark-circle-outline"}
          size={12}
          color={isActive ? Colors.cremit : Colors.brown}
        />
        <Text
          style={[
            styles.badgeText,
            isActive ? styles.badgeTextActive : styles.badgeTextFinished,
          ]}
        >
          {statusText}
        </Text>
      </View>

      {/* Badge de Tipo */}
      <View
        style={[
          styles.badge,
          movementType === "group" ? styles.badgeGroup : styles.badgeSingle,
        ]}
      >
        <Ionicons
          name={movementType === "group" ? "layers" : "cube"}
          size={12}
          color={Colors.cremit}
        />
        <Text style={[styles.badgeText, styles.badgeTextType]}>
          {movementType === "group" ? "Grupo" : "Individual"}
        </Text>
        {movementType === "group" && groupSize && (
          <Text style={[styles.badgeText, styles.badgeTextType]}>
            {" "}({groupSize} piezas)
          </Text>
        )}
      </View>
    </View>
  );

  const fields: CardField[] = [
    {
      label: "Movimiento",
      value: `${movement.artefact?.name || "Pieza desconocida"}`,
      isTitle: true,
    },
    {
      label: "Pieza",
      value: movement.artefact?.name || "No especificada",
    },
    {
      label: "Desde",
      value: formatLocation(movement.fromPhysicalLocation),
    },
    {
      label: "Hacia",
      value: formatLocation(movement.toPhysicalLocation),
    },
    {
      label: "Fecha y Hora",
      value: formatDateTime(movement.movementTime),
    },
    {
      label: "Fecha de Finalización",
      value: movement.returnTime
        ? formatDateTime(movement.returnTime)
        : "Pendiente",
    },
    ...(movement.reason ? [{
      label: "Motivo",
      value: movement.reason,
    }] : []),
    ...(movement.observations ? [{
      label: "Observaciones",
      value: movement.observations,
    }] : []),
  ];

  const actions: CardAction[] = [];

  // Solo agregar la opción de finalizar si el movimiento está activo
  if (isActive && onFinalize && movement.id) {
    actions.push({
      icon: "return-down-back",
      label: "Devolver a ubicación original",
      onPress: () => onFinalize(movement.id!),
      color: "#16a34a",
    });
  }

  return (
    <View style={movementType === "group" ? styles.groupCardContainer : styles.singleCardContainer}>
      <View style={movementType === "group" ? styles.groupCardWrapper : undefined}>
        {/* Badges arriba de la card */}
        <View style={styles.badgesWrapper}>
          {renderBadges()}
        </View>
        <GenericCard
          id={movement.id}
          fields={fields}
          actions={actions}
          cardType={isActive ? "Movimiento Activo" : "Movimiento Finalizado"}
          customStyles={{
            container: movementType === "group" ? styles.groupCard : styles.singleCard,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgesWrapper: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  badgeActive: {
    backgroundColor: Colors.green,
  },
  badgeFinished: {
    backgroundColor: "#E5E5E5",
  },
  badgeGroup: {
    backgroundColor: Colors.brown,
  },
  badgeSingle: {
    backgroundColor: "#6B705C",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgeTextActive: {
    color: Colors.cremit,
  },
  badgeTextFinished: {
    color: Colors.brown,
  },
  badgeTextType: {
    color: Colors.cremit,
  },
  groupCardContainer: {
    marginBottom: 4,
  },
  groupCardWrapper: {
    backgroundColor: "#F9F7F4",
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.brown,
  },
  groupCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  singleCardContainer: {
    marginBottom: 4,
  },
  singleCard: {
    backgroundColor: Colors.white,
  },
});

export default MovementCard;

