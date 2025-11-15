/**
 * Ejemplo de uso de los componentes GenericCard y GenericList
 * 
 * Este archivo muestra cómo implementar las tarjetas y listas estandarizadas
 * en diferentes pantallas de la aplicación.
 */

import React from 'react';
import { Alert } from 'react-native';
import { 
  CollectionCard, 
  GenericList,
  ArchaeologicalSiteCard,
  ArchaeologistCard,
  LoanCard 
} from '@/components/ui';
import { useCollections, useDeleteCollection } from '@/hooks/useCollections';
import type { Collection } from '@/repositories/collectionRepository';

// Ejemplo 1: Lista de Colecciones
export const CollectionsScreen: React.FC = () => {
  const { data: collections, isLoading, refetch, isRefetching, error } = useCollections();
  const deleteMutation = useDeleteCollection();

  const handleEdit = (collection: Collection) => {
    // Navegar a pantalla de edición
    console.log('Editar colección:', collection);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      Alert.alert('Éxito', 'Colección eliminada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la colección');
    }
  };

  const handleViewDetails = (collection: Collection) => {
    // Navegar a pantalla de detalles
    console.log('Ver detalles de colección:', collection);
  };

  const renderCollectionCard = (collection: Collection) => (
    <CollectionCard
      collection={collection}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onViewDetails={handleViewDetails}
    />
  );

  return (
    <GenericList
      data={collections || []}
      renderItem={renderCollectionCard}
      keyExtractor={(item) => item.id?.toString() || ''}
      title="Colecciones Arqueológicas"
      isLoading={isLoading}
      isRefreshing={isRefetching}
      onRefresh={refetch}
      emptyStateMessage="No hay colecciones registradas"
      error={error?.message}
    />
  );
};

// Ejemplo 2: Lista de Sitios Arqueológicos
export const ArchaeologicalSitesScreen: React.FC = () => {
  // Similar implementación para sitios arqueológicos
  // usando ArchaeologicalSiteCard y useArchaeologicalSites
  return null; // Placeholder
};

// Ejemplo 3: Lista de Arqueólogos
export const ArchaeologistsScreen: React.FC = () => {
  // Similar implementación para arqueólogos
  // usando ArchaeologistCard y useArchaeologists
  return null; // Placeholder
};

// Ejemplo 4: Lista de Préstamos
export const LoansScreen: React.FC = () => {
  // Implementación específica para préstamos
  // usando LoanCard con acciones específicas (ver detalles, finalizar)
  return null; // Placeholder
};

/**
 * NOTAS DE IMPLEMENTACIÓN:
 * 
 * 1. Cada pantalla usa el mismo patrón:
 *    - Hook para obtener datos
 *    - Handlers para las acciones
 *    - GenericList con el componente de tarjeta específico
 * 
 * 2. Personalización por pantalla:
 *    - Título específico
 *    - Mensaje de estado vacío personalizado
 *    - Acciones específicas según el tipo de entidad
 * 
 * 3. Colores y estilos consistentes:
 *    - Todos los componentes usan Colors de @/constants/Colors
 *    - Misma estructura de tarjeta en todas las pantallas
 *    - Comportamiento de menú uniforme
 * 
 * 4. Manejo de estados:
 *    - Loading states
 *    - Error states
 *    - Empty states
 *    - Refresh functionality
 * 
 * 5. Acciones diferenciadas:
 *    - Colecciones: Ver, Editar, Eliminar
 *    - Sitios: Ver, Editar, Eliminar
 *    - Arqueólogos: Ver, Editar, Eliminar  
 *    - Préstamos: Ver detalles, Finalizar (solo activos)
 */