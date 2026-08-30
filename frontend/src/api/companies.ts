import { api } from "./client";
import type { Company, CompanySummaryResponse, ApiItemResponse } from "../types/compensation";

export async function getCompany(id: number): Promise<Company> {
  // Backend returns { success: true, data: company }; unwrap the inner data.
  return (await api.get<ApiItemResponse<Company>>(`/companies/${id}`)).data.data;
}

export async function getCompanyCompensationSummary(
  id: number,
): Promise<CompanySummaryResponse> {
  // Backend returns { success: true, data: { levels: [...] } }; unwrap the inner data.
  return (await api.get<ApiItemResponse<CompanySummaryResponse>>(`/companies/${id}/compensation-summary`)).data.data;
}