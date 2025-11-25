import React from "react";
import GenericCard, { CardAction, CardField } from "./GenericCard";
import { InternalMovement } from "@/repositories/internalMovementRepository";
import { getShelfLabel } from "@/utils/shelfLabels";

interface MovementCardProps {
  movement: InternalMovement;
  onViewDetails: (movement: InternalMovement) => void;
  onFinalize?: (id: number) => void;
}

const MovementCard: React.FC<MovementCardProps> = ({
  movement,
  onViewDetails,
  onFinalize,
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

  const isActive = !movement.returnTime; // Usar returnTime para determinar si está activo
  const statusText = isActive ? "Activo" : "Finalizado";

  const fields: CardField[] = [
    {
      label: "Movimiento",
      value: `${movement.artefact?.name || "Pieza desconocida"}`,
      isTitle: true,
    },
    {
      label: "Estado",
      value: statusText,
      isSubtitle: true,
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
      color: "#16a34a", // Verde para acción positiva
    });
  }

  return (
    <GenericCard
      id={movement.id}
      fields={fields}
      actions={actions}
      cardType={isActive ? "Movimiento Activo" : "Movimiento Finalizado"}
    />
  );
};

export default MovementCard;

