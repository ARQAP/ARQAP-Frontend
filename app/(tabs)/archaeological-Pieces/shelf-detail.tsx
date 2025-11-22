import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ShelfDetailView from '../../../components/ShelfDetailView';
import Colors from '../../../constants/Colors';
import { usePhysicalLocations } from '../../../hooks/usePhysicalLocation';
import { useShelf } from '../../../hooks/useShelf';

type SlotId = string;

export default function ShelfDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Normalizamos los params
  const rawShelfId = params.shelfId as string | undefined;
  const shelfLabelParam = params.shelfLabel as string | undefined;

  const shelfIdNumber =
    rawShelfId && !Number.isNaN(Number(rawShelfId))
      ? Number(rawShelfId)
      : undefined;

  // Si por algún motivo llegamos sin shelfId válido, mostramos error limpio
  if (!shelfIdNumber) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Ionicons
            name="alert-circle-outline"
            size={52}
            color={Colors.brown}
            style={{ opacity: 0.7 }}
          />
          <Text style={styles.errorTitle}>Estantería no especificada</Text>
          <Text style={styles.errorText}>
            No se pudo determinar qué estantería mostrar. Volvé al mapa de depósito e intentá nuevamente.
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Volver</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Hooks de datos
  const { data: shelf, isLoading: shelfLoading } = useShelf(shelfIdNumber);
  const { data: allLocations, isLoading: locationsLoading } = usePhysicalLocations();

  // Calcular niveles, columnas y slots ocupados desde locations
  const { levels, columns, occupiedSlots } = useMemo(() => {
    if (!allLocations) {
      return { levels: 0, columns: 0, occupiedSlots: [] as SlotId[] };
    }

    const shelfLocations = allLocations.filter(
      (loc: any) => loc.shelfId === shelfIdNumber
    );

    if (shelfLocations.length === 0) {
      return { levels: 0, columns: 0, occupiedSlots: [] as SlotId[] };
    }

    const columnToNumber = (col: string): number => {
      const map: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
      return map[col.toUpperCase()] || 1;
    };

    let maxLevel = 0;
    let maxColumn = 0;
    const occupied: SlotId[] = [];

    shelfLocations.forEach((loc: any) => {
      const level = Number(loc.level);
      const columnNum = columnToNumber(String(loc.column));

      if (level > maxLevel) maxLevel = level;
      if (columnNum > maxColumn) maxColumn = columnNum;

      occupied.push(`L${level}-C${columnNum}`);
    });

    return {
      levels: maxLevel,
      columns: maxColumn,
      occupiedSlots: occupied,
    };
  }, [allLocations, shelfIdNumber]);

  const loading = shelfLoading || locationsLoading;

  const shelfName =
    shelfLabelParam || (shelf ? `Estante ${shelf.code}` : 'Estantería');

  const handleSlotClick = (slotId: string) => {

    const match = slotId.match(/L(\d+)-C(\d+)/);
    if (!match) return;

    const [, levelNum, columnNum] = match;

    const numberToColumn = (num: number): string => {
      const map: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
      return map[num] || 'A';
    };

    const columnLetter = numberToColumn(Number(columnNum));

    // 🔁 CLAVE: reemplazamos el modal por la vista de piezas
    router.push({
      pathname: '/(tabs)/archaeological-Pieces/View_pieces',
      params: {
        shelfId: String(shelfIdNumber),
        shelfLabel: shelfName,
        level: String(levelNum),
        column: columnLetter,
        slotId,
      },
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

  if (!shelf || levels === 0 || columns === 0) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Ionicons
            name="cube-outline"
            size={64}
            color={Colors.brown}
            style={{ opacity: 0.3 }}
          />
          <Text style={styles.errorTitle}>Sin configuración</Text>
          <Text style={styles.errorText}>
            Esta estantería no tiene niveles ni columnas configurados.
          </Text>
          <Text style={styles.errorHint}>
            Configurá las ubicaciones físicas desde el panel de administración.
          </Text>

          <Pressable
            className="flex-row items-center gap-2 bg-[#4A5D23] px-6 py-3 rounded-full mt-4 shadow-lg active:scale-[0.98] active:opacity-70"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-semibold">Volver</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ShelfDetailView
      shelfName={shelfName}
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
  },
  errorContent: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 340,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38332b',
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#766f63',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: '#a39a8f',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.darkgreen,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
