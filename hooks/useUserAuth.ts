import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRepository } from '../repositories/userRepository';
import { getToken } from '../services/authStorage';

// Claves de TanStack Query
const USERS_QUERY_KEY = ['users'];
const AUTH_KEY = ['auth'];

const getErrorMessage = (error: any) => {
    return error.response?.data?.error || error.response?.data?.message || error.message;
};


export const useLoginMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserRepository.loginUser,
        
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: AUTH_KEY }); 
            return data; 
        },
        onError: (error) => {
            console.error("Login falló:", getErrorMessage(error));
            throw new Error(getErrorMessage(error) || "Error desconocido en el inicio de sesión"); 
        }
    });
};


export const useLogoutMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: UserRepository.logoutUser,
        onSuccess: () => {
            queryClient.clear(); 
            queryClient.invalidateQueries({ queryKey: AUTH_KEY });
        },
    });
};


export const useIsAuthenticated = () => {
    return useQuery({
        queryKey: AUTH_KEY,
        queryFn: getToken, 
        staleTime: Infinity, 
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