import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";
import { InternalMovement, InternalMovementRepository } from "@/repositories/internalMovementRepository";

const KEY = ["internal-movements"];

export const useInternalMovements = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: InternalMovementRepository.getAll,
    enabled: !!token,
    staleTime: 60_000,
  });
};

export const useInternalMovement = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => InternalMovementRepository.getById(id as number),
    enabled: !!token && !!id,
  });
};

export const useInternalMovementsByArtefactId = (artefactId?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, "artefact", artefactId],
    queryFn: () => InternalMovementRepository.getByArtefactId(artefactId as number),
    enabled: !!token && !!artefactId,
    staleTime: 60_000,
  });
};

export const useActiveInternalMovementByArtefactId = (artefactId?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, "artefact", artefactId, "active"],
    queryFn: () => InternalMovementRepository.getActiveByArtefactId(artefactId as number),
    enabled: !!token && !!artefactId,
    staleTime: 60_000,
  });
};

export const useCreateInternalMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InternalMovement) => InternalMovementRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useCreateBatchInternalMovements = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payloads: InternalMovement[]) => InternalMovementRepository.createBatch(payloads),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateInternalMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InternalMovement }) =>
      InternalMovementRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useDeleteInternalMovement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => InternalMovementRepository.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

