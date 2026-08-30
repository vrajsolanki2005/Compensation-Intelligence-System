import { useEffect, useState } from "react";
import { useMetadata } from "../../hooks/useMetadata";
import { useDebounce } from "../../hooks/useDebounce";
import { SelectField } from "./SelectField";

export interface FilterValues {
  roleId: string;
  levelId: string;
  locationId: string;
  companyId: string;
  minTC: string;
  maxTC: string;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  onReset: () => void;
}

export function FilterBar({ values, onChange, onReset }: FilterBarProps) {
  const { roles, levels, locations, companies } = useMetadata();

  // Total-comp range is typed locally and debounced before it hits the URL.
  const [tc, setTc] = useState({ min: values.minTC, max: values.maxTC });
  const debouncedTc = useDebounce(tc, 500);

  // Re-sync when the URL changes from the outside (reset, shared link).
  useEffect(() => {
    setTc({ min: values.minTC, max: values.maxTC });
  }, [values.minTC, values.maxTC]);

  useEffect(() => {
    if (debouncedTc.min !== values.minTC || debouncedTc.max !== values.maxTC) {
      onChange({ minTC: debouncedTc.min, maxTC: debouncedTc.max });
    }
  }, [debouncedTc.min, debouncedTc.max]); // push only when the debounce settles

  const hasFilters = Object.values(values).some((v) => v !== "");
  const opts = (list: { id: number; name: string }[]) =>
    list.map((x) => ({ value: String(x.id), label: x.name }));

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Role"
          placeholder="All roles"
          value={values.roleId}
          onChange={(v) => onChange({ roleId: v })}
          options={opts(roles)}
        />
        <SelectField
          label="Level"
          placeholder="All levels"
          value={values.levelId}
          onChange={(v) => onChange({ levelId: v })}
          options={opts(levels)}
        />
        <SelectField
          label="Location"
          placeholder="All locations"
          value={values.locationId}
          onChange={(v) => onChange({ locationId: v })}
          options={opts(locations)}
        />
        <SelectField
          label="Company"
          placeholder="All companies"
          value={values.companyId}
          onChange={(v) => onChange({ companyId: v })}
          options={opts(companies)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <span className="mb-1.5 block text-xs text-muted">Total compensation (₹ lakh)</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              aria-label="Minimum total compensation"
              placeholder="Min"
              value={tc.min}
              onChange={(e) => setTc((t) => ({ ...t, min: e.target.value }))}
              className="fig h-9 w-24 rounded border border-line bg-surface px-2.5 text-sm placeholder:font-sans placeholder:text-faint hover:border-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
            <span className="text-faint">–</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              aria-label="Maximum total compensation"
              placeholder="Max"
              value={tc.max}
              onChange={(e) => setTc((t) => ({ ...t, max: e.target.value }))}
              className="fig h-9 w-24 rounded border border-line bg-surface px-2.5 text-sm placeholder:font-sans placeholder:text-faint hover:border-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          className="h-9 rounded border border-line bg-surface px-4 text-sm font-medium hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        >
          Reset
        </button>
      </div>
    </div>
  );
}