import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Artefact,
  ArtefactRepository,
} from "../repositories/artefactRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["artefacts"];

export const useArtefacts = (filters?: { shelfId?: number }) => {
  const { data: token } = useIsAuthenticated();
  const key = filters ? [...KEY, JSON.stringify(filters)] : KEY;
  return useQuery({
    queryKey: key,
    queryFn: () => ArtefactRepository.getAll(filters),
    enabled: !!token,
  });
};

export const useArtefact = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => ArtefactRepository.getById(id as number),
    enabled: !!token && !!id,
  });
};

export const useCreateArtefact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Artefact) => ArtefactRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateArtefact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Artefact }) =>
      ArtefactRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useDeleteArtefact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ArtefactRepository.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useUploadArtefactPicture = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      ArtefactRepository.uploadPicture(id, file),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useUploadArtefactHistoricalRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      ArtefactRepository.uploadHistoricalRecord(id, file),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};