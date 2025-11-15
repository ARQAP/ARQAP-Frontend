import React from 'react';
import GenericCard, { CardAction, CardField } from './GenericCard';
import { Collection } from '@/repositories/collectionRepository';

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
  const fields: CardField[] = [
    {
      label: 'Nombre',
      value: collection.name,
      isTitle: true,
    },
    {
      label: 'Descripción',
      value: collection.description,
    },
    {
      label: 'Año',
      value: collection.year,
    },
  ];

  const actions: CardAction[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      onPress: () => onEdit(collection),
    },
    {
      icon: 'trash',
      label: 'Eliminar',
      onPress: () => collection.id && onDelete(collection.id),
      destructive: true,
    },
  ];

  return (
    <GenericCard
      id={collection.id}
      fields={fields}
      actions={actions}
      cardType="Colección"
    />
  );
};

export default CollectionCard;