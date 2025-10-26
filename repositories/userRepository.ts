import { apiClient } from "../lib/api";
import { removeToken, setToken } from "../services/authStorage";

export type User = { id?: number; username: string; password: string; };
export type LoginCredentials = { username: string; password: string; };
export type LoginResponse = { token: string; };

export const UserRepository = {
  getUsers: async () => {
    const { data } = await apiClient.get(`/users`);      // protegida
    return data;
  },

  createUser: async (newUser: User) => {
    const { data } = await apiClient.post(`/register`, newUser);
    return data;
  },

  deleteUser: async (id: number) => {
    const { data } = await apiClient.delete(`/users/${id}`); // protegida
    return data;
  },

  loginUser: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<LoginResponse>(`/login`, credentials);
    await setToken(data.token); // guarda token (sin validaciones extra)
    return data;
  },

  logoutUser: async () => {
    await removeToken();        // el hook se encarga de limpiar cache/estado
    return true;
  },
};
