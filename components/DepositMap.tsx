import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import DepositoSvg from '../Distribucion Deposito.svg';
import { apiClient } from '../lib/api';

type ShelfBox = { id: string; x: number; y: number; w: number; h: number; label?: string };

// Tomado de "Distribucion Deposito.svg": viewBox="0 0 607 678"
const VB_WIDTH = 607;
const VB_HEIGHT = 678;

const SHELVES: ShelfBox[] = [
  // Estantes izquierda (A y B)
  { id: 's_120_246', x: 120, y: 246, w: 41, h: 75, label: 'Estante A1' },
  { id: 's_120_322', x: 120, y: 322, w: 41, h: 75, label: 'Estante A2' },
  { id: 's_120_398', x: 120, y: 398, w: 41, h: 75, label: 'Estante A3' },
  { id: 's_120_190', x: 120, y: 171, w: 41, h: 75, label: 'Estante A4' },
  { id: 's_162_246', x: 162, y: 246, w: 41, h: 75, label: 'Estante B1' },
  { id: 's_162_322', x: 162, y: 322, w: 41, h: 75, label: 'Estante B2' },
  { id: 's_162_398', x: 162, y: 398, w: 41, h: 75, label: 'Estante B3' },
  { id: 's_162_190', x: 162, y: 171, w: 41, h: 75, label: 'Estante B4' },

  // Estantes centro (C y D)
  { id: 's_259_454', x: 259, y: 454, w: 41, h: 75, label: 'Estante C1' },
  { id: 's_259_378', x: 259, y: 378, w: 41, h: 75, label: 'Estante C2' },
  { id: 's_259_302', x: 259, y: 302, w: 41, h: 75, label: 'Estante C3' },
  { id: 's_259_226', x: 259, y: 226, w: 41, h: 75, label: 'Estante C4' },
  { id: 's_301_454', x: 301, y: 454, w: 41, h: 75, label: 'Estante D1' },
  { id: 's_301_378', x: 301, y: 378, w: 41, h: 75, label: 'Estante D2' },
  { id: 's_301_302', x: 301, y: 302, w: 41, h: 75, label: 'Estante D3' },
  { id: 's_301_226', x: 301, y: 226, w: 41, h: 75, label: 'Estante D4' },

  // Estantes derecha (E y F)
  { id: 's_399_467', x: 399, y: 467, w: 41, h: 75, label: 'Estante E1' },
  { id: 's_399_391', x: 399, y: 391, w: 41, h: 75, label: 'Estante E2' },
  { id: 's_399_315', x: 399, y: 315, w: 41, h: 75, label: 'Estante E3' },
  { id: 's_399_240', x: 399, y: 225, w: 41, h: 89, label: 'Estante E4' },
  { id: 's_441_467', x: 441, y: 467, w: 41, h: 75, label: 'Estante F1' },
  { id: 's_441_391', x: 441, y: 391, w: 41, h: 75, label: 'Estante F2' },
  { id: 's_441_315', x: 441, y: 315, w: 41, h: 75, label: 'Estante F3' },
  { id: 's_441_240', x: 441, y: 225, w: 41, h: 89, label: 'Estante F4' },

  // Estantes superiores (G)
  { id: 's_121_92', x: 121, y: 92.4897, w: 138, h: 49.1171, label: 'Estante G1' },
  { id: 's_259_92', x: 259, y: 92.4897, w: 138, h: 49.1171, label: 'Estante G2' },
  { id: 's_397_92', x: 397, y: 92.4897, w: 138, h: 49.1171, label: 'Estante G3' },

  // Mesas
  { id: 's_203_172', x: 120, y: 172, w: 83, h: 73, label: 'Mesa MT-1' },
  { id: 's_203_245', x: 259, y: 454, w: 83, h: 73, label: 'Mesa MT-2' },
  { id: 's_399_226', x: 399, y: 226, w: 83, h: 88, label: 'Mesa MT-3' },
];

