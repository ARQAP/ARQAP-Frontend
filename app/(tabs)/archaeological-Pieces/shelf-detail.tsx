import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import ShelfDetailView from '../../../components/ShelfDetailView';
import Colors from '../../../constants/Colors';
import { apiClient } from '../../../lib/api';

type ShelfData = {
  id: number;
  code: number;
  name: string;
  maxLevel: number;
  maxColumn: number;
};

export default function ShelfDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const shelfId = params.shelfId as string;
  const shelfLabel = params.shelfLabel as string;

  const [shelf, setShelf] = useState<ShelfData | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState(4);
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    if (!shelfId) return;

    const fetchShelfData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de la estantería
        const shelfResponse = await apiClient.get(`/shelfs/${shelfId}`);
        const shelfData = shelfResponse.data;
        
        // Obtener physical locations para este shelf
        const locationsResponse = await apiClient.get(`/physical-locations/`);
        const allLocations = locationsResponse.data || [];
        
        // Filtrar locations de este shelf
        const shelfLocations = allLocations.filter(
          (loc: any) => loc.shelfId === Number(shelfId)
        );
        
        // Si no hay locations para este shelf, mostrar mensaje
        if (shelfLocations.length === 0) {
          setShelf({
            id: shelfData.id,
            code: shelfData.code,
            name: shelfLabel || `Estante ${shelfData.code}`,
            maxLevel: 0,
            maxColumn: 0,
          });
          setLevels(0);
          setColumns(0);
          setOccupiedSlots([]);
          return;
        }
        
        // Mapeo de letras a números: A=1, B=2, C=3, D=4
        const columnToNumber = (col: string): number => {
          const map: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
          return map[col.toUpperCase()] || 1;
        };
        
        // Determinar max level y max column SOLO de los datos reales
        let maxLevel = 0;
        let maxColumn = 0;
        const occupied: string[] = [];
        
        shelfLocations.forEach((loc: any) => {
          const level = Number(loc.level);
          const columnNum = columnToNumber(loc.column);
          
          if (level > maxLevel) maxLevel = level;
          if (columnNum > maxColumn) maxColumn = columnNum;
          
          // Agregar a slots ocupados
          occupied.push(`L${level}-C${columnNum}`);
        });
        
        setLevels(maxLevel);
        setColumns(maxColumn);
        setOccupiedSlots(occupied);
        
        setShelf({
          id: shelfData.id,
          code: shelfData.code,
          name: shelfLabel || `Estante ${shelfData.code}`,
          maxLevel: maxLevel,
          maxColumn: maxColumn,
        });
      } catch (error) {
        console.error('Error fetching shelf data:', error);
        // Fallback a datos básicos si hay error
        setShelf({
          id: Number(shelfId),
          code: Number(shelfId),
          name: shelfLabel || `Estante ${shelfId}`,
          maxLevel: 0,
          maxColumn: 0,
        });
        setLevels(0);
        setColumns(0);
        setOccupiedSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [shelfId, shelfLabel]);

  const handleSlotClick = (slotId: string) => {
    console.log('Slot seleccionado:', slotId);
    
    // Navegar a la vista de piezas filtradas por estantería y slot
    const match = slotId.match(/L(\d+)-C(\d+)/);
    if (!match) return;
    
    const [, levelNum, columnNum] = match;
    
    // Convertir número de columna de vuelta a letra: 1=A, 2=B, 3=C, 4=D
    const numberToColumn = (num: number): string => {
      const map: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
      return map[num] || 'A';
    };
    
    const columnLetter = numberToColumn(Number(columnNum));
    
    router.push({
      pathname: '/(tabs)/archaeological-Pieces/View_pieces',
      params: {
        shelfId,
        shelfLabel: shelf?.name || shelfLabel,
        level: Number(levelNum),
        column: columnLetter,
        slotId,
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.darkgreen} />
        <Text style={styles.loadingText}>Cargando estantería...</Text>
      </View>
    );
  }

  if (!shelf) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se encontró la estantería</Text>
      </View>
    );
  }

  if (levels === 0 || columns === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Sin ubicaciones físicas</Text>
        <Text style={styles.errorText}>
          Esta estantería no tiene ubicaciones físicas registradas todavía.
        </Text>
        <Text style={styles.errorHint}>
          Crea ubicaciones físicas (nivel y columna) para este estante desde el panel de administración.
        </Text>
      </View>
    );
  }

  return (
    <ShelfDetailView
      shelfName={shelf.name}
      shelfId={shelf.id}
      levels={levels}
      columns={columns}
      occupiedSlots={occupiedSlots}
      onSlotClick={handleSlotClick}
      onClose={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5efe5',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#766f63',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5efe5',
    padding: 20,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38332b',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#766f63',
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#a39a8f',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 300,
  },
});
