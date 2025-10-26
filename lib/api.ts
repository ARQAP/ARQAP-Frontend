import axios from "axios";
import { Platform } from "react-native";
import { queryClient } from "../lib/queryClient";
import { getToken, removeToken } from "../services/authStorage";

const LAN = "http://192.168.0.169:8080";   // ← poné la IP real de tu PC
const ANDROID_EMULATOR = "http://10.0.2.2:8080";
const IOS_SIMULATOR = "http://localhost:8080";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "android" ? ANDROID_EMULATOR : IOS_SIMULATOR);

// Si usás dispositivo físico: exportá EXPO_PUBLIC_API_URL=<LAN> en tu .env
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Inyecta token si existe (sin validarlo)
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend devuelve 401, limpiamos estado de auth y cache
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeToken();
      // Marcamos auth = null (los hooks reaccionan)
      queryClient.setQueryData(["auth"], null);
      // Invalidamos queries protegidas (ajustá según tus keys)
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
    return Promise.reject(error);
  }
);
