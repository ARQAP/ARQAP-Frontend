import {
  Shelf,
  ShelfRepository,
} from "@/repositories/shelfRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["shelfs"];

export const useShelves = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: ShelfRepository.getAll,
    enabled: !!token,
    staleTime: 10_000,
  });
};

export const useShelf = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => ShelfRepository.getById(id as number),
    enabled: !!token && !!id,
    staleTime: 10_000,
  });
};

export const useCreateShelf = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Shelf) => ShelfRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateShelf = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Shelf }) =>
      ShelfRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useDeleteShelf = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ShelfRepository.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};
