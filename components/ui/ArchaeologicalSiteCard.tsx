import React from 'react';
import GenericCard, { CardAction, CardField } from './GenericCard';
import { ArchaeologicalSite } from '@/repositories/archaeologicalsiteRepository';

interface ArchaeologicalSiteCardProps {
  site: ArchaeologicalSite;
  onEdit: (site: ArchaeologicalSite) => void;
  onDelete: (id: number) => void;
  onViewDetails: (site: ArchaeologicalSite) => void;
}

const ArchaeologicalSiteCard: React.FC<ArchaeologicalSiteCardProps> = ({
  site,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const fields: CardField[] = [
    {
      label: 'Sitio',
      value: site.Name,
      isTitle: true,
    },
    {
      label: 'Región',
      value: site.region?.name,
      isSubtitle: true,
    },
    {
      label: 'Descripción',
      value: site.Description,
    },
    {
      label: 'Ubicación',
      value: site.Location,
    },
  ];

  const actions: CardAction[] = [
    {
      icon: 'eye',
      label: 'Ver detalles',
      onPress: () => onViewDetails(site),
    },
    {
      icon: 'pencil',
      label: 'Editar',
      onPress: () => onEdit(site),
    },
    {
      icon: 'trash',
      label: 'Eliminar',
      onPress: () => site.id && onDelete(site.id),
      destructive: true,
    },
  ];

  return (
    <GenericCard
      id={site.id}
      fields={fields}
      actions={actions}
      cardType="Sitio Arqueológico"
    />
  );
};

export default ArchaeologicalSiteCard;