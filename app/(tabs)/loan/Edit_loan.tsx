import { useAllLoans, useUpdateLoan } from "@/hooks/useloan";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Button from "../../../components/ui/Button";
import Navbar from "../Navbar";

export default function EditLoan() {
  const router = useRouter();
  const params = useLocalSearchParams() as any;
  const { id } = params || {};

  const { data: loans } = useAllLoans();
  const updateMutation = useUpdateLoan();

  const found = useMemo(() => {
    return (loans || []).find((l: any) => String(l.id) === String(id)) || null;
  }, [loans, id]);

  const [loan, setLoan] = useState<any>(found);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
        input.click();
      });

      if (date) {
        setSelectedDate(date);
        setLoan({ ...loan, FechaPrestamo: date.toISOString() });
      }
    } else {
      setIsDatePickerVisible(true);
    }
  };

  React.useEffect(() => setLoan(found), [found]);
  React.useEffect(() => {
    if (found && found.FechaPrestamo) {
      try {
        setSelectedDate(new Date(found.FechaPrestamo));
      } catch (e) {
        setSelectedDate(null);
      }
    }
  }, [found]);

  const handleSave = async () => {
    if (!loan) return;
    try {
      await updateMutation.mutateAsync({
        id: Number(id),
        payload: loan,
      } as any);
      Alert.alert("Guardado", "Los cambios fueron guardados.", [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "/(tabs)/loan/View_detail_loan",
              params: { id },
            }),
        },
      ]);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el préstamo.");
    }
  };

  if (!loan) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5ECD6" }}>
      <Navbar title="Editar Prestamo" showBackArrow />
      <View
        style={{
          width: "90%",
          maxWidth: 700,
          alignSelf: "center",
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            marginBottom: 12,
            color: "#222",
            fontFamily: "CrimsonText-Regular",
          }}
        >
          Editar información del préstamo
        </Text>

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
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
            value={
              selectedDate
                ? formatDate(selectedDate)
                : String(loan.FechaPrestamo ?? "")
            }
            onFocus={() => openDatePicker()}
            onChangeText={(t) => setLoan({ ...loan, FechaPrestamo: t })}
            style={{
              backgroundColor: "#E2D3B3",
              padding: 8,
              borderRadius: 6,
              marginBottom: 8,
              flex: 1,
            }}
          />
        </View>

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Hora de Prestamo
        </Text>
        <TextInput
          value={loan.HoraPrestamo}
          onChangeText={(t) => setLoan({ ...loan, HoraPrestamo: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Fecha Fin de Prestamo
        </Text>
        <TextInput
          value={loan.FechaDevolucion}
          onChangeText={(t) => setLoan({ ...loan, FechaDevolucion: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>
          Hora Fin de Prestamo
        </Text>
        <TextInput
          value={loan.HoraDevolucion}
          onChangeText={(t) => setLoan({ ...loan, HoraDevolucion: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Solicitante</Text>
        <TextInput
          value={loan.Solicitante}
          onChangeText={(t) => setLoan({ ...loan, Solicitante: t })}
          style={{
            backgroundColor: "#E2D3B3",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
          }}
        />

        <Button
          title="GUARDAR"
          className="bg-[#6B705C] rounded-lg py-3 items-center mb-2 w-full"
          textClassName="text-white text-[16px]"
          onPress={handleSave}
        />
        <Button
          title="CANCELAR"
          className="bg-[#E2D3B3] rounded-lg py-3 items-center w-full"
          textClassName="text-[#222] text-[16px]"
          onPress={() => router.back()}
        />
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date: Date) => {
          setSelectedDate(date);
          setLoan({ ...loan, FechaPrestamo: date.toISOString() });
          setIsDatePickerVisible(false);
        }}
        onCancel={() => setIsDatePickerVisible(false)}
      />
    </View>
  );
}

function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
