import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';

type Props = {
  title: string;
  excerpt: string;
  onView?: () => void;
};

export default function MentionCard({ title, excerpt, onView }: Props) {
  return (
    <View style={{ backgroundColor: '#EADFCB', borderRadius: 10, padding: 12, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'MateSC-Regular', color: Colors.black, fontWeight: '700' }}>{title}</Text>
        <TouchableOpacity onPress={onView} style={{ backgroundColor: Colors.green, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: Colors.cremit, fontFamily: 'CrimsonText-Regular' }}>VER</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop: 8, fontFamily: 'CrimsonText-Regular', color: Colors.black }}>{excerpt}</Text>
    </View>
  );
}
