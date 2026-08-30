import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCompanies, getRoles, getLevels, getLocations } from "../api/metadata";
import type { Company, Role, Level, Location } from "../types/compensation";

interface MetadataState {
  companies: Company[];
  roles: Role[];
  levels: Level[];
  locations: Location[];
  loading: boolean;
  error: boolean;
  reload: () => void;
  roleName: (id: number) => string | undefined;
  levelName: (id: number) => string | undefined;
  locationName: (id: number) => string | undefined;
  companyName: (id: number) => string | undefined;
}

const MetadataContext = createContext<MetadataState | null>(null);

export function MetadataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      const results = await Promise.allSettled([
        getCompanies(),
        getRoles(),
        getLevels(),
        getLocations(),
      ]);
      const labels = ["/companies", "/roles", "/levels", "/locations"];

      const failures = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );
      failures.forEach((f) => {
        console.error(`Failed to load metadata from ${labels[results.indexOf(f)]}`, f.reason);
      });

      if (cancelled) return;

      if (failures.length > 0) {
        // Partial data is worse than no data for filter dropdowns — surface the error.
        setError(true);
        setLoading(false);
        return;
      }

      const [c, r, l, loc] = results.map(
        (res) => (res as PromiseFulfilledResult<
          Company[] | Role[] | Level[] | Location[]
        >).value,
      );

      setCompanies(c as Company[]);
      setRoles(r as Role[]);
      setLevels(l as Level[]);
      setLocations(loc as Location[]);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const value = useMemo<MetadataState>(() => {
    const sortedLevels = [...levels].sort(
      (a, b) =>
        (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name, undefined, { numeric: true }),
    );

    const sortedCompanies = [...companies].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const nameOf = (list: { id: number; name: string }[], id: number) =>
      list.find((item) => item.id === id)?.name;

    return {
      companies: sortedCompanies,
      roles,
      levels: sortedLevels,
      locations,
      loading,
      error,
      reload: () => setNonce((n) => n + 1),
      roleName: (id) => nameOf(roles, id),
      levelName: (id) => nameOf(sortedLevels, id),
      locationName: (id) => nameOf(locations, id),
      companyName: (id) => nameOf(sortedCompanies, id),
    };
  }, [companies, roles, levels, locations, loading, error]);

  return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
}

export function useMetadata(): MetadataState {
  const ctx = useContext(MetadataContext);
  if (!ctx) throw new Error("useMetadata must be used within MetadataProvider");
  return ctx;
}