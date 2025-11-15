import React from 'react';
import GenericCard, { CardAction, CardField } from './GenericCard';
import { Archaeologist } from '@/repositories/archaeologistRespository';

interface ArchaeologistCardProps {
  archaeologist: Archaeologist;
  onEdit: (archaeologist: Archaeologist) => void;
  onDelete: (id: number) => void;
  onViewDetails: (archaeologist: Archaeologist) => void;
}

const ArchaeologistCard: React.FC<ArchaeologistCardProps> = ({
  archaeologist,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const fullName = `${archaeologist.firstname} ${archaeologist.lastname}`;

  const fields: CardField[] = [
    {
      label: 'Nombre completo',
      value: fullName,
      isTitle: true,
    },
    {
      label: 'Nombre',
      value: archaeologist.firstname,
    },
    {
      label: 'Apellido',
      value: archaeologist.lastname,
    },
  ];

  const actions: CardAction[] = [
    {
      icon: 'eye',
      label: 'Ver detalles',
      onPress: () => onViewDetails(archaeologist),
    },
    {
      icon: 'pencil',
      label: 'Editar',
      onPress: () => onEdit(archaeologist),
    },
    {
      icon: 'trash',
      label: 'Eliminar',
      onPress: () => archaeologist.id && onDelete(archaeologist.id),
      destructive: true,
    },
  ];

  return (
    <GenericCard
      id={archaeologist.id}
      fields={fields}
      actions={actions}
      cardType="Arqueólogo"
    />
  );
};

export default ArchaeologistCard;