import {
  InternalClassifier,
  InternalClassifierRepository,
} from "@/repositories/internalClassifierRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["internalClassifiers"];

export const useInternalClassifiers = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: InternalClassifierRepository.getAll,
    enabled: !!token,
    staleTime: 60_000,
  });
};

export const useInternalClassifier = (name?: string) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, "name", name],
    queryFn: () => InternalClassifierRepository.getByName(name as string),
    enabled: !!token && !!name,
    staleTime: 60_000,
  });
};

export const useCreateInternalClassifier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InternalClassifier) =>
      InternalClassifierRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateInternalClassifier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InternalClassifier }) =>
      InternalClassifierRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useDeleteInternalClassifier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => InternalClassifierRepository.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useInternalClassifierNames = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, "names"],
    queryFn: InternalClassifierRepository.getAllNames,
    enabled: !!token,
    staleTime: 60_000,
  });
};
