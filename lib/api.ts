import axios from "axios";
import { queryClient } from "../lib/queryClient";
import { getToken, removeToken } from "../services/authStorage";

const API_URL = "http://192.168.0.11:8080";

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeToken();
      queryClient.setQueryData(["auth"], null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
    return Promise.reject(error);
  }
);
