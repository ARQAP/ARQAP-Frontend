import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";
import {
  InternalClassifier,
  InternalClassifierRepository,
} from "@/repositories/internalClassifierRepository";

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

export const useInternalClassifier = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => InternalClassifierRepository.getById(id as number),
    enabled: !!token && !!id,
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
