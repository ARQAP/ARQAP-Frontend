import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserRepository } from "../repositories/userRepository";
import { getToken, removeToken, setToken } from "../services/authStorage";

// Claves de TanStack Query
const USERS_QUERY_KEY = ["users"];
const AUTH_KEY = ["auth"];

const getErrorMessage = (error: any) => {
    return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
    );
};

export const useLoginMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserRepository.loginUser,
        onSuccess: async (data) => {
            // Guardar el token
            if (data.token) {
                await setToken(data.token);
                // Actualizar el cache de autenticación inmediatamente
                queryClient.setQueryData(AUTH_KEY, data.token);
                // Invalidar para forzar re-fetch
                queryClient.invalidateQueries({ queryKey: AUTH_KEY });
            }
            return data;
        },
        onError: (error) => {
            console.error("Login falló:", getErrorMessage(error));
            throw new Error(
                getErrorMessage(error) ||
                    "Error desconocido en el inicio de sesión"
            );
        },
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserRepository.logoutUser,
        onSuccess: async () => {
            // Remover el token del storage
            await removeToken();
            // Limpiar el cache de autenticación
            queryClient.setQueryData(AUTH_KEY, null);
            // Limpiar todo el cache
            queryClient.clear();
        },
        onError: async () => {
            // Aunque falle la petición al servidor, limpiar localmente
            await removeToken();
            queryClient.setQueryData(AUTH_KEY, null);
            queryClient.clear();
        },
    });
};

export const useIsAuthenticated = () => {
    return useQuery({
        queryKey: AUTH_KEY,
        queryFn: async () => {
            const token = await getToken();
            return token;
        },
        staleTime: 0, // Siempre verificar el token
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
};

export const useUsers = () => {
    const { data: token } = useIsAuthenticated();

    return useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: UserRepository.getUsers,
        enabled: !!token,
    });
};
