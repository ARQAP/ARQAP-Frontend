"use client";

import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export type SimplePickerItem<T = any> = {
  value: number | string;
  label: string;
  raw?: T;
};

type Props<T = any> = {
  visible: boolean;
  title?: string;
  items: SimplePickerItem<T>[];
  selectedValue: number | string | null;
  onSelect: (value: number | string) => void;
  onClose: () => void;
  onSearchTextChange?: (text: string) => void;
};

function SimplePickerModal<T = any>({
  visible,
  title = "Seleccionar",
  items,
  selectedValue,
  onSelect,
  onClose,
  onSearchTextChange,
}: Props<T>) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => i.label.toLowerCase().includes(t));
  }, [items, q]);

  const handleClose = () => {
    if (onSearchTextChange && q.trim()) {
      onSearchTextChange(q.trim());
    }
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1, width: "100%" }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 12,
            maxHeight: "80%",
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 8 }}>
            {title}
          </Text>

          {/* Input de búsqueda con icono de lupita */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              paddingHorizontal: 8,
              marginBottom: 8,
            }}
          >
            <Feather
              name="search"
              size={18}
              color="#8B5E3C"
              style={{ marginRight: 6 }}
            />
            <TextInput
              placeholder="Buscar..."
              value={q}
              onChangeText={setQ}
              style={{
                flex: 1,
                paddingVertical: 8,
              }}
            />
          </View>

          <ScrollView style={{ maxHeight: 320 }}>
            {filtered.map((i) => {
              const selected = i.value === selectedValue;
              return (
                <TouchableOpacity
                  key={`${i.value}`}
                  onPress={() => onSelect(i.value)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: selected ? "#EADFCB" : "#fff",
                    borderWidth: 1,
                    borderColor: selected ? "#D5C5A2" : "#eee",
                    marginBottom: 8,
                  }}
                >
                  <Text>{i.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={handleClose}
            style={{ alignSelf: "flex-end", padding: 10 }}
          >
            <Text style={{ fontWeight: "600" }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ flex: 1, width: "100%" }}
          activeOpacity={1}
          onPress={handleClose}
        />
      </View>
    </Modal>
  );
}

export default SimplePickerModal;
