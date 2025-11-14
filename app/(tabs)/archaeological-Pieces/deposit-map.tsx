import React from 'react';
import { Text, View } from 'react-native';
import DepositMap from '../../../components/DepositMap';
import Navbar from '../Navbar';

export default function DepositMapScreen() {
  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar 
        title="Mapa del Depósito" 
        showBackArrow 
        backToHome={false}
        redirectTo="/(tabs)/archaeological-Pieces"
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
          <DepositMap />
        </View>
      </View>
    </View>
  );
}
