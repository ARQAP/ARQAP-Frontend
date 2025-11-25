import React from 'react';
import { Text, View } from 'react-native';
import DepositMap from '../../../components/DepositMap';
import Navbar from '../Navbar';
import Colors from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';

export default function DepositMapScreen() {
  const params = useLocalSearchParams();
  const highlightShelvesParam = params?.highlightShelves as string | undefined;
  const highlightedShelfIds = highlightShelvesParam 
    ? highlightShelvesParam.split(',').filter(Boolean)
    : [];

  // Extraer información de niveles y columnas para cada estantería
  const shelfLevelsColumns = React.useMemo(() => {
    const map: Record<string, Array<{ level: number; column: string }>> = {};
    highlightedShelfIds.forEach((shelfId) => {
      const paramValue = params?.[shelfId] as string | undefined;
      if (paramValue) {
        // Formato: "level1:column1,level2:column2,..."
        const pairs = paramValue.split(',').filter(Boolean);
        map[shelfId] = pairs.map((pair) => {
          const [level, column] = pair.split(':');
          return {
            level: Number(level),
            column: String(column).toUpperCase(),
          };
        }).filter((lc) => !Number.isNaN(lc.level) && lc.column);
      }
    });
    return map;
  }, [highlightedShelfIds, params]);

  // Extraer IDs de las piezas filtradas originalmente
  const filteredPieceIds = React.useMemo(() => {
    const idsParam = params?.filteredPieceIds as string | undefined;
    if (!idsParam) return [];
    return idsParam.split(',').filter(Boolean).map(Number).filter((id) => !Number.isNaN(id));
  }, [params?.filteredPieceIds]);

  return (
    <View className="flex-1"
    style={{ backgroundColor: Colors.cream }}
    >
      <Navbar 
        title="Mapa del Depósito" 
        showBackArrow
      />
      <View className="flex-1 px-2 sm:px-5 pt-5 pb-5">
        <Text 
          style={{ 
            fontFamily: 'MateSC-Regular', 
            color: '#3d2c13', 
            fontWeight: '700', 
            marginBottom: 8 
          }}
          className="text-center sm:text-left"
        >
          Visualice y seleccione estanterías del depósito
        </Text>

        <View className="flex-1">
          <DepositMap 
            highlightedShelfIds={highlightedShelfIds} 
            shelfLevelsColumns={shelfLevelsColumns}
            filteredPieceIds={filteredPieceIds}
          />
        </View>
      </View>
    </View>
  );
}
