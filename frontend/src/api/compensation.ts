import { api } from "./client";
import type {
  CompensationListResponse,
  CompensationQuery,
  CompensationSummary,
  SummaryParams,
  ComparisonRow,
  CompareParams,
  ApiItemResponse,
} from "../types/compensation";

export async function getCompensation(
  query: CompensationQuery,
): Promise<CompensationListResponse> {
  return (await api.get<CompensationListResponse>("/compensation", { params: query })).data;
}

export async function getCompensationSummary(
  params: SummaryParams,
): Promise<CompensationSummary> {
  // Backend wraps result in { success, data: {...} }; unwrap the inner data object.
  const res = await api.get<ApiItemResponse<CompensationSummary>>(
    "/compensation/summary",
    { params },
  );
  return res.data.data;
}

export async function compareCompensation(
  params: CompareParams,
): Promise<ComparisonRow[]> {
  // Backend wraps result in { success, filters, data: [...] }; unwrap the array.
  const res = await api.get<ApiItemResponse<ComparisonRow[]>>("/compensation/compare", {
    params: {
      roleId: params.roleId,
      levelId: params.levelId,
      locationId: params.locationId,
      companyIds: params.companyIds.join(","),
    },
  });
  return res.data.data;
}