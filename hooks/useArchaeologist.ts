import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archaeologist, ArchaeologistRepository } from "../repositories/archaeologistRespository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["archaeologists"];

export const useArchaeologists = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: ArchaeologistRepository.getAll,
    enabled: !!token,
  });
};

export const useCreateArchaeologist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Archaeologist) => ArchaeologistRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateArchaeologist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Archaeologist }) =>
      ArchaeologistRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useDeleteArchaeologist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ArchaeologistRepository.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};