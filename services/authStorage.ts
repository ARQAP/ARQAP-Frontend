import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

export const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      // En web usamos localStorage
      return localStorage.getItem(TOKEN_KEY);
    } else {
      // En mobile usamos AsyncStorage
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // En web usamos localStorage
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      // En mobile usamos AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Error setting token:", error);
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // En web usamos localStorage
      localStorage.removeItem(TOKEN_KEY);
    } else {
      // En mobile usamos AsyncStorage
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

/**
 * Limpia todo el AsyncStorage (útil para desarrollo o resetear la app)
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // En web usamos localStorage
      localStorage.clear();
    } else {
      // En mobile usamos AsyncStorage
      await AsyncStorage.clear();
    }
    console.log("AsyncStorage cleared successfully");
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};