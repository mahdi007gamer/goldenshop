"use client";

import useSWR from "swr";
import { useCallback } from "react";

interface CurrencyData {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

interface CurrencyResult {
  rate: number | null;
  isLoading: boolean;
  isError: boolean;
  lastUpdated: Date | null;
  mutate: () => Promise<void>;
}

const FALLBACK_RATE = 500_000;

const fetcher = async (url: string): Promise<CurrencyData> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Currency fetch failed");
  const json = await res.json();
  if (!json.success || !json.data?.rate) throw new Error("Invalid response");
  return json.data;
};

export function useCurrency(): CurrencyResult {
  const { data, error, isLoading, mutate } = useSWR<CurrencyData>(
    "/api/currency",
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000,
    }
  );

  const doMutate = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    rate: data?.rate ?? null,
    isLoading,
    isError: !!error,
    lastUpdated: data?.timestamp ? new Date(data.timestamp) : null,
    mutate: doMutate,
  };
}

export { FALLBACK_RATE };
