import { api } from "./client";
import type { ApiListResponse, Company, Role, Level, Location } from "../types/compensation";

export async function getCompanies(): Promise<Company[]> {
  const res = await api.get<ApiListResponse<Company>>("/companies");
  return res.data.data;
}

export async function getRoles(): Promise<Role[]> {
  const res = await api.get<ApiListResponse<Role>>("/roles");
  return res.data.data;
}

export async function getLevels(): Promise<Level[]> {
  const res = await api.get<ApiListResponse<Level>>("/levels");
  return res.data.data;
}

export async function getLocations(): Promise<Location[]> {
  const res = await api.get<ApiListResponse<Location>>("/locations");
  return res.data.data;
}