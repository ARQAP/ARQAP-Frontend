import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchaeologicalSite, ArchaeologicalSiteRepository } from "../repositories/archaeologicalsiteRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["archaeologicalsites"];

export const useAllArchaeologicalSites = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: ArchaeologicalSiteRepository.getAll,
    enabled: !!token,
  });
};

export const useCreateArchaeologicalSite = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: ArchaeologicalSite) => ArchaeologicalSiteRepository.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useUpdateArchaeologicalSite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ArchaeologicalSite }) => ArchaeologicalSiteRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useDeleteArchaeologicalSite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id : number) => ArchaeologicalSiteRepository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};