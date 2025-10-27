import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loan, loanRepository } from "../repositories/loanRepository";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["loan"];

export const useAllLoans = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: loanRepository.getAll,
    enabled: !!token,
  });
};

export const useCreateLoan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: loan) => loanRepository.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: loan }) => loanRepository.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useDeleteLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id : number) => loanRepository.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};