import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";
import {
  INPLRepository,
  INPLClassifierDTO,
  INPLFichaDTO,
} from "@/repositories/inplClassifierRepository";

const KEY_CLASSIFIERS = ["inplClassifiers"];
const KEY_CLASSIFIER = (id?: number) => [...KEY_CLASSIFIERS, id];
const KEY_FICHAS = (classifierId?: number) => [...KEY_CLASSIFIERS, "fichas", classifierId];

export const useINPLClassifiers = (preload: boolean = true) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY_CLASSIFIERS, { preload }],
    queryFn: () => INPLRepository.getAll(preload),
    enabled: !!token,
    staleTime: 60_000,
  });
};

export const useINPLClassifier = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY_CLASSIFIER(id),
    queryFn: () => INPLRepository.getById(id as number),
    enabled: !!token && !!id,
    staleTime: 60_000,
  });
};

export const useCreateINPLClassifier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => INPLRepository.create(files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIERS });
    },
  });
};

export const useAddINPLFichas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classifierId, files }: { classifierId: number; files: File[] }) =>
      INPLRepository.addFichas(classifierId, files),
    onSuccess: (data, { classifierId }) => {
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIERS });
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIER(classifierId) });
      qc.invalidateQueries({ queryKey: KEY_FICHAS(classifierId) });
    },
  });
};

export const useReplaceINPLFicha = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fichaId, file }: { fichaId: number; file: File }) =>
      INPLRepository.replaceFicha(fichaId, file),
    onSuccess: (updated) => {
      const cid = updated.inplClassifierId;
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIERS });
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIER(cid) });
      qc.invalidateQueries({ queryKey: KEY_FICHAS(cid) });
    },
  });
};

export const useDeleteINPLFicha = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fichaId: number) => INPLRepository.deleteFicha(fichaId),
    onSuccess: (_r, fichaId) => {
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIERS });
      qc.invalidateQueries({ queryKey: KEY_FICHAS(undefined) });
    },
  });
};

export const useDeleteINPLClassifier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => INPLRepository.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_CLASSIFIERS });
    },
  });
};

export const useINPLFichasByClassifier = (classifierId?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY_FICHAS(classifierId),
    queryFn: () => INPLRepository.listFichasByClassifier(classifierId as number),
    enabled: !!token && !!classifierId,
    staleTime: 60_000,
  });
};
