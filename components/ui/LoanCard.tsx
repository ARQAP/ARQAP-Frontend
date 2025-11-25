import React from "react";
import GenericCard, { CardAction, CardField } from "./GenericCard";
import { Loan } from "@/repositories/loanRepository";

interface LoanCardProps {
  loan: Loan;
  onViewDetails: (loan: Loan) => void;
  onFinalize: (id: number) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  onViewDetails,
  onFinalize,
}) => {
  // Formatear datetime correctamente sin problemas de timezone
  const formatDateTime = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return "No definida";

    try {
      // Crear fecha directamente desde el string datetime
      const date = new Date(dateTimeString);

      // Formatear usando métodos locales para evitar conversiones de zona horaria
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

  const isActive = !loan.returnTime; // Usar returnTime para determinar si está activo
  const statusText = isActive ? "Activo" : "Finalizado";

  const fields: CardField[] = [
    {
      label: "Préstamo",
      value: `${loan.artefact?.name} - ${
        loan.artefact?.internalClassifier
          ? `(${loan.artefact.internalClassifier.name}-${loan.artefact.internalClassifier.number})`
          : "Sin clasificador"
      }`,
      isTitle: true,
    },
    {
      label: "Estado",
      value: statusText,
      isSubtitle: true,
    },
    {
      label: "Artefacto",
      value: loan.artefact?.name || "No especificado",
    },
    {
      label: "Solicitante",
      value: loan.requester
        ? `${loan.requester.firstname || ""} ${loan.requester.lastname || ""}`.trim() ||
          loan.requester.type
        : "No especificado",
    },
    {
      label: "Fecha de préstamo",
      value: formatDateTime(loan.loanTime), // Usar loanTime que tiene datetime completo
    },
    {
      label: "Fecha de devolución",
      value: loan.returnTime
        ? formatDateTime(loan.returnTime) // Usar returnTime que tiene datetime completo
        : "Pendiente",
    },
  ];

  const actions: CardAction[] = [
    {
      icon: "eye",
      label: "Ver detalles",
      onPress: () => onViewDetails(loan),
    },
  ];

  // Solo agregar la opción de finalizar si el préstamo está activo
  if (isActive) {
    actions.push({
      icon: "checkmark-circle",
      label: "Finalizar préstamo",
      onPress: () => loan.id && onFinalize(loan.id),
      color: "#16a34a", // Verde para acción positiva
    });
  }

  return (
    <GenericCard
      id={loan.id}
      fields={fields}
      actions={actions}
      cardType={isActive ? "Préstamo Activo" : "Préstamo Finalizado"}
    />
  );
};

export default LoanCard;
