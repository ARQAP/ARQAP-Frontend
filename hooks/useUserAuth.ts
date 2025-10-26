// src/hooks/useUserAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Eliminamos la importación de LoginCredentials ya que no es usada aquí directamente
import { UserRepository } from '../repositories/userRepository';
import { getToken } from '../services/authStorage'; // Necesitamos esto para la validación

// Claves de TanStack Query
const USERS_QUERY_KEY = ['users'];
const AUTH_KEY = ['auth'];

// Función de ayuda para extraer el mensaje de error de Axios
const getErrorMessage = (error: any) => {
    // 💡 Corrección de TypeScript: Acceder de forma segura a response.data
    return error.response?.data?.error || error.response?.data?.message || error.message;
};


// 1. Mutación para Login
export const useLoginMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserRepository.loginUser,
        
        onSuccess: (data) => {
            // Marca el estado de autenticación como "actualizado"
            queryClient.invalidateQueries({ queryKey: AUTH_KEY }); 
            // El return data aquí es opcional
            return data; 
        },
        onError: (error) => {
            console.error("Login falló:", getErrorMessage(error));
            // Devolver un error amigable para ser usado en el componente
            throw new Error(getErrorMessage(error) || "Error desconocido en el inicio de sesión"); 
        }
    });
};


// 2. Mutación para Logout
export const useLogoutMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserRepository.logoutUser,
        onSuccess: () => {
            // Limpia completamente el caché de datos y notifica un cambio en el estado de autenticación
            queryClient.clear(); 
            queryClient.invalidateQueries({ queryKey: AUTH_KEY });
        },
    });
};


// 3. Query para verificar si el usuario está autenticado (AUTH HOOK)
// Este hook es crucial para el 'enabled' de las queries protegidas.
export const useIsAuthenticated = () => {
    return useQuery({
        queryKey: AUTH_KEY,
        // La función queryFn solo verifica si el token existe localmente
        queryFn: getToken, 
        // El token no cambia a menudo, así que lo mantenemos fresco por más tiempo
        staleTime: Infinity, 
    });
};


// 4. Query Protegida (Lista de Usuarios)
export const useUsers = () => {
    // Obtenemos el estado de autenticación
    const { data: token } = useIsAuthenticated(); 

    return useQuery({
        queryKey: USERS_QUERY_KEY,
        queryFn: UserRepository.getUsers,
        // 💡 CLAVE DE SEGURIDAD: La Query solo se ejecuta si hay un token válido
        enabled: !!token, 
    });
};