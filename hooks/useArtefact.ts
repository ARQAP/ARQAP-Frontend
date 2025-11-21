// src/hooks/useArtefact.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Artefact,
  ArtefactRepository,
  ArtefactSummary,
} from "../repositories/artefactRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["artefacts"];
const SUMMARY_KEY = ["artefactSummaries"];

// Lista completa de artefactos (endpoint /artefacts)
export const useArtefacts = (filters?: { shelfId?: number }) => {
  const { data: token } = useIsAuthenticated();
  const key = filters ? [...KEY, JSON.stringify(filters)] : KEY;

  return useQuery({
    queryKey: key,
    queryFn: () => ArtefactRepository.getAll(filters),
    enabled: !!token,
  });
};

// Un artefacto por ID (endpoint /artefacts/:id)
export const useArtefact = (id?: number) => {
  const { data: token } = useIsAuthenticated();

  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => ArtefactRepository.getById(id as number),
    enabled: !!token && !!id,
  });
};

// 🔹 NUEVO: lista resumida (endpoint /artefacts/summary)
export const useArtefactSummaries = (filters?: { shelfId?: number }) => {
  const { data: token } = useIsAuthenticated();
  const key = filters ? [...SUMMARY_KEY, JSON.stringify(filters)] : SUMMARY_KEY;

  return useQuery({
    queryKey: key,
    queryFn: () => ArtefactRepository.getSummaries(filters),
    enabled: !!token,
  });
};

// Crear artefacto
export const useCreateArtefact = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Artefact) => ArtefactRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// Actualizar artefacto
export const useUpdateArtefact = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Artefact }) =>
      ArtefactRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// Eliminar artefacto
export const useDeleteArtefact = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ArtefactRepository.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// Subir foto
export const useUploadArtefactPicture = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      ArtefactRepository.uploadPicture(id, file),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// Subir registro histórico
export const useUploadArtefactHistoricalRecord = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      ArtefactRepository.uploadHistoricalRecord(id, file),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// Crear artefacto + menciones
export const useCreateArtefactWithMentions = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      artefact: Artefact;
      mentions: Array<{
        title: string;
        link?: string | null;
        description?: string | null;
      }>;
    }) => ArtefactRepository.createWithMentions(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};
