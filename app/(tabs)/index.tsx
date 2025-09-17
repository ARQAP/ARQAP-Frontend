import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
    CrimsonText: require("../../assets/fonts/CrimsonText-Regular.ttf"),
  });
  const router = useRouter();

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F3E9DD]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-4">
          <View className="rounded-2xl p-6 sm:p-8 w-full max-w-md items-center  bg-[#E2D1B2]">
            <Text
              className="text-[28px] sm:text-[32px] font-bold text-center text-[#8B5E3C]"
              style={{ fontFamily: "MateSC" }}
            >
              ARQAP
            </Text>
            <Text
              className="text-[18px] sm:text-[22px] text-center mb-6 text-[#8B5E3C]"
              style={{ fontFamily: "MateSC", letterSpacing: 1 }}
            >
              Museo de ciencias naturales
            </Text>
            <Text
              className="text-[16px] sm:text-[20px] text-center mb-4 text-[#A68B5B]"
              style={{ fontFamily: "CrimsonText-Regular" }}
            >
              Iniciar Sesión
            </Text>
            <View className="w-full mb-4">
              <View className="flex-row items-center border-2 border-[#A68B5B] rounded-lg mb-2 px-2 bg-[#F7F5F2]">
                <MaterialIcons
                  name="person"
                  size={22}
                  color="#A68B5B"
                  style={{ marginRight: 6 }}
                />
                <TextInput
                  placeholder="Ingresa tu usuario"
                  placeholderTextColor="#A68B5B"
                  className="flex-1 h-10 text-base text-[#222]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                />
              </View>
              <View className="flex-row items-center border-2 border-[#A68B5B] rounded-lg px-2 bg-[#F7F5F2]">
                <MaterialIcons
                  name="lock"
                  size={22}
                  color="#A68B5B"
                  style={{ marginRight: 6 }}
                />
                <TextInput
                  placeholder="**************"
                  placeholderTextColor="#A68B5B"
                  secureTextEntry
                  className="flex-1 h-10 text-base text-[#222]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                />
              </View>
            </View>
            <TouchableOpacity
              className="rounded-lg w-full py-3 mt-2 bg-[#6B705C]"
              onPress={() => router.push("/(tabs)/home")}
            >
              <Text
                className="text-white text-base text-center"
                style={{ fontFamily: "CrimsonText-Regular" }}
              >
                Iniciar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
