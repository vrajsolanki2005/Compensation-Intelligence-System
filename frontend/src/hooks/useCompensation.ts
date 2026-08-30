import { useEffect, useState } from "react";
import {
  getCompensation,
  getCompensationSummary,
  compareCompensation,
} from "../api/compensation";
import type {
  CompensationQuery,
  CompensationRecord,
  CompensationSummary,
  SummaryParams,
  ComparisonRow,
  CompareParams,
} from "../types/compensation";

export function useCompensationList(query: CompensationQuery) {
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  // The query object is rebuilt on every render of the caller, so compare by
  // value to avoid refetching when nothing actually changed.
  const key = JSON.stringify(query);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getCompensation(query)
      .then((res) => {
        if (cancelled) return;
        setRecords(res.data);
        setTotal(res.pagination.total);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRecords([]);
        setTotal(0);
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, nonce]);

  return { records, total, loading, error, retry: () => setNonce((n) => n + 1) };
}

export function useCompensationSummary(params: SummaryParams | null) {
  const [data, setData] = useState<CompensationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify(params);

  useEffect(() => {
    if (!params) {
      setData(null);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getCompensationSummary(params)
      .then((summary) => {
        if (cancelled) return;
        setData(summary);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, nonce]);

  return { data, loading, error, retry: () => setNonce((n) => n + 1) };
}

export function useComparison(params: CompareParams | null) {
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify(params);

  useEffect(() => {
    if (!params) {
      setRows([]);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    compareCompensation(params)
      .then((result) => {
        if (cancelled) return;
        setRows(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRows([]);
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, nonce]);

  return { rows, loading, error, retry: () => setNonce((n) => n + 1) };
}