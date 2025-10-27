import { useCreateLoan } from "@/hooks/useloan";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function NewLoan() {
  const piezas = ["Pieza 1", "Pieza 2", "Pieza 3", "Pieza 4"];
  const solicitantes = [
    "Alta de nuevo Solicitante",
    "Departamento 10",
    "Exhibición 10/07/2024",
    "Horacio Rodriguez",
  ];
  const [piezasSeleccionadas, setPiezasSeleccionadas] = useState<string[]>([]);
  const [solicitantesSeleccionados, setSolicitantesSeleccionados] = useState<
    string[]
  >([]);
  const [filtroPieza, setFiltroPieza] = useState("");
  const [filtroSolicitante, setFiltroSolicitante] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Open native picker on mobile, fallback to browser <input type="date"> on web
  const openDatePicker = async () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const date = await new Promise<Date | null>((resolve) => {
        const input = document.createElement("input");
        input.type = "date";
        input.style.position = "absolute";
        input.style.opacity = "0";
        input.style.pointerEvents = "none";
        document.body.appendChild(input);
        input.focus();
        input.onchange = () => {
          const val = input.value; // YYYY-MM-DD
          if (val) {
            const [y, m, d] = val.split("-");
            const dt = new Date(Number(y), Number(m) - 1, Number(d));
            resolve(dt);
          } else {
            resolve(null);
          }
          setTimeout(() => document.body.removeChild(input), 0);
        };
        input.onblur = () => {
          resolve(null);
          if (document.body.contains(input)) document.body.removeChild(input);
        };
        // trigger the picker
        input.click();
      });

      if (date) setSelectedDate(date);
    } else {
      setIsDatePickerVisible(true);
    }
  };

  const { width } = useWindowDimensions();
  const isNarrow = width < 700;
  const router = useRouter();
  const createMutation = useCreateLoan();

  const toggleSeleccion = (
    arr: string[],
    setArr: (a: string[]) => void,
    value: string
  ) => {
    if (arr.includes(value)) {
      setArr(arr.filter((v) => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };
  return (
    <ScrollView
      className="flex-1 bg-[#F3E9DD]"
      contentContainerStyle={{ alignItems: "center" }}
    >
      <Navbar title="Nuevo Prestamo" showBackArrow />
      <View
        className="w-[90%] max-w-[700px] items-center self-center"
        style={{ padding: 12 }}
      >
        <Text
          className="text-center text-[18px] mb-4 text-[#222]"
          style={{ fontFamily: "CrimsonText-Regular" }}
        >
          Registra un nuevo prestamo de piezas
        </Text>

        <View
          style={{
            width: "100%",
            flexDirection: isNarrow ? "column" : "row",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Asociar Pieza a un Prestamo
            </Text>
            <View className="w-full">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                  placeholder="Filtrar piezas..."
                  placeholderTextColor="#A68B5B"
                  value={filtroPieza}
                  onChangeText={setFiltroPieza}
                  style={{ fontFamily: "MateSC-Regular" }}
                />
                <TouchableOpacity style={{ marginLeft: 8 }}>
                  <FontAwesome name="search" size={18} color="#8B5E3C" />
                </TouchableOpacity>
              </View>
              <View className="h-36 bg-[#E2D3B3] rounded-lg mt-3 p-2" />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Asociar Pieza a un Solicitante
            </Text>
            <View className="w-full">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                  placeholder="Filtrar solicitantes..."
                  placeholderTextColor="#A68B5B"
                  value={filtroSolicitante}
                  onChangeText={setFiltroSolicitante}
                  style={{ fontFamily: "MateSC-Regular" }}
                />
                <TouchableOpacity style={{ marginLeft: 8 }}>
                  <FontAwesome name="search" size={18} color="#8B5E3C" />
                </TouchableOpacity>
              </View>
              <View className="h-36 bg-[#E2D3B3] rounded-lg mt-3 p-2" />
            </View>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: isNarrow ? "column" : "row",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1, marginRight: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Fecha de Prestamo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => openDatePicker()}>
                <FontAwesome
                  name="calendar"
                  size={20}
                  color="#222"
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
              <TextInput
                className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#A68B5B"
                value={selectedDate ? formatDate(selectedDate) : ""}
                onFocus={() => openDatePicker()}
                style={{ fontFamily: "MateSC-Regular" }}
              />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: isNarrow ? 0 : 8 }}>
            <Text
              className="text-[16px] font-bold mb-2 text-[#3d2c13]"
              style={{ fontFamily: "MateSC-Regular" }}
            >
              Hora de Prestamo
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="clock-o"
                size={20}
                color="#222"
                style={{ marginRight: 8 }}
              />
              <TextInput
                className="flex-1 rounded-lg p-2 bg-[#F7F5F2] text-[16px]"
                placeholder="--:--"
                placeholderTextColor="#A68B5B"
                style={{ fontFamily: "MateSC-Regular" }}
              />
            </View>
          </View>
        </View>

        <View className="w-full">
          <Button
            title="CREAR PRESTAMO"
            className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
            textClassName="text-white text-[16px]"
            onPress={async () => {
              try {
                await createMutation.mutateAsync({
                  FechaPrestamo: (selectedDate || new Date()).toISOString(),
                  HoraPrestamo: "--:--",
                } as any);
                router.push("/(tabs)/loan/View_loan");
              } catch (e) {
                alert("Error al crear el préstamo");
              }
            }}
          />
          <Button
            title="CANCELAR"
            className="bg-[#E2D3B3] rounded-lg py-3 items-center w-full"
            textClassName="text-[#222] text-[16px]"
            onPress={() => router.push("/(tabs)/loan/View_loan")}
          />
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          setSelectedDate(date);
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </ScrollView>
  );
}

function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
