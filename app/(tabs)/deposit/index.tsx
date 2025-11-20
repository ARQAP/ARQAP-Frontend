import React from 'react';
import { Text, View } from 'react-native';
import DepositMap from '../../../components/DepositMap';
import Navbar from '../Navbar';

export default function Deposit() {
  return (
    <View className="flex-1 bg-[#F3E9DD]">
      <Navbar title="Mapa del depósito" backToHome />
      <View className="flex-1">
        <DepositMap />
      </View>
    </View>
  );
}
