import React, { useCallback, useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DepositoSvg from '../Distribucion Deposito.svg';
import { apiClient } from '../lib/api';

type ShelfBox = { id: string; x: number; y: number; w: number; h: number; label?: string };

// Boxes extracted from the SVG (coordinates based on viewBox 0 0 559 539)
const SHELVES: ShelfBox[] = [
  // Estantes izquierda (A y B)
  { id: 's_87_205', x: 87.59, y: 205.207, w: 41.2, h: 50.278, label: 'Estante A1' },
  { id: 's_87_255', x: 87.59, y: 255.486, w: 41.2, h: 50.976, label: 'Estante A2' },
  { id: 's_87_306', x: 87.59, y: 306.462, w: 41.2, h: 50.976, label: 'Estante A3' },
  { id: 's_128_205', x: 128.791, y: 205.207, w: 41.2, h: 50.278, label: 'Estante B1' },
  { id: 's_128_255', x: 128.791, y: 255.486, w: 41.2, h: 50.976, label: 'Estante B2' },
  { id: 's_128_306', x: 128.791, y: 306.462, w: 41.2, h: 50.976, label: 'Estante B3' },
  // Estantes centro-izquierda (C y D)
  { id: 's_225_140', x: 225.855, y: 140.963, w: 41.2, h: 60.055, label: 'Estante C1' },
  { id: 's_225_201', x: 225.855, y: 201.018, w: 41.2, h: 60.055, label: 'Estante C2' },
  { id: 's_225_261', x: 225.855, y: 261.072, w: 41.2, h: 60.055, label: 'Estante C3' },
  { id: 's_225_321', x: 225.855, y: 321.127, w: 41.2, h: 60.055, label: 'Estante C4' },
  { id: 's_267_140', x: 267.056, y: 140.963, w: 41.2, h: 60.055, label: 'Estante D1' },
  { id: 's_267_201', x: 267.056, y: 201.018, w: 41.2, h: 60.055, label: 'Estante D2' },
  { id: 's_267_261', x: 267.056, y: 261.072, w: 41.2, h: 60.055, label: 'Estante D3' },
  { id: 's_267_321', x: 267.056, y: 321.127, w: 41.2, h: 60.055, label: 'Estante D4' },
  // Estantes centro-derecha (E y F)
  { id: 's_365_192', x: 365.517, y: 192.638, w: 41.2, h: 65.641, label: 'Estante E1' },
  { id: 's_365_258', x: 365.517, y: 258.279, w: 41.2, h: 65.641, label: 'Estante E2' },
  { id: 's_365_323', x: 365.517, y: 323.92, w: 41.2, h: 65.641, label: 'Estante E3' },
  { id: 's_365_389', x: 365.517, y: 389.561, w: 41.2, h: 65.641, label: 'Estante E4' },
  { id: 's_406_192', x: 406.717, y: 192.638, w: 41.2, h: 65.641, label: 'Estante F1' },
  { id: 's_406_258', x: 406.717, y: 258.279, w: 41.2, h: 65.641, label: 'Estante F2' },
  { id: 's_406_323', x: 406.717, y: 323.92, w: 41.2, h: 65.641, label: 'Estante F3' },
  { id: 's_406_389', x: 406.717, y: 389.561, w: 41.2, h: 65.641, label: 'Estante F4' },
  // Columna derecha
  { id: 's_510_58', x: 510.067, y: 58.563, w: 46.787, h: 78.211, label: 'Columna R1' },
  { id: 's_510_136', x: 510.067, y: 136.773, w: 46.787, h: 80.306, label: 'Columna R2' },
  { id: 's_510_216', x: 510.067, y: 216.38, w: 46.787, h: 80.306, label: 'Columna R3' },
  { id: 's_510_296', x: 510.067, y: 296.686, w: 46.787, h: 80.306, label: 'Columna R4' },
  { id: 's_510_376', x: 510.067, y: 376.991, w: 46.787, h: 80.306, label: 'Columna R5' },
  { id: 's_510_457', x: 510.067, y: 457.297, w: 46.787, h: 80.306, label: 'Columna R6' },
  // Estantes inferiores
  { id: 's_49_492', x: 49.882, y: 492.911, w: 60.753, h: 44.692, label: 'Estante Inf. A' },
  { id: 's_110_492', x: 110.634, y: 492.911, w: 60.753, h: 44.692, label: 'Estante Inf. B' },
  { id: 's_387_492', x: 387.863, y: 492.911, w: 60.753, h: 44.692, label: 'Estante Inf. C' },
  { id: 's_448_492', x: 448.616, y: 492.911, w: 60.753, h: 44.692, label: 'Estante Inf. D' },
  // Mesa central MT-1
  { id: 's_225_381', x: 225.855, y: 381.181, w: 81.976, h: 60.055, label: 'Mesa MT-1' },
  // Mesa superior MT-2
  { id: 's_87_154', x: 87.59, y: 154.929, w: 82.4, h: 50.278, label: 'Mesa MT-2' },
  // Mesa superior MT-3
  { id: 's_365_126', x: 365.517, y: 126.997, w: 82.4, h: 65.641, label: 'Mesa MT-3' },
];

// Map overlay ids to backend numeric shelf IDs. Fill these values to match your DB.
const SHELF_ID_MAP: Record<string, number> = {
  // example: 's_124_293': 1,
  // map each overlay id to the numeric shelf id used by the backend
};

export default function DepositMap({ style }: { style?: ViewStyle }) {
  const [selected, setSelected] = useState<ShelfBox | null>(null);
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null);
  
  // Detectar si estamos en escritorio (pantalla ancha)
  const isDesktop = Dimensions.get('window').width >= 768;
  
  // router navigation removed temporarily (Ver piezas feature disabled)

  const fetchItemsForShelf = useCallback(async (shelf: ShelfBox) => {
    try {
      setLoading(true);
      // backend provides /artefacts (protected). apiClient attaches token automatically.
      const res = await apiClient.get('/artefacts');
      const artefacts: any[] = res.data || [];
      // filter artefacts whose physicalLocation.shelf.id matches shelf id
      // NOTE: here we assume the shelf id can be obtained from shelf label or custom mapping.
      // As backend currently uses numeric IDs, you might want to map shelf ids accordingly.
      // For now we filter by coordinates mapping using PhysicalLocation.Shelf with approximate matching.
      const mappedId = SHELF_ID_MAP[shelf.id];
      const filtered = artefacts.filter(a => {
        if (!a.physicalLocation || !a.physicalLocation.shelf) return false;
        // if we have a mapping, compare to numeric id
        if (mappedId) return Number(a.physicalLocation.shelf.id) === mappedId;
        // otherwise try to match by label or fallback to false
        return String(a.physicalLocation.shelf.id) === shelf.id || String(a.physicalLocation.shelf.name) === shelf.label;
      });
      // If no numeric mapping was set, fallback to empty and log
      setItems(filtered.length ? filtered : []);
    } catch (err) {
      console.warn('Error fetching artefacts', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onShelfPress = useCallback((shelf: ShelfBox) => {
    setSelected(shelf);
    fetchItemsForShelf(shelf);
  }, [fetchItemsForShelf]);

  // derived details
  const details = useMemo(() => {
    if (!items) return null;
    const count = items.length;
    const collections = Array.from(new Set(items.map((i: any) => (i.collection && (i.collection.name || i.collection)) || null).filter(Boolean))).slice(0,5);
    const archaeologists = Array.from(new Set(items.map((i: any) => {
      const arch = i.archaeologist;
      if (!arch) return null;
      return arch.name || [arch.firstname, arch.lastname].filter(Boolean).join(' ');
    }).filter(Boolean))).slice(0,5);
    return { count, collections, archaeologists };
  }, [items]);

  // onViewPieces removed: navigation to View_pieces is disabled for now

  return (
    <View style={[{ width: '100%', flex: 1 }, style]}>
      <View style={[
        { width: '100%', flex: 1, position: 'relative' },
        isDesktop && { maxWidth: 900, alignSelf: 'center' }
      ]}>
        {/* SVG component - se ajusta al contenedor manteniendo aspect ratio */}
        <DepositoSvg 
          width="100%" 
          height="100%" 
          viewBox="0 0 559 539"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Overlay hotspots - usando porcentajes del viewBox */}
        {SHELVES.map(s => {
          // Calcular posiciones como porcentaje del viewBox (559x539)
          const leftPercent = (s.x / 559) * 100;
          const topPercent = (s.y / 539) * 100;
          const widthPercent = (s.w / 559) * 100;
          const heightPercent = (s.h / 539) * 100;
          const isSelected = selected?.id === s.id;
          const isHovered = hoveredShelf === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => onShelfPress(s)}
              onHoverIn={Platform.OS === 'web' ? () => setHoveredShelf(s.id) : undefined}
              onHoverOut={Platform.OS === 'web' ? () => setHoveredShelf(null) : undefined}
              style={[
                styles.hotspot, 
                { 
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                }
              ]}
              android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
            >
              <View style={[styles.hotInner, isSelected ? styles.selectedHot : isHovered ? styles.hoveredHot : undefined]} />
              {isHovered && Platform.OS === 'web' && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{s.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Sheet Modal / Side Panel - adaptativo */}
      <Modal 
        visible={!!selected} 
        transparent 
        animationType="fade" 
        onRequestClose={() => { setSelected(null); setItems(null); }}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => { setSelected(null); setItems(null); }}
        >
          <Pressable style={[styles.bottomSheet, isDesktop && styles.desktopPanel]} onPress={(e) => e.stopPropagation()}>
            {/* Handle bar */}
            <View style={styles.handleBar} />
            
            <Text style={styles.sheetTitle}>{selected?.label ?? 'Estantería'}</Text>
            
            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando información...</Text>
              </View>
            )}
            
            {!loading && details && (
              <View style={styles.contentContainer}>
                {/* Stats Cards */}
                <View style={styles.statsCard}>
                  <Text style={styles.statsNumber}>{details.count}</Text>
                  <Text style={styles.statsLabel}>Piezas arqueológicas</Text>
                </View>

                {/* Collections */}
                {details.collections.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Colecciones</Text>
                    <View style={styles.chipContainer}>
                      {details.collections.map((c: string) => (
                        <View key={c} style={styles.chip}>
                          <Text style={styles.chipText}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Archaeologists */}
                {details.archaeologists.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Investigadores</Text>
                    <View style={styles.chipContainer}>
                      {details.archaeologists.map((a: string) => (
                        <View key={a} style={styles.chip}>
                          <Text style={styles.chipText}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <Pressable 
                  style={styles.closeButton} 
                  onPress={() => { setSelected(null); setItems(null); }}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hotspot: {
    position: 'absolute',
  },
  hotInner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectedHot: {
    backgroundColor: 'rgba(107, 112, 92, 0.15)', // green with opacity
    borderWidth: 2,
    borderColor: '#6B705C', // green from palette
  },
  hoveredHot: {
    backgroundColor: 'rgba(107, 112, 92, 0.08)', // lighter green for hover
    borderWidth: 1,
    borderColor: '#9AAE8C', // mediumgreen
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    backgroundColor: 'rgba(47, 47, 47, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
    minWidth: 80,
  } as ViewStyle,
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500' as any,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(47, 47, 47, 0.5)', // black with opacity
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#F3E9DD', // cremit background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  // Panel lateral para escritorio
  desktopPanel: {
    position: 'absolute' as any,
    right: 0,
    top: 0,
    bottom: 0,
    maxHeight: '100%',
    width: 400,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#C9ADA1', // lightbrown
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F2F2F', // black
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B705C', // green
  },
  contentContainer: {
    gap: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9C6A5', // cremit
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4A5D23', // darkgreen
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#6B705C', // green
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F2F2F', // black
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#B7C9A6', // lightgreen
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
    color: '#2F2F2F', // black
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#6B705C', // green
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
