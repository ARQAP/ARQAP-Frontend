import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, G, Rect, Text as SvgText } from 'react-native-svg';
import Colors from '../constants/Colors';
import { ArtefactSummary } from '../repositories/artefactRepository';

type SlotId = string;

type ShelfDetailViewProps = {
  shelfName: string;
  shelfId: number;
  levels: number;
  columns: number;
  onSlotClick?: (slotId: SlotId) => void;
  onClose?: () => void;
  initialSelectedSlot?: SlotId | null;
  filteredPieces?: ArtefactSummary[];
  onViewPieces?: () => void;
};

const ShelfDetailView: React.FC<ShelfDetailViewProps> = ({
  shelfName,
  levels,
  columns,
  onSlotClick,
  onClose,
  initialSelectedSlot,
  filteredPieces = [],
  onViewPieces,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<SlotId | null>(initialSelectedSlot ?? null);
  
  // Sincronizar con initialSelectedSlot cuando cambie
  useEffect(() => {
    setSelectedSlot(initialSelectedSlot ?? null);
  }, [initialSelectedSlot]);
  
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  
  // Usamos 1024px como punto de quiebre para activar el diseño "Dashboard"
  // Menos de eso, usa tu diseño original (Mobile/Tablet vertical)
  const isDesktop = windowWidth >= 1024;
  
  // Variable auxiliar para ajustar fuentes dentro del SVG (mantiene tu lógica original)
  // Tu código original usaba 768 para definir tamaños de fuente, mantenemos eso para la consistencia interna del SVG
  const isLargeScreen = windowWidth >= 768; 

  // --- LÓGICA MATEMÁTICA (Idéntica a tu original) ---
  const svgWidth = 360;
  const svgHeight = 230;
  const padding = 20;

  const usableWidth = svgWidth - padding * 2;
  const usableHeight = svgHeight - padding * 2;

  const headerHeight = 24; 
  const sideLabelWidth = 26; 

  const gridWidth = usableWidth - sideLabelWidth - 8;
  const gridHeight = usableHeight - headerHeight - 8;

  const safeLevels = Math.max(levels, 1);
  const safeColumns = Math.max(columns, 1);

  const levelHeight = gridHeight / safeLevels;
  const slotWidth = gridWidth / safeColumns;

  const gridOriginX = padding + sideLabelWidth + 4;
  const gridOriginY = padding + headerHeight + 4;

  const colLabelFontSize = isLargeScreen ? 11 : 12;
  const rowLabelFontSize = isLargeScreen ? 11 : 12;
  const headerTagFontSize = isLargeScreen ? 9 : 10;

  const slots = useMemo(
    () =>
      Array.from({ length: levels }).flatMap((_, levelIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => {
          const uiLevel = levelIndex + 1; 
          const uiCol = colIndex + 1; 
          const colLetter = String.fromCharCode(64 + uiCol);
          const id = `L${uiLevel}-C${colLetter}`;

          const x = gridOriginX + colIndex * slotWidth;
          const y = gridOriginY + levelIndex * levelHeight;

          return { id, uiLevel, uiCol, x, y };
        }),
      ),
    [levels, columns, slotWidth, levelHeight, gridOriginX, gridOriginY],
  );

  const handleSlotClick = (slotId: SlotId) => {
    setSelectedSlot(slotId);
    // Llamar al callback si está definido (ahora solo actualiza selección, no navega)
    onSlotClick?.(slotId);
  };

  const selectedSlotInfo = useMemo(() => {
    if (!selectedSlot) return null;
    const match = selectedSlot.match(/L(\d+)-C(.+)/);
    if (!match) return null;
    const [, level, columnPart] = match;
    return { level: Number(level), column: String(columnPart).toUpperCase() };
  }, [selectedSlot]);

  const outerStroke = 1.2;

  // --- RENDERIZADO DEL SVG (Extraído para usar en ambas vistas) ---
  const renderSvgContent = () => (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <Defs>
        <ClipPath id="gridRoundedClip">
          <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} rx={12} />
        </ClipPath>
      </Defs>

      {/* Fondo general */}
      <Rect
        x={outerStroke / 2} y={outerStroke / 2}
        width={svgWidth - outerStroke} height={svgHeight - outerStroke}
        fill={Colors.cream} rx={24} stroke={Colors.cremit} strokeWidth={outerStroke}
      />

      {/* Contenedor principal */}
      <Rect
        x={padding - 6} y={padding - 4}
        width={usableWidth + 12} height={usableHeight + 8}
        fill="#ffffff" rx={18} stroke={Colors.cremit} strokeWidth={1}
      />

      {/* Cabecera de columnas (A, B, C ...) */}
      {Array.from({ length: columns }).map((_, colIndex) => {
        const colNumber = colIndex + 1;
        const colLetter = String.fromCharCode(64 + colNumber); // 1 -> A
        const colCenterX = gridOriginX + colIndex * slotWidth + slotWidth / 2;
        return (
          <SvgText key={`col-label-${colLetter}`} x={colCenterX} y={padding + headerHeight - 6} textAnchor="middle" fontSize={colLabelFontSize} fontWeight="600" fill={Colors.brown}>
            {colLetter}
          </SvgText>
        );
      })}

      <SvgText x={padding + sideLabelWidth / 2} y={padding + headerHeight - 6} textAnchor="middle" fontSize={headerTagFontSize} fontWeight="600" fill={Colors.brown}>N</SvgText>

      {/* Labels de niveles */}
      {Array.from({ length: levels }).map((_, levelIndex) => {
        const levelNumber = levelIndex + 1;
        const rowCenterY = gridOriginY + levelIndex * levelHeight + levelHeight / 2;
        return (
          <SvgText key={`row-label-${levelNumber}`} x={padding + sideLabelWidth / 2} y={rowCenterY + 3} textAnchor="middle" fontSize={rowLabelFontSize} fontWeight="600" fill={Colors.brown}>
            {levelNumber}
          </SvgText>
        );
      })}

      <G clipPath="url(#gridRoundedClip)">
        <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} fill={Colors.cream} opacity={0.65} />
        
        {/* Grilla */}
        {Array.from({ length: levels }).map((_, levelIndex) =>
          Array.from({ length: columns }).map((_, colIndex) => (
            <Rect key={`cell-${levelIndex}-${colIndex}`} x={gridOriginX + colIndex * slotWidth} y={gridOriginY + levelIndex * levelHeight} width={slotWidth} height={levelHeight} fill="transparent" stroke={Colors.cremit} strokeWidth={0.9} />
          ))
        )}

        {/* Slots */}
        {slots.map(({ id, uiLevel, uiCol, x, y }) => {
          const selected = selectedSlot === id;
          const fill = selected ? Colors.darkgreen : '#ffffff';
          const stroke = selected ? Colors.green : Colors.cremit;
          const labelColor = selected ? '#ffffff' : Colors.brown;
          
          const gapX = slotWidth * 0.12;
          const gapY = levelHeight * 0.18;
          const slotX = x + gapX;
          const slotY = y + gapY;
          const slotW = slotWidth - gapX * 2;
          const slotH = levelHeight - gapY * 2;

          // Tu lógica original de fuentes
          const slotLabelFontSize = selected
            ? isLargeScreen ? 13 : 14
            : isLargeScreen ? 11.5 : 12.5;

          const textX = !isLargeScreen ? slotX + slotW / 2.5 : slotX + slotW / 2;
          const textOffsetY = Platform.OS === 'ios' ? 5 : (!isLargeScreen ? 3.5 : slotLabelFontSize * 0.35);
          const textY = slotY + slotH / 2 + textOffsetY;
          const colLetter = String.fromCharCode(64 + uiCol);

          return (
            <G key={id} onPress={() => handleSlotClick(id)} style={Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined}>
              <Rect x={slotX + 1.2} y={slotY + 1.6} width={slotW} height={slotH} fill="#000" opacity={0.05} rx={10} />
              <Rect x={slotX} y={slotY} width={slotW} height={slotH} fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1.4} rx={10} />
              <SvgText x={textX} y={textY} textAnchor="middle" fontSize={slotLabelFontSize} fontWeight={selected ? '700' : '600'} fill={labelColor}>
                {uiLevel}-{colLetter}
              </SvgText>
            </G>
          );
        })}
      </G>
      <Rect x={gridOriginX} y={gridOriginY} width={gridWidth} height={gridHeight} rx={12} fill="none" stroke={Colors.cremit} strokeWidth={1.2} pointerEvents="none" />
    </Svg>
  );

  // ==========================================
  // VISTA DESKTOP
  // ==========================================
  if (isDesktop) {
    return (
      <View className="flex-1 items-center justify-center p-8" style={{ backgroundColor: '#f3e9dd' }}>
        {onClose && (
          <Pressable onPress={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm z-50 hover:bg-gray-100">
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
        )}

        <View 
          className="flex-row bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/50"
          style={{ width: '90%', maxWidth: 1200, height: Math.min(750, windowHeight * 0.85) }}
        >
          {/* Panel Izquierdo: Mapa */}
          <View className="flex-[1.8] bg-[#FDFCF8] items-center justify-center p-10 border-r border-gray-100 relative">
             <View className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             <Text className="absolute top-8 left-8 text-xs font-bold uppercase text-gray-400 tracking-widest">Vista de Estante</Text>
             <View className="w-full h-full max-w-[600px] aspect-[4/3]">
                {renderSvgContent()}
             </View>
          </View>

          {/* Panel Derecho: Info */}
          <View className="flex-1 p-8 bg-white flex-col h-full">
            <View>
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-8 h-8 rounded-lg items-center justify-center bg-green-50">
                  <Ionicons name="cube" size={16} color={Colors.darkgreen} />
                </View>
                <Text className="text-xs font-bold uppercase tracking-wider text-gray-500">Inventario</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-6">{shelfName}</Text>

              <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                   <Text className="text-2xl font-bold text-gray-800">{levels}</Text>
                   <Text className="text-[10px] font-bold uppercase text-gray-400">Niveles</Text>
                </View>
                <View className="flex-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                   <Text className="text-2xl font-bold text-gray-800">{columns}</Text>
                   <Text className="text-[10px] font-bold uppercase text-gray-400">Columnas</Text>
                </View>
              </View>
            </View>
            
            <View className="h-px bg-gray-100 w-full my-2" />

            <View className="flex-1 py-4">
              {selectedSlotInfo ? (
                <View className="bg-white border-2 border-green-600 rounded-2xl p-5 shadow-sm flex-1 flex-col">
                   <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text className="text-xs font-bold uppercase text-green-700 mb-1">Posición Seleccionada</Text>
                        <Text className="text-2xl font-bold text-gray-900">{selectedSlotInfo.level}-{selectedSlotInfo.column}</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.darkgreen} />
                   </View>
                   
                   {/* Lista de piezas */}
                   <View className="flex-1 mt-3 mb-3">
                     <Text className="text-xs font-bold uppercase text-gray-500 mb-2">
                       Piezas ({filteredPieces.length})
                     </Text>
                     {filteredPieces.length > 0 ? (
                       <FlatList
                         data={filteredPieces}
                         keyExtractor={(item) => String(item.id)}
                         renderItem={({ item }) => (
                           <View className="bg-gray-50 rounded-lg p-2.5 mb-2 border border-gray-200">
                             <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                               {item.name}
                             </Text>
                             <Text className="text-xs text-gray-600 mt-0.5" numberOfLines={1}>
                               {item.material}
                               {item.collectionName && ` · ${item.collectionName}`}
                             </Text>
                           </View>
                         )}
                         scrollEnabled={true}
                         showsVerticalScrollIndicator={false}
                         style={{ maxHeight: 200 }}
                       />
                     ) : (
                       <View className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
                         <Text className="text-xs text-gray-500 text-center">
                           No hay piezas en esta posición
                         </Text>
                       </View>
                     )}
                   </View>

                   <Pressable
                      className="flex-row items-center justify-center gap-2 bg-[#4A5D23] py-3.5 px-4 rounded-xl shadow-md hover:bg-[#3a491b] active:scale-95 transition-all"
                      onPress={onViewPieces}
                    >
                      <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
                      <Text className="text-white text-base font-bold">Ver Piezas</Text>
                    </Pressable>
                </View>
              ) : (
                <View className="items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  <Ionicons name="hand-left-outline" size={32} color="#9CA3AF" />
                  <Text className="text-gray-400 font-medium text-center mt-3">Selecciona un espacio</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ==========================================
  // VISTA MOBILE
  // ==========================================
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.cream }}>
      {/* Header Original */}
      <View className="px-6 pt-5 pb-4 border-b bg-white" style={{ borderBottomColor: Colors.cremit }}>
        <Text className="text-[11px] font-semibold uppercase mb-1 tracking-widest" style={{ color: Colors.brown }}>
          Vista Detallada
        </Text>
        <Text className="text-2xl font-bold" style={{ color: Colors.black }}>
          {shelfName}
        </Text>
      </View>

      {/* Botón de cierre flotante Original */}
      {onClose && (
        <Pressable
          onPress={onClose}
          className={`absolute right-7 w-11 h-11 rounded-full items-center justify-center z-10 border-[1.5px] bg-white shadow-lg active:scale-95 ${
            Platform.OS === 'android' ? 'top-16' : 'top-20'
          }`}
          style={({ pressed }) => ({
            borderColor: Colors.cremit,
            backgroundColor: pressed ? Colors.cremitLight : '#ffffff',
          })}
        >
          <Text className="text-[22px] font-bold" style={{ color: Colors.black }}>✕</Text>
        </Pressable>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 32, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className={`w-full max-w-[1180px] flex-col gap-5 ${
            isLargeScreen ? 'md:flex-row md:gap-6 md:items-stretch' : 'items-center'
          }`}
        >
          {/* Contenedor SVG Original */}
          <View
            className="bg-white rounded-2xl p-[18px]"
            style={{
              borderWidth: 1,
              borderColor: Colors.cremit,
              minHeight: isLargeScreen ? 260 : 320,
              maxHeight: isLargeScreen ? 420 : undefined,
              height: isLargeScreen ? 420 : 320,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 9,
              elevation: 3,
              width: isLargeScreen ? '65%' : '100%',
            }}
          >
            <Text className="text-xs font-semibold uppercase text-center mb-3 tracking-wide" style={{ color: Colors.brown }}>
              Mapa de estantería
            </Text>
            <View className="flex-1 items-center justify-center">
              {/* Aquí inyectamos el SVG extraído, que se adapta al contenedor */}
              {renderSvgContent()}
            </View>
          </View>

          {/* Panel derecho Original */}
          <View
            className="gap-4 mt-1"
            style={{
              width: isLargeScreen ? '33%' : '100%',
              maxWidth: 340,
            }}
          >
            {/* Resumen estantería */}
            <View className="bg-white rounded-2xl p-[18px] border shadow-sm" style={{ borderColor: Colors.cremit }}>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: Colors.cream }}>
                    <Ionicons name="cube" size={18} color={Colors.darkgreen} />
                  </View>
                  <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color: Colors.brown }}>
                    Vista detallada
                  </Text>
                </View>
                <Text className="text-xl font-extrabold" style={{ color: Colors.darkgreen }}>
                  {shelfName}
                </Text>
              </View>

              <View className="flex-row items-center rounded-xl py-[14px] px-[10px]" style={{ backgroundColor: Colors.cream }}>
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-extrabold mb-0.5" style={{ color: Colors.darkgreen }}>{levels}</Text>
                  <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: Colors.green }}>Niveles</Text>
                </View>
                <View className="w-px h-9" style={{ backgroundColor: Colors.cremit }} />
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-extrabold mb-0.5" style={{ color: Colors.darkgreen }}>{columns}</Text>
                  <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: Colors.green }}>Columnas</Text>
                </View>
              </View>
            </View>

            {/* Posición seleccionada */}
            <View
              className="rounded-2xl p-[18px] shadow-sm"
              style={{
                borderWidth: selectedSlotInfo ? 2 : 1,
                borderColor: selectedSlotInfo ? Colors.darkgreen : Colors.cremit,
                backgroundColor: selectedSlotInfo ? '#F7F1E7' : '#ffffff',
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: selectedSlotInfo ? Colors.darkgreen : Colors.cream }}>
                    <Ionicons name={selectedSlotInfo ? 'location' : 'hand-left-outline'} size={18} color={selectedSlotInfo ? '#FFFFFF' : Colors.brown} />
                  </View>
                  <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color: Colors.brown }}>
                    {selectedSlotInfo ? 'Posición activa' : 'Selecciona'}
                  </Text>
                </View>
                {selectedSlotInfo && (
                  <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: Colors.darkgreen }}>
                    <Text className="text-sm font-bold text-white">Nivel {selectedSlotInfo.level} · Col {selectedSlotInfo.column}</Text>
                  </View>
                )}
              </View>

              {selectedSlotInfo ? (
                <>
                  {/* Lista de piezas */}
                  <View className="mt-2 mb-3">
                    <Text className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: Colors.brown }}>
                      Piezas ({filteredPieces.length})
                    </Text>
                    {filteredPieces.length > 0 ? (
                      <FlatList
                        data={filteredPieces}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                          <View className="bg-gray-50 rounded-lg p-2.5 mb-2 border border-gray-200">
                            <Text className="text-xs font-semibold text-gray-900" numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text className="text-[10px] text-gray-600 mt-0.5" numberOfLines={1}>
                              {item.material}
                              {item.collectionName && ` · ${item.collectionName}`}
                            </Text>
                          </View>
                        )}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: 150 }}
                      />
                    ) : (
                      <View className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300">
                        <Text className="text-[10px] text-gray-500 text-center">
                          No hay piezas en esta posición
                        </Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    className="flex-row items-center justify-center gap-2 bg-[#4A5D23] py-3 px-4 rounded-full my-2.5 shadow-lg active:scale-[0.98] active:bg-[#656e55]"
                    onPress={onViewPieces}
                  >
                    <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                    <Text className="text-white text-[15px] font-bold">Ver piezas</Text>
                  </Pressable>
                </>
              ) : (
                <Text className="text-sm text-center py-2 leading-[21px]" style={{ color: Colors.green }}>
                  Toca un espacio en la estantería para ver sus detalles y las piezas almacenadas.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShelfDetailView;