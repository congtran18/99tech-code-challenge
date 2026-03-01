import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchTokens } from "../services/price.service";
import type { FetchState } from "../types/token.types";

interface UseTokenPricesReturn {
  readonly fetchState: FetchState;
  readonly priceMap: ReadonlyMap<string, number>;
  readonly retry: () => void;
}

export function useTokenPrices(): UseTokenPricesReturn {
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setFetchState({ status: "loading" });
    fetchTokens(controller.signal)
      .then((tokens) => setFetchState({ status: "success", data: tokens }))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "CanceledError") return;
        setFetchState({
          status: "error",
          message: "Unable to load token prices.",
        });
      });
    return () => controller.abort();
  }, [retryCount]);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const tokens = fetchState.status === "success" ? fetchState.data : null;

  const priceMap = useMemo<ReadonlyMap<string, number>>(() => {
    if (!tokens) return new Map();
    return new Map(tokens.map((t) => [t.currency, t.price]));
  }, [tokens]);

  return { fetchState, priceMap, retry };
}
