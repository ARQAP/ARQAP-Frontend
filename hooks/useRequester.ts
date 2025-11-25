import {
  Requester,
  RequesterRepository,
} from "@/repositories/requesterRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["requesters"];

export const useRequesters = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: RequesterRepository.getAll,
    enabled: !!token,
    staleTime: 10_000,
  });
};

export const useRequester = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => RequesterRepository.getById(id as number),
    enabled: !!token && !!id,
  });
};

export const useCreateRequester = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Requester) => RequesterRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateRequester = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Requester }) =>
      RequesterRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};

export const useDeleteRequester = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RequesterRepository.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
    },
  });
};
