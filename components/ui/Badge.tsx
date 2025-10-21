import React from 'react';
import { Text, View } from 'react-native';
import Colors from '../../constants/Colors';

export default function Badge({
  text,
  background = Colors.green,
  textColor = Colors.cremit,
}: {
  text: string;
  background?: string;
  textColor?: string;
}) {
  return (
    <View style={{ backgroundColor: background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
      <Text style={{ color: textColor, fontWeight: '700', fontFamily: 'CrimsonText-Regular' }}>{text}</Text>
    </View>
  );
}
