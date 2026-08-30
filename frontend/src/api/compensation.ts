import { api } from "./client";
import type {
  CompensationListResponse,
  CompensationQuery,
  CompensationSummary,
  SummaryParams,
  ComparisonRow,
  CompareParams,
} from "../types/compensation";

export async function getCompensation(
  query: CompensationQuery,
): Promise<CompensationListResponse> {
  return (await api.get<CompensationListResponse>("/compensation", { params: query })).data;
}

export async function getCompensationSummary(
  params: SummaryParams,
): Promise<CompensationSummary> {
  return (await api.get<CompensationSummary>("/compensation/summary", { params })).data;
}

export async function compareCompensation(
  params: CompareParams,
): Promise<ComparisonRow[]> {
  return (
    await api.get<ComparisonRow[]>("/compensation/compare", {
      params: {
        roleId: params.roleId,
        levelId: params.levelId,
        locationId: params.locationId,
        companyIds: params.companyIds.join(","),
      },
    })
  ).data;
}