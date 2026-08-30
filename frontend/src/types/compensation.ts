export interface Company {
  id: number;
  name: string;
  sector: string | null;
}

export interface Role {
  id: number;
  name: string;
}

export interface Level {
  id: number;
  name: string;
  rank: number | null;
}

export interface Location {
  id: number;
  name: string;
}

export interface CompensationRecord {
  id: number;
  companyId: number;
  companyName: string;
  roleId: number;
  roleName: string;
  levelId: number;
  levelName: string;
  locationId: number;
  locationName: string;
  base: number;
  bonus: number;
  equity: number;
  totalCompensation: number;
  experience: number | null;
  verified: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface CompensationListResponse {
  data: CompensationRecord[];
  pagination: Pagination;
}

export interface Percentiles {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface CompensationSummary {
  sampleCount: number;
  base: Percentiles;
  bonus: Percentiles;
  equity: Percentiles;
  totalCompensation: Percentiles;
}

export interface CompensationQuery {
  roleId?: number;
  levelId?: number;
  locationId?: number;
  companyId?: number;
  minTC?: number;
  maxTC?: number;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SummaryParams {
  roleId: number;
  levelId: number;
  locationId: number;
  companyId?: number;
}

export interface ComparisonRow {
  companyId: number;
  companyName: string;
  base: number;
  bonus: number;
  equity: number;
  totalCompensation: number;
  sampleCount: number;
}

export interface CompareParams {
  roleId: number;
  levelId: number;
  locationId: number;
  companyIds: number[];
}

export interface CompanyLevelSummary {
  levelId: number;
  levelName: string;
  medianTotalCompensation: number;
  sampleCount: number;
}

export interface CompanySummaryResponse {
  levels: CompanyLevelSummary[];
}