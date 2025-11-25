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
          <DepositMap highlightedShelfIds={highlightedShelfIds} />
        </View>
      </View>
    </View>
  );
}
