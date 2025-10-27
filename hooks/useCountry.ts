import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Country, CountryRepository } from "../repositories/countryRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["countries"];

export const useAllCountries = () => {
    const { data: token } = useIsAuthenticated();
    return useQuery({
    queryKey: KEY,
    queryFn: CountryRepository.getAll,
    enabled: !!token,
    });
}

export const useCountry = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: ["countries", id],
    queryFn: () => CountryRepository.get(id!),
    enabled: !!token && typeof id === "number",
  });
}; 

export const useCreateCountry = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Country) => CountryRepository.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useUpdateCountry = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Country }) => CountryRepository.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useDeleteCountry = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id : number) => CountryRepository.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};
