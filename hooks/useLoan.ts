import { Loan, LoanRepository } from "@/repositories/loanRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsAuthenticated } from "./useUserAuth";

const KEY = ["loans"];

// Claves de queries de artefactos para invalidar cuando cambia la disponibilidad
const ARTEFACT_KEY = ["artefacts"];
const ARTEFACT_SUMMARY_KEY = ["artefact_summaries"];

export const useLoans = () => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: LoanRepository.getAll,
    enabled: !!token,
    staleTime: 10_000,
  });
};

export const useLoan = (id?: number) => {
  const { data: token } = useIsAuthenticated();
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => LoanRepository.getById(id as number),
    enabled: !!token && !!id,
  });
};

export const useCreateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Loan) => LoanRepository.create(payload),
    onSuccess: () => {
      // Invalidar queries de préstamos
      qc.invalidateQueries({ queryKey: KEY });
      // Invalidar queries de artefactos porque la disponibilidad cambió
      qc.invalidateQueries({ queryKey: ARTEFACT_KEY });
      qc.invalidateQueries({ queryKey: ARTEFACT_SUMMARY_KEY });
    },
  });
};

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Loan }) =>
      LoanRepository.update(id, payload),
    onSuccess: (_data, { id }) => {
      // Invalidar queries de préstamos
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
      // Invalidar queries de artefactos porque la disponibilidad puede cambiar
      qc.invalidateQueries({ queryKey: ARTEFACT_KEY });
      qc.invalidateQueries({ queryKey: ARTEFACT_SUMMARY_KEY });
    },
  });
};

export const useDeleteLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => LoanRepository.remove(id),
    onSuccess: (_data, id) => {
      // Invalidar queries de préstamos
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, id] });
      // Invalidar queries de artefactos porque la disponibilidad puede cambiar
      qc.invalidateQueries({ queryKey: ARTEFACT_KEY });
      qc.invalidateQueries({ queryKey: ARTEFACT_SUMMARY_KEY });
    },
  });
};
