import { api } from "./client";
import type { Company, CompanySummaryResponse } from "../types/compensation";

export async function getCompany(id: number): Promise<Company> {
  return (await api.get<Company>(`/companies/${id}`)).data;
}

export async function getCompanyCompensationSummary(
  id: number,
): Promise<CompanySummaryResponse> {
  return (await api.get<CompanySummaryResponse>(`/companies/${id}/compensation-summary`)).data;
}