import {
  Collection,
  CollectionRepository,
} from "@/repositories/collectionRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["collections"];

export const useCollections = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: CollectionRepository.getAll,
    enabled: !!token,
    staleTime: 10_000,
  });
};

export const useCreateCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Collection) => CollectionRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Collection }) =>
      CollectionRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useDeleteCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => CollectionRepository.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};