const SHELF_ID_MAP: Record<string, number> = {
  's_120_246': 1,
  's_120_322': 2,
  's_120_398': 3,
  's_120_190': 4,
  's_162_246': 5,
  's_162_322': 6,
  's_162_398': 7,
  's_162_190': 8,
  's_259_454': 9,
  's_259_378': 10,
  's_259_302': 11,
  's_259_226': 12,
  's_301_454': 13,
  's_301_378': 14,
  's_301_302': 15,
  's_301_226': 16,
  's_399_315': 17,
  's_399_391': 18,
  's_399_467': 19,
  's_399_240': 20,
  's_441_315': 21,
  's_441_391': 22,
  's_441_467': 23,
  's_441_240': 24,
  's_121_92': 25,
  's_259_92': 26,
  's_397_92': 27,
  's_203_172': 28,
  's_203_245': 29,
  's_399_226': 30,
};

export default function DepositMap({ style }: { style?: ViewStyle }) {
  const router = useRouter();
  const [selected, setSelected] = useState<ShelfBox | null>(null);
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null);
  const [containerLayout, setContainerLayout] = useState({ width: 0, height: 0 });
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [mtSelection, setMtSelection] = useState<{ mesa: ShelfBox; shelves: ShelfBox[] } | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const isDesktop = windowWidth >= 600;

  useEffect(() => {
    // Asegurar que tenemos el ancho correcto al montar
    const currentWidth = Dimensions.get('window').width;
    if (currentWidth !== windowWidth) {
      setWindowWidth(currentWidth);
    }
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    const sub = Dimensions.addEventListener?.('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => sub?.remove?.();
  }, []);

  // Vista mobile no soportada
  if (!isDesktop && !isInitialMount) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.mobileNotSupported}>
          <Text style={styles.mobileNotSupportedIcon}>📱</Text>
          <Text style={styles.mobileNotSupportedTitle}>Vista no disponible en móviles</Text>
          <Text style={styles.mobileNotSupportedText}>
            El mapa del depósito requiere una pantalla más grande para una mejor experiencia.
            Por favor, accede desde una tablet o computadora.
          </Text>
        </View>
      </View>
    );
  }

  const fetchItemsForShelf = useCallback(async (shelf: ShelfBox) => {
    try {
      setLoading(true);
      const shelfId = SHELF_ID_MAP[shelf.id];

      if (!shelfId) {
        console.warn(`No shelf ID mapping found for ${shelf.id}. Please update SHELF_ID_MAP.`);
        setItems([]);
        return;
      }

      const res = await apiClient.get(`/artefacts?shelfId=${shelfId}`);
      const artefacts: any[] = res.data || [];

      setItems(artefacts);
    } catch (err) {
      console.warn('Error fetching artefacts', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onShelfPress = useCallback(
    (shelf: ShelfBox) => {
      if (shelf.label?.includes('Mesa MT-')) {
        const mtNumber = shelf.label.match(/MT-(\d+)/)?.[1];
        let associatedShelves: ShelfBox[] = [];

        if (mtNumber === '1') {
          associatedShelves = SHELVES.filter(
            (s) => s.label === 'Estante A4' || s.label === 'Estante B4'
          );
        } else if (mtNumber === '2') {
          associatedShelves = SHELVES.filter(
            (s) => s.label === 'Estante C1' || s.label === 'Estante D1'
          );
        } else if (mtNumber === '3') {
          associatedShelves = SHELVES.filter(
            (s) => s.label === 'Estante E4' || s.label === 'Estante F4'
          );
        }

        setMtSelection({ mesa: shelf, shelves: associatedShelves });
      } else {
        setSelected(shelf);
        fetchItemsForShelf(shelf);
      }
    },
    [fetchItemsForShelf]
  );

  const details = useMemo(() => {
    if (!items) return null;
    const count = items.length;
    const collections = Array.from(
      new Set(
        items
          .map((i: any) => (i.collection && (i.collection.name || i.collection)) || null)
          .filter(Boolean)
      )
    ).slice(0, 5);
    const archaeologists = Array.from(
      new Set(
        items
          .map((i: any) => {
            const arch = i.archaeologist;
            if (!arch) return null;
            return arch.name || [arch.firstname, arch.lastname].filter(Boolean).join(' ');
          })
          .filter(Boolean)
      )
    ).slice(0, 5);
    return { count, collections, archaeologists };
  }, [items]);

  const svgAspect = VB_WIDTH / VB_HEIGHT;
  const containerAspect = containerLayout.width / Math.max(1, containerLayout.height);
  const initialHeight = 950;

  let svgWidth, svgHeight, offsetX, offsetY;
  if (containerAspect > svgAspect) {
    svgHeight = containerLayout.height || initialHeight;
    svgWidth = svgHeight * svgAspect;
    offsetX = (containerLayout.width - svgWidth) / 2;
    offsetY = 0;
  } else {
    svgWidth = containerLayout.width || windowWidth;
    svgHeight = svgWidth / svgAspect;
    offsetX = 0;
    offsetY = ((containerLayout.height || initialHeight) - svgHeight) / 2;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentWrapper}>
        {/* Mapa SVG */}
        <View
          style={styles.mapContainer}
          onLayout={(e) => setContainerLayout(e.nativeEvent.layout)}
        >
          <DepositoSvg
            width={containerLayout.width || windowWidth}
            height={containerLayout.height || initialHeight}
            viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Overlay hotspots */}
          {containerLayout.width > 0 &&
            SHELVES.map((s) => {
              const left = offsetX + (s.x / VB_WIDTH) * svgWidth;
              const top = offsetY + (s.y / VB_HEIGHT) * svgHeight;
              const width = (s.w / VB_WIDTH) * svgWidth;
              const height = (s.h / VB_HEIGHT) * svgHeight;
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
                    { left, top, width, height },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                  android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
                >
                  <View
                    style={[
                      styles.hotInner,
                      isSelected
                        ? styles.selectedHot
                        : isHovered
                        ? styles.hoveredHot
                        : undefined,
                    ]}
                  />
                  {isHovered && Platform.OS === 'web' && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>{s.label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
        </View>

        {/* Panel lateral desktop */}
        {isDesktop && (
          <View style={styles.sidePanel}>
            <ScrollView
              style={styles.sidePanelScroll}
              contentContainerStyle={styles.sidePanelContent}
              showsVerticalScrollIndicator={false}
            >
              {!selected ? (
                <View style={styles.placeholder}>
                  <View style={styles.placeholderIconContainer}>
                    <View style={styles.placeholderIconCircle}>
                      <Text style={styles.placeholderEmoji}>🗺️</Text>
                    </View>
                  </View>
                  <Text style={styles.placeholderTitle}>Información del depósito</Text>
                  <Text style={styles.placeholderSubtitle}>Selecciona una ubicación</Text>
                  <Text style={styles.placeholderText}>
                    Haz clic en cualquier estantería o mesa del mapa para ver su contenido y estadísticas.
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.panelTitle}>{selected.label ?? 'Estantería'}</Text>

                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Cargando información...</Text>
                    </View>
                  ) : details ? (
                    <>
                      <View style={styles.statsCard}>
                        <Text style={styles.statsNumber}>{details.count}</Text>
                        <Text style={styles.statsLabel}>PIEZAS ARQUEOLÓGICAS</Text>
                      </View>

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
                        style={styles.primaryButton}
                        onPress={() => {
                          if (!selected) return;
                          const shelfId = SHELF_ID_MAP[selected.id];
                          const params: any = {};
                          if (shelfId !== undefined && shelfId !== null)
                            params.shelfId = Number(shelfId);
                          if (selected.label) params.shelfLabel = selected.label;
                          router.push({
                            pathname: '/(tabs)/archaeological-Pieces/View_pieces',
                            params,
                          });
                        }}
                      >
                        <Text style={styles.primaryButtonText}>Ver piezas</Text>
                      </Pressable>

                      <Pressable
                        style={styles.secondaryButton}
                        onPress={() => {
                          if (!selected) return;
                          const shelfId = SHELF_ID_MAP[selected.id];
                          const params: any = {};
                          if (shelfId !== undefined && shelfId !== null)
                            params.shelfId = Number(shelfId);
                          if (selected.label) params.shelfLabel = selected.label;
                          router.push({
                            pathname: '/(tabs)/archaeological-Pieces/shelf-detail',
                            params,
                          });
                        }}
                      >
                        <Text style={styles.secondaryButtonText}>Ver detalle de estantería</Text>
                      </Pressable>
                    </>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Modal de selección para Mesas de Trabajo */}
      <Modal
        visible={!!mtSelection}
        transparent
        animationType="fade"
        onRequestClose={() => setMtSelection(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMtSelection(null)}
        >
          <Pressable
            style={styles.mtModal}
            onPress={(e) => e.stopPropagation()}
          >

            <Text style={styles.mtTitle}>{mtSelection?.mesa.label ?? 'Mesa de Trabajo'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.mtScrollContent}>
                <Text style={styles.mtSectionTitle}>Seleccione una ubicación:</Text>

                <Pressable
                  style={styles.mtOptionButton}
                  onPress={() => {
                    if (mtSelection?.mesa) {
                      setSelected(mtSelection.mesa);
                      fetchItemsForShelf(mtSelection.mesa);
                      setMtSelection(null);
                    }
                  }}
                >
                  <Text style={styles.mtOptionText}>{mtSelection?.mesa.label}</Text>
                </Pressable>

                {mtSelection?.shelves.map((shelf) => (
                  <Pressable
                    key={shelf.id}
                    style={[styles.mtOptionButton, styles.mtShelfButton]}
                    onPress={() => {
                      setSelected(shelf);
                      fetchItemsForShelf(shelf);
                      setMtSelection(null);
                    }}
                  >
                    <Text style={styles.mtOptionText}>{shelf.label}</Text>
                  </Pressable>
                ))}

                <Pressable style={styles.mtCancelButton} onPress={() => setMtSelection(null)}>
                  <Text style={styles.mtCancelText}>Cancelar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FAFAF9',
  },
  mobileNotSupported: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FAF8F6',
  },
  mobileNotSupportedIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  mobileNotSupportedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 12,
  },
  mobileNotSupportedText: {
    fontSize: 16,
    color: '#6B705C',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },

  // Hint flotante sobre el mapa
  mapHint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mapHintCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(231, 223, 213, 0.8)',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#4A5D23',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  mapHintIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  mapHintTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2F2F2F',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  mapHintText: {
    fontSize: 14,
    color: '#6B705C',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },

  // Panel lateral desktop
  sidePanel: {
    width: 360,
    backgroundColor: '#FAF8F6',
    borderLeftWidth: 1,
    borderLeftColor: '#E7DFD5',
  },
  sidePanelScroll: {
    flex: 1,
  },
  sidePanelContent: {
    padding: 28,
  },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  placeholderIconContainer: {
    marginBottom: 28,
  },
  placeholderIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E7DFD5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A5D23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F2F2F',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  placeholderSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B705C',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#8A8A7E',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },

  panelTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B705C',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7DFD5',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 52,
    fontWeight: '700',
    color: '#4A5D23',
    marginBottom: 6,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B705C',
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2F2F',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#B7C9A6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    color: '#2F2F2F',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4A5D23',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
    shadowColor: '#4A5D23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D9C6A5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2F2F2F',
    fontSize: 15,
    fontWeight: '600',
  },

  // Hotspots
  hotspot: {
    position: 'absolute',
    overflow: 'visible',
    borderRadius: 6,
  },
  hotInner: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 6,
  },
  selectedHot: {
    backgroundColor: 'rgba(74, 93, 35, 0.4)',
    borderWidth: 2.5,
    borderColor: '#4A5D23',
  },
  hoveredHot: {
    backgroundColor: 'rgba(74, 93, 35, 0.2)',
    borderWidth: 2,
    borderColor: '#9AAE8C',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginLeft: -50,
    backgroundColor: 'rgba(47, 47, 47, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 6,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  } as ViewStyle,
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as any,
    textAlign: 'center',
  },

  // Modal MT
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(47, 47, 47, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mtModal: {
    backgroundColor: '#FAF8F6',
    borderRadius: 24,
    width: 420,
    maxHeight: '80%',
    padding: 24,
  },
  mtTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  mtScrollContent: {
    gap: 12,
  },
  mtSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2F2F',
    marginBottom: 8,
  },
  mtOptionButton: {
    backgroundColor: '#4A5D23',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A5D23',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mtShelfButton: {
    backgroundColor: '#6B705C',
  },
  mtOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mtCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D9C6A5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  mtCancelText: {
    color: '#2F2F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});
