import { useLoginMutation } from "@/hooks/useUserAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function IndexScreen() {
  const [fontsLoaded] = useFonts({
    MateSC: require("../../assets/fonts/MateSC-Regular.ttf"),
    CrimsonText: require("../../assets/fonts/CrimsonText-Regular.ttf"),
    ...MaterialIcons.font,
  });

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLoginMutation();

  const handleLogin = () => {
    if (!username || !password) return;
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          router.push("/(tabs)/home"); // redirige una vez logueado correctamente
        },
      }
    );
  };

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
              className="text-[45px] font-bold text-center w-full text-[#8B5E3C]"
              style={{ fontFamily: "MateSC-Regular" }}
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
              <View className="flex-row items-center border-2 border-[#A68B5B] rounded-lg mb-2 bg-[#F7F5F2]">
                <MaterialIcons
                  name="person"
                  size={22}
                  color="#A68B5B"
                  style={{ marginRight: 6 }}
                  className="pl-2 mr-2"
                />
                <TextInput
                  placeholder="Ingresa tu usuario"
                  placeholderTextColor="#A68B5B"
                  className="flex-1 h-11 text-base text-[#222]"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View className="flex-row items-center border-2 border-[#A68B5B] rounded-lg bg-[#F7F5F2]">
                <MaterialIcons
                  name="lock"
                  size={22}
                  color="#A68B5B"
                  style={{ marginRight: 6 }}
                  className="pl-2 mr-2"
                />
                <TextInput
                  placeholder="**************"
                  placeholderTextColor="#A68B5B"
                  secureTextEntry
                  className="flex-1 h-11 text-base text-[#222] pt-1"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              disabled={loginMutation.isPending}
              className={`rounded-lg w-full py-3 mt-2 ${
                loginMutation.isPending ? "bg-[#A68B5B]" : "bg-[#6B705C]"
              }`}
              onPress={handleLogin}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className="text-white text-base text-center"
                  style={{ fontFamily: "CrimsonText-Regular" }}
                >
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>

            {loginMutation.isError && (
              <Text
                className="text-red-700 text-center mt-3"
                style={{ fontFamily: "CrimsonText-Regular" }}
              >
                {(loginMutation.error as Error).message === "Request failed with status code 401" 
                  ? "Usuario o contraseña incorrectos"
                  : (loginMutation.error as Error).message || "Error al iniciar sesión"}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
