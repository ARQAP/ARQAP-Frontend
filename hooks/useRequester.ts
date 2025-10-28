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
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteRequester = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RequesterRepository.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
